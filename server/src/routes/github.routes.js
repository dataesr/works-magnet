import crypto from 'crypto';
import express from 'express';
import { Octokit } from 'octokit';

const auth = process.env.GITHUB_PAT;
const router = new express.Router();

const ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;

const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(process.env.SECRET_KEY, 'utf8'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

const createIssue = (issue, email) => {
  const octokit = new Octokit({ auth });
  const title = `Correction for raw affiliation ${issue.rawAffiliationString}`;
  let body = `Correction needed for raw affiliation ${issue.rawAffiliationString}\n`;
  body += `raw_affiliation_name: ${issue.rawAffiliationString}\n`;
  body += `new_rors: ${issue.correctedRors}\n`;
  const previousRoRs = issue.rorsInOpenAlex.map((e) => e.rorId).join(';');
  body += `previous_rors: ${previousRoRs}\n`;
  const workIds = issue.worksExample.filter((e) => e.id_type === 'openalex').map((e) => e.id_value).join(';');
  body += `works_examples: ${workIds}\n`;
  body += `contact: ${encrypt(email.split('@')[0])} @ ${email.split('@')[1]}\n`;
  octokit.rest.issues.create({
    body,
    owner: 'dataesr',
    repo: 'openalex-affiliations',
    title,
  });
};

router.route('/github-issue')
  .post(async (req, res) => {
    const data = req.body?.data || [];
    const email = req.body?.email || '';
    const promises = data.map((item) => createIssue(item, email));
    await Promise.all(promises);
    res.status(200).json({ message: 'GitHub Issues created' });
  });

export default router;
