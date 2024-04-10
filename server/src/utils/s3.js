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

const isCached = async ({ searchId }) => {
  const storage = await getStorage();
  const files = await storage.containers().list(container);
  const filteredFiles = files.filter((file) => file?.name === `${searchId}.json`);
  return (filteredFiles?.length ?? 0) > 0;
};

const saveCache = async ({ result, searchId }) => {
  const storage = await getStorage();
  const fileName = `${searchId}.json`;
  const localPath = `/tmp/${fileName}`;
  await fs.writeFileSync(localPath, JSON.stringify(result));
  const remotePath = `/${container}/${fileName}`;
  await storage.objects().saveFile(localPath, remotePath);
  // const tmp = await storage.objects().expire_after_with_result(remotePath, 86400); // 1 day - 24 hours
  // Delete local path
  await fs.unlinkSync(localPath);
};

const getCache = async ({ searchId }) => {
  const storage = await getStorage();
  const fileName = `${searchId}.json`;
  // TODO measure if cache is less than 24 hours old
  const files = await storage.containers().list(container);
  const filteredFiles = files.filter((file) => file?.name === fileName);
  if (filteredFiles.length > 0) {
    const remotePath = `/${container}/${filteredFiles?.[0]?.name}`;
    const localPath = `/tmp/${filteredFiles?.[0]?.name}`;
    await storage.objects().download(remotePath, localPath);
    const data = fs.readFileSync(localPath, { encoding: 'utf8', flag: 'r' });
    // Delete local path
    await fs.unlinkSync(localPath);
    return JSON.parse(data);
  }
  return false;
};

export {
  getCache,
  isCached,
  saveCache,
};
