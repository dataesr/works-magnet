import { execSync } from 'child_process';
import express from 'express';

const router = new express.Router();

const key = process.env.OS_PASSWORD;
const projectName = process.env.OS_PROJECT_NAME;
const projectId = process.env.OS_TENANT_ID;
const tenantName = process.env.OS_TENANT_NAME;
const username = process.env.OS_USERNAME;
const user = `${tenantName}:${username}`;

router.route('/download')
  .get(async (_, res) => {
    const container = 'works-finder';
    // eslint-disable-next-line max-len
    const initCmd = `swift --os-auth-url https://auth.cloud.ovh.net/v3 --auth-version 3 --key ${key} --user ${user} --os-project-domain-name Default --os-project-id ${projectId} --os-project-name ${projectName} --os-region-name GRA`;
    const cmd = `${initCmd} list ${container} > list_files_${container}`;
    execSync(cmd);
    res.status(200).send('DONE');
  });

export default router;
