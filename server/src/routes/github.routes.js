import express from 'express';
import { Octokit } from 'octokit';

const router = new express.Router();

const auth = process.env.GITHUB_PAT;

const createIssue = (issue) => {
  const octokit = new Octokit({ auth });
  const title = `Correction for raw affiliation ${issue.rawAffiliationString}`;
  let body = `Correction needed for raw affiliation ${issue.rawAffiliationString}\n`;
  body = body.concat(`raw_affiliation_name: ${issue.rawAffiliationString}\n`);
  body = body.concat(`new_rors: ${issue.correctedRors}\n`);
  const previousRoRs = issue.rorsInOpenAlex.map((e) => e.rorId).join(';');
  body = body.concat(`previous_rors: ${previousRoRs}\n`);
  const workIds = issue.worksExample.filter((e) => e.id_type === 'openalex').map((e) => e.id_value).join(';');
  body = body.concat(`works_examples: ${workIds}`);
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
    const promises = data.map((item) => createIssue(item));
    await Promise.all(promises);
    res.status(200).json({ message: 'GitHub Issue created' });
  });

export default router;
