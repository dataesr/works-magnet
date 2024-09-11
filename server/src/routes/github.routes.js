import crypto from 'crypto';
import express from 'express';
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';

import { chunkArray } from '../utils/utils';
import webSocketServer from '../webSocketServer';

const MyOctokit = Octokit.plugin(throttling);
const auth = process.env.GITHUB_PAT;
const router = new express.Router();

const ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;

const octokit = new MyOctokit({
  auth,
  request: { retryAfter: 10 },
  throttle: {
    onRateLimit: (retryAfter, options) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`,
      );
    },
    onSecondaryRateLimit: (retryAfter, options) => {
      // Retry 5 times after hitting a rate limit error after 5 seconds
      if (options.request.retryCount <= 5) {
        return true;
      }
      // Then logs a warning
      octokit.log.warn(
        `Secondary quota detected for request ${options.method} ${options.url}`,
      );
      return false;
    },
  },
});

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(process.env.SECRET_KEY, 'utf8'),
    iv,
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const createIssue = (issue, email) => {
  const title = `Correction for raw affiliation ${issue.rawAffiliationString}`;
  let body = `Correction needed for raw affiliation ${issue.rawAffiliationString}\n`;
  body += `raw_affiliation_name: ${issue.rawAffiliationString}\n`;
  body += `new_rors: ${issue.correctedRors}\n`;
  const previousRoRs = issue.rorsInOpenAlex.map((e) => e.rorId).join(';');
  body += `previous_rors: ${previousRoRs}\n`;
  let workIds = issue.worksExample
    .filter((e) => e.id_type === 'openalex')
    .map((e) => e.id_value)
    .join(';');
  if (issue.worksOpenAlex) {
    workIds = issue.worksOpenAlex.join(';');
  }
  body += `works_examples: ${workIds}\n`;
  body += `contact: ${encrypt(email.split('@')[0])} @ ${email.split('@')[1]}\n`;
  return octokit.rest.issues.create({
    body,
    owner: 'dataesr',
    repo: 'openalex-affiliations',
    title,
  });
};

router.route('/github-issue').post(async (req, res) => {
  const toast = {
    autoDismissAfter: 5000,
    description:
      'Your correction(s) are currently submitted to the <a href="https://github.com/dataesr/openalex-affiliations/issues" target="_blank">Github repository</a>',
    title: 'OpenAlex corrections submitted',
  };
  webSocketServer.broadcast(JSON.stringify(toast));

  const data = req.body?.data || [];
  const email = req.body?.email || '';
  const perChunk = 30;
  const results = [];
  for (const [i, d] of chunkArray({ array: data, perChunk }).entries()) {
    const promises = d.map((item) => createIssue(item, email).catch((error) => error));
    const r = await Promise.all(promises);
    results.push(...r);
    const toast = {
      description: `${Math.min(data.length, (i + 1) * perChunk)} / ${data.length} issue(s) submitted`,
      title: 'OpenAlex corrections are being processed',
    };
    webSocketServer.broadcast(JSON.stringify(toast));
  }
  const firstError = results.find(
    (result) => !result.status.toString().startsWith('2'),
  );
  res
    .status(firstError?.status ?? 200)
    .json({ message: firstError?.message ?? 'GitHub issues created' });
});

export default router;
