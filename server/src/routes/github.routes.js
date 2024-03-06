import express from 'express';
import { Octokit } from 'octokit';

const router = new express.Router();

const token = process.env.GITHUB_PAT;

const createIssue = (elt) => {
  const octokit = new Octokit({ auth: token });
  const title = `Correction for raw affiliation ${elt.rawAffiliationString}`;
  let body = `Correction needed for raw affiliation ${elt.rawAffiliationString}\n`;
  body = body.concat(`raw_affiliation_name: ${elt.rawAffiliationString}\n`);
  body = body.concat(`new_rors: ${elt.correctedRors}\n`);
  const previousRoRs = elt.rorsInOpenAlex.map((e) => e.rorId).join(';');
  body = body.concat(`previous_rors: ${previousRoRs}\n`);
  const workIds = elt.worksExample.filter((e) => e.id_type === 'openalex').map((e) => e.id_value).join(';');
  body = body.concat(`works_examples: ${workIds}`);
  octokit.rest.issues.create({
    owner: 'dataesr',
    repo: 'openalex-affiliations',
    title,
    body,
  });
};

router.route('/github-issue')
  .post(async (req, res) => {
    const data = req.body?.data || [];
    await data.reduce(async (a, elt) => {
      // Wait for the previous item to finish processing
      await a;
      // Process this item
      await createIssue(elt);
    }, Promise.resolve());
    res.status(200).json({ message: 'GitHub Issue created' });
  });

export default router;
