import { throttling } from '@octokit/plugin-throttling';
import { Octokit } from '@octokit/rest';
import crypto from 'crypto';

const MyOctokit = Octokit.plugin(throttling);
const auths = process.env.GITHUB_PATS.split(', ');

const ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;

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

const formatIssueOpenAlexAffiliations = ({ email, issue }) => {
  const {
    endYear = '',
    name,
    rors = [],
    rorsToCorrect = [],
    startYear = '',
    worksExample = [],
    worksOpenAlex = [],
  } = issue;
  let title = `Correction for raw affiliation ${name}`;
  // Github issue title is maximum 256 characters long
  if (title.length > 250) {
    title = `${title.slice(0, 250)}...`;
  }
  let body = `Correction needed for raw affiliation ${name}\n`;
  body += `raw_affiliation_name: ${name}\n`;
  body += `new_rors: ${rors.map((ror) => ror.rorId).join(';')}\n`;
  body += `previous_rors: ${rorsToCorrect.map((ror) => ror.rorId).join(';')}\n`;
  let workIds = '';
  if (worksExample) {
    workIds = worksExample
      .filter((e) => e.id_type === 'openalex')
      .map((e) => e.id_value)
      .join(';');
  }
  if (worksOpenAlex) {
    workIds = worksOpenAlex.join(';');
  }
  body += `works_examples: ${workIds}\n`;
  body += `searched between: ${startYear} - ${endYear}\n`;
  body += `contact: ${encrypt(email.split('@')[0])} @ ${email.split('@')[1]}\n`;
  body += `version: ${process.env.npm_package_version}-${process.env.NODE_ENV}`;
  return { body, title };
};

const formatIssueMentionsCharacterizations = ({ email, issue }) => {
  let title = `Correction for mention ${issue.id}`;
  // Github issue title is maximum 256 characters long
  if (title.length > 250) {
    title = `${title.slice(0, 250)}...`;
  }
  // eslint-disable-next-line no-param-reassign
  issue.user = `${encrypt(email.split('@')[0])} @ ${email.split('@')[1]}`;
  // eslint-disable-next-line no-param-reassign
  issue.version = `${process.env.npm_package_version}-${process.env.NODE_ENV}`;
  const body = `\`\`\`\n${JSON.stringify(issue, null, 4)}\n\`\`\``;
  return { body, title };
};

const getOctokitConnection = (auth) => {
  const octokit = new MyOctokit({
    // Randomly pick one of the Github PATs
    auth,
    request: { retryAfter: 10 },
    throttle: {
      onRateLimit: (_, options) => {
        octokit.log.warn(
          `Request quota exhausted for request ${options.method} ${options.url}`,
        );
      },
      onSecondaryRateLimit: (_, options) => {
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
  return octokit;
};

const createGithubIssue = ({ body, title, type }) => {
  // Create a new octokit for each issue in order to randomly choose a Github PAT to workaround Github API limitations
  const octokit = getOctokitConnection(auths[Math.floor(Math.random() * auths.length)]);
  if (['mentions-characterizations', 'openalex-affiliations'].includes(type)) {
    return octokit.rest.issues.create({ body, owner: 'dataesr', repo: type, title });
  }
  console.error(
    `Error wile creating Github issue as "type" should be one of ["mentions-characterizations", "openalex-affiliations"] instead of "${type}".`,
  );
  return false;
};

export { createGithubIssue, formatIssueMentionsCharacterizations, formatIssueOpenAlexAffiliations };
