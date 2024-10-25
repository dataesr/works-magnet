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
  const start = new Date();
  const queryId = start
    .toISOString()
    .concat(' - ', Math.floor(Math.random() * SEED_MAX).toString());
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
  const warnings = {};
  const MAX_FOSM = Number(process.env.ES_MAX_SIZE);
  if (MAX_FOSM > 0 && responses.length > 0 && responses[0].length >= MAX_FOSM) {
    warnings.isMaxFosmReached = true;
    warnings.maxFosmValue = MAX_FOSM;
  }
  const MAX_OPENALEX = Number(process.env.OPENALEX_MAX_SIZE);
  if (
    MAX_OPENALEX > 0
    && responses.length > 1
    && responses[1].length >= MAX_OPENALEX
  ) {
    warnings.isMaxOpenalexReached = true;
    warnings.maxOpenalexValue = MAX_OPENALEX;
  }
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
    warnings,
  };
  console.timeEnd(
    `6. Query ${queryId} | Serialization ${options.affiliationStrings}`,
  );
  console.time(
    `7. Query ${queryId} | Save cache ${options.affiliationStrings}`,
  );
  await saveCache({ result, searchId, queryId });
  console.timeEnd(
    `7. Query ${queryId} | Save cache ${options.affiliationStrings}`,
  );
  return result;
};

router.route('/works').post(async (req, res) => {
  try {
    const options = req?.body ?? {};
    if (!options?.affiliationStrings && !options?.rors) {
      res.status(400).json({
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
  const {
    from, search, size, sortBy, sortOrder, type,
  } = options;
  let types = [];
  if (type === 'software') {
    types = ['software'];
  } else if (type === 'datasets') {
    types = ['dataset-implicit', 'dataset-name'];
  }
  let body = {
    from,
    size,
    query: {
      bool: {
        must: [
          {
            terms: {
              'type.keyword': types,
            },
          },
        ],
      },
    },
    _source: [
      'authors',
      'affiliations',
      'context',
      'dataset-name',
      'doi',
      'mention_context',
      'rawForm',
      'software-name',
      'type',
    ],
    highlight: {
      number_of_fragments: 0,
      fragment_size: 100,
      require_field_match: 'true',
      fields: [
        {
          context: { pre_tags: ['<b>'], post_tags: ['</b>'] },
        },
      ],
    },
  };
  if (search?.length > 0) {
    body.query.bool.must.push({ simple_query_string: { query: search } });
  }
  if (sortBy && sortOrder) {
    let sortFields = sortBy;
    switch (sortBy) {
      case 'doi':
        sortFields = ['doi.keyword'];
        break;
      case 'rawForm':
        sortFields = [
          'dataset-name.rawForm.keyword',
          'software-name.rawForm.keyword',
        ];
        break;
      case 'mention.mention_context.used':
        sortFields = ['mention_context.used'];
        break;
      case 'mention.mention_context.created':
        sortFields = ['mention_context.created'];
        break;
      case 'mention.mention_context.shared':
        sortFields = ['mention_context.shared'];
        break;
      default:
        console.error(`This "sortBy" field is not mapped : ${sortBy}`);
    }
    body.sort = [];
    sortFields.map((sortField) => body.sort.push({ [sortField]: sortOrder }));
  }
  body = JSON.stringify(body);
  const url = `${process.env.ES_URL}/${process.env.ES_INDEX_MENTIONS}/_search`;
  const params = {
    body,
    method: 'POST',
    headers: {
      Authorization: process.env.ES_AUTH,
      'content-type': 'application/json',
    },
  };
  const response = await fetch(url, params);
  const data = await response.json();
  const count = data?.hits?.total?.value ?? 0;
  const mentions = (data?.hits?.hits ?? []).map((mention) => ({
    ...mention._source,
    affiliations: [
      ...new Set(
        mention._source?.affiliations
          ?.map((_affiliation) => _affiliation.name)
          .flat()
          .filter((item) => !!item) ?? [],
      ),
    ],
    authors:
      mention._source?.authors
        ?.map((_author) => _author.full_name)
        .filter((_author) => !!_author) ?? [],
    context: mention?.highlight?.context ?? mention._source.context,
    id: mention._id,
    rawForm:
      mention._source?.['software-name']?.rawForm
      ?? mention._source?.['dataset-name']?.rawForm,
    type: mention._source?.type === 'software' ? 'software' : 'dataset',
  }));
  return { count, mentions };
};

router.route('/mentions').post(async (req, res) => {
  try {
    const options = req?.body ?? {};
    if (!['datasets', 'software'].includes(options?.type)) {
      res
        .status(400)
        .json({ message: 'Type should be either "datasets" or "software".' });
    } else {
      const result = await getMentions({ options });
      res.status(200).json(result);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
});

export default router;
