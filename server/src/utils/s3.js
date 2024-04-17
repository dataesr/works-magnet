import fs from 'fs';
import OVHStorage from 'node-ovh-objectstorage';

const { OS_CONTAINER, OS_PASSWORD, OS_TENANT_ID, OS_TENANT_NAME, OS_USERNAME } = process.env;

const getStorage = async () => {
  const config = {
    username: OS_USERNAME,
    password: OS_PASSWORD,
    authURL: 'https://auth.cloud.ovh.net/v3/auth',
    tenantId: OS_TENANT_ID,
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
  const files = await storage.containers().list(OS_CONTAINER);
  const filteredFiles = files.filter((file) => file?.name === fileName);
  if (filteredFiles.length > 0) {
    const remotePath = `/${OS_CONTAINER}/${fileName}`;
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
  const fileName = getFileName(searchId);
  const remotePath = `${OS_CONTAINER}/${fileName}`;

  const body = {
    auth: {
      identity: {
        methods: ['password'],
        password: {
          user: {
            name: OS_USERNAME,
            domain: { id: 'default' },
            password: OS_PASSWORD,
          },
        },
      },
      scope: {
        project: { name: OS_TENANT_NAME, domain: { id: 'default' } },
      },
    },
  };

  const response = await fetch('https://auth.cloud.ovh.net/v3/auth/tokens', {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const token = response?.headers?.get('x-subject-token');
  if (token) {
    await fetch(
      `https://storage.gra.cloud.ovh.net/v1/AUTH_${OS_TENANT_ID}/${remotePath}`,
      {
        body: JSON.stringify(result),
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token, 'X-Delete-After': '86400' }, // 24 hours
        method: 'PUT',
      },
    );
  }
};

export { getCache, saveCache };
