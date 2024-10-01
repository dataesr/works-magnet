import { throttling } from '@octokit/plugin-throttling';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';

const MyOctokit = Octokit.plugin(throttling);
const auth = process.env.GITHUB_PAT;

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
  let title = `Correction for raw affiliation ${issue.rawAffiliationString}`;
  if (title.length > 1000) {
    title = `${title.slice(0, 1000)}...`;
  }
  let body = `Correction needed for raw affiliation ${issue.rawAffiliationString}\n`;
  body += `raw_affiliation_name: ${issue.rawAffiliationString}\n`;
  body += `new_rors: ${issue.correctedRors}\n`;
  const previousRoRs = issue.rorsInOpenAlex.map((e) => e.rorId).join(';');
  body += `previous_rors: ${previousRoRs}\n`;
  let workIds = '';
  if (issue.worksExample) {
    workIds = issue.worksExample
      .filter((e) => e.id_type === 'openalex')
      .map((e) => e.id_value)
      .join(';');
  }
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

export {
  createIssue,
};
