import {
  PutObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import fs from 'fs';
import OVHStorage from 'node-ovh-objectstorage';

const {
  OS_ACCESS_KEY_ID,
  OS_CONTAINER_CACHE,
  OS_CONTAINER_CORRECTIONS_AFFILIATIONS,
  OS_PASSWORD,
  OS_REGION,
  OS_SECRET_ACCESS_KEY,
  OS_TENANT_ID,
  OS_TENANT_NAME,
  OS_USERNAME,
} = process.env;

const getStorage = async () => {
  const config = {
    username: OS_USERNAME,
    password: OS_PASSWORD,
    authURL: 'https://auth.cloud.ovh.net/v3/auth',
    tenantId: OS_TENANT_ID,
    region: OS_REGION,
  };
  const storage = new OVHStorage(config);
  await storage.connection();
  return storage;
};

const getFileName = (searchId) => `${searchId}.json`;

const getCache = async ({ searchId }) => {
  const fileName = getFileName(searchId);
  const storage = await getStorage();
  const files = await storage.containers().list(OS_CONTAINER_CACHE);
  const filteredFiles = files.filter((file) => file?.name === fileName);
  if (filteredFiles.length > 0) {
    const remotePath = `/${OS_CONTAINER_CACHE}/${fileName}`;
    const localPath = `/tmp/${fileName}`;
    await storage.objects().download(remotePath, localPath);
    const data = fs.readFileSync(localPath, { encoding: 'utf8', flag: 'r' });
    // Delete local path
    fs.unlinkSync(localPath);
    return JSON.parse(data);
  }
  return false;
};

const saveCache = async ({ result, searchId, queryId }) => {
  console.log(queryId, 'start saving cache');
  const fileName = getFileName(searchId);
  const remotePath = `${OS_CONTAINER_CACHE}/${fileName}`;

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
    const resultJson = JSON.stringify(result);
    console.time(
      `7b. Query ${queryId} | Uploading data to cloud`,
    );
    await fetch(
      `https://storage.gra.cloud.ovh.net/v1/AUTH_${OS_TENANT_ID}/${remotePath}`,
      {
        body: resultJson,
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token, 'X-Delete-After': '604800' }, // 7 days
        method: 'PUT',
      },
    );
    console.timeEnd(
      `7b. Query ${queryId} | Uploading data to cloud`,
    );
  }
};

const saveIssue = async ({ fileContent, fileName }) => {
  const s3ClientConfig = {
    region: OS_REGION.toLowerCase(),
    credentials: {
      accessKeyId: OS_ACCESS_KEY_ID,
      secretAccessKey: OS_SECRET_ACCESS_KEY,
    },
    endpoint: {
      url: `https://s3.${OS_REGION.toLowerCase()}.io.cloud.ovh.net`,
    },
  };
  const client = new S3Client(s3ClientConfig);

  const command = new PutObjectCommand({
    Bucket: OS_CONTAINER_CORRECTIONS_AFFILIATIONS,
    Key: fileName,
    Body: fileContent,
  });

  try {
    return client.send(command);
  } catch (caught) {
    if (
      caught instanceof S3ServiceException
      && caught.name === 'EntityTooLarge'
    ) {
      console.error(
        `Error from S3 while uploading object to ${OS_CONTAINER_CORRECTIONS_AFFILIATIONS}. \
        The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
        or the multipart upload API (5TB max).`,
      );
    } else if (caught instanceof S3ServiceException) {
      console.error(
        `Error from S3 while uploading object to ${OS_CONTAINER_CORRECTIONS_AFFILIATIONS}.  ${caught.name}: ${caught.message}`,
      );
    } else {
      throw caught;
    }
    return false;
  }
};

export { getCache, saveCache, saveIssue };
