import fs from 'fs';
import OVHStorage from 'node-ovh-objectstorage';

const container = process.env.OS_CONTAINER;

const getStorage = async () => {
  const config = {
    username: process.env.OS_USERNAME,
    password: process.env.OS_PASSWORD,
    authURL: 'https://auth.cloud.ovh.net/v3/auth',
    tenantId: process.env.OS_TENANT_ID,
    region: 'GRA',
  };
  const storage = new OVHStorage(config);
  await storage.connection();
  return storage;
};

const getFileName = (searchId) => `${searchId}.json`;

const getCache = async ({ searchId }) => {
  const fileName = getFileName(searchId);
  const storage = await getStorage();
  const files = await storage.containers().list(container);
  const filteredFiles = files.filter((file) => file?.name === fileName);
  if (filteredFiles.length > 0) {
    const remotePath = `/${container}/${fileName}`;
    const localPath = `/tmp/${fileName}`;
    await storage.objects().download(remotePath, localPath);
    const data = fs.readFileSync(localPath, { encoding: 'utf8', flag: 'r' });
    // Delete local path
    fs.unlinkSync(localPath);
    return JSON.parse(data);
  }
  return false;
};

const saveCache = async ({ result, searchId }) => {
  const storage = await getStorage();
  const fileName = getFileName(searchId);
  const remotePath = `/${container}/${fileName}`;
  await storage.objects().saveData(JSON.stringify(result), remotePath);
  // const tmp = await storage.objects().expire_after_with_result(remotePath, 86400); // 1 day - 24 hours
};

export {
  getCache,
  saveCache,
};
