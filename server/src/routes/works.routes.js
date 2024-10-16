import crypto from 'crypto';
import express from 'express';

import { getInstitutionIdFromRor } from '../utils/openalex';
import { getCache, saveCache } from '../utils/s3';
import { chunkArray, countUniqueValues, range } from '../utils/utils';
import {
  datasetsType,
  deduplicateWorks,
  getFosmWorks,
  getOpenAlexPublications,
  groupByAffiliations,
} from '../utils/works';

const SEED_MAX = 2048;
const USE_CACHE = true;

const router = new express.Router();

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const compressData = async (result) => {
  // Convert JSON to Stream
  const stream = new Blob([JSON.stringify(result)], {
    type: 'application/json',
  }).stream();
  const compressedReadableStream = stream.pipeThrough(
    new CompressionStream('gzip'),
  );
  // create Response
  const compressedResponse = await new Response(compressedReadableStream);
  const blob = await compressedResponse.blob();
  // Get the ArrayBuffer
  const buffer = await blob.arrayBuffer();
  // convert ArrayBuffer to base64 encoded string
  return arrayBufferToBase64(buffer);
};

const chunkAndCompress = (data) => {
  const chunks = chunkArray({ array: data, perChunk: 1000 });
  return Promise.all(chunks.map((c) => compressData(c)));
};

const getWorks = async ({ options, resetCache = false }) => {
  const shasum = crypto.createHash('sha1');
  shasum.update(JSON.stringify(options));
  const searchId = shasum.digest('hex');
  const queryId = Math.floor(Math.random() * SEED_MAX);
  let cache = false;
  if (USE_CACHE) {
    console.time(
      `0. Query ${queryId} | Retrieve cache if exists ${options.affiliationStrings}`,
    );
    cache = await getCache({ searchId });
    console.timeEnd(
      `0. Query ${queryId} | Retrieve cache if exists ${options.affiliationStrings}`,
    );
  }
  if (cache && !resetCache) {
    const extractionDate = new Date(cache.extractionDate);
    console.log(
      `0. Query ${queryId} | Returning cached data from ${extractionDate}`,
    );
    return cache;
  }
  console.time(`1. Query ${queryId} | Requests ${options.affiliationStrings}`);
  // eslint-disable-next-line no-param-reassign
  options.years = range(options.startYear, options.endYear);
  // eslint-disable-next-line no-param-reassign
  options.openAlexExclusions = await Promise.all(
    options.rorExclusions.map((ror) => getInstitutionIdFromRor(ror)),
  );
  const queries = [];
  queries.push(getFosmWorks({ options }));
  const affiliationStringsChunks = chunkArray({
    array: options.affiliationStrings,
  });
  const rorsChunks = chunkArray({ array: options.rors });
  // Separate RoRs from Affiliations strings to query OpenAlex
  affiliationStringsChunks.forEach((affiliationStrings) => {
    queries.push(
      getOpenAlexPublications({
        options: { ...options, affiliationStrings, rors: [] },
      }),
    );
  });
  rorsChunks.forEach((rors) => {
    queries.push(
      getOpenAlexPublications({
        options: { ...options, rors, affiliationStrings: [] },
      }),
    );
  });
  const responses = await Promise.all(queries);
  console.timeEnd(
    `1. Query ${queryId} | Requests ${options.affiliationStrings}`,
  );
  const works = responses.flat();
  console.time(`2. Query ${queryId} | Dedup ${options.affiliationStrings}`);
  // Deduplicate publications by ids
  const deduplicatedWorks = deduplicateWorks(works);
  console.timeEnd(`2. Query ${queryId} | Dedup ${options.affiliationStrings}`);
  // Compute distinct affiliations of works
  console.time(`3. Query ${queryId} | GroupBy ${options.affiliationStrings}`);
  const uniqueAffiliations = groupByAffiliations({
    options,
    works: deduplicatedWorks,
  });
  console.timeEnd(
    `3. Query ${queryId} | GroupBy ${options.affiliationStrings}`,
  );
  // Sort between publications and datasets
  console.time(
    `4. Query ${queryId} | Sort works ${options.affiliationStrings}`,
  );
  const publications = [];
  let datasets = [];
  const deduplicatedWorksLength = deduplicatedWorks.length;
  if (options.datasets) {
    datasets = deduplicatedWorks;
  } else {
    for (let i = 0; i < deduplicatedWorksLength; i += 1) {
      const deduplicatedWork = deduplicatedWorks[i];
      if (datasetsType.includes(deduplicatedWork.type)) {
        datasets.push(deduplicatedWork);
      } else {
        publications.push(deduplicatedWork);
      }
    }
  }
  console.timeEnd(
    `4. Query ${queryId} | Sort works ${options.affiliationStrings}`,
  );
  console.time(`5. Query ${queryId} | Facet ${options.affiliationStrings}`);
  const publicationsYears = countUniqueValues({
    data: publications,
    field: 'year',
  });
  const datasetsYears = countUniqueValues({ data: datasets, field: 'year' });
  const publicationsTypes = countUniqueValues({
    data: publications,
    field: 'type',
  });
  const datasetsTypes = countUniqueValues({ data: datasets, field: 'type' });
  const publicationsPublishers = countUniqueValues({
    data: publications,
    field: 'publisher',
  });
  const datasetsPublishers = countUniqueValues({
    data: datasets,
    field: 'publisher',
  });
  console.timeEnd(`5. Query ${queryId} | Facet ${options.affiliationStrings}`);
  // Build and serialize response
  console.time(
    `6. Query ${queryId} | Serialization ${options.affiliationStrings}`,
  );
  const affiliations = await chunkAndCompress(uniqueAffiliations);
  console.log(
    'serialization',
    `${uniqueAffiliations.length} affiliations serialized`,
  );
  const datasetsResults = await chunkAndCompress(datasets);
  console.log('serialization', `${datasets.length} datasets serialized`);
  const publicationsResults = await chunkAndCompress(publications);
  console.log(
    'serialization',
    `${publications.length} publications serialized`,
  );
  const result = {
    affiliations,
    datasets: {
      results: datasetsResults,
      publishers: datasetsPublishers,
      types: datasetsTypes,
      years: datasetsYears,
    },
    publications: {
      results: publicationsResults,
      publishers: publicationsPublishers,
      types: publicationsTypes,
      years: publicationsYears,
    },
    extractionDate: Date.now(),
  };
  console.timeEnd(
    `6. Query ${queryId} | Serialization ${options.affiliationStrings}`,
  );
  console.time(
    `7. Query ${queryId} | Save cache ${options.affiliationStrings}`,
  );
  await saveCache({ result, searchId });
  console.timeEnd(
    `7. Query ${queryId} | Save cache ${options.affiliationStrings}`,
  );
  return result;
};

router.route('/works').post(async (req, res) => {
  try {
    const options = req?.body ?? {};
    if (!options?.affiliationStrings && !options?.rors) {
      res
        .status(400)
        .json({
          message: 'You must provide at least one affiliation string or RoR.',
        });
    } else {
      const compressedResult = await getWorks({ options });
      res.status(200).json(compressedResult);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

const getMentions = async ({ options }) => {
  const response = await fetch(
    `${process.env.ES_URL}/${process.env.ES_INDEX_MENTIONS}/_search?q=context:${options.search}&size=50`,
    { method: 'POST', headers: { Authorization: process.env.ES_AUTH } },
  );
  const data = await response.json();
  return data?.hits?.hits ?? [];
};

router.route('/mentions').post(async (req, res) => {
  try {
    const options = req?.body ?? {};
    if (!options?.search) {
      res.status(400).json({ message: 'You must provide a search string.' });
    } else {
      const mentions = await getMentions({ options });
      res.status(200).json(mentions);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

export default router;
