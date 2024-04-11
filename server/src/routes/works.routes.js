import crypto from 'crypto';
import express from 'express';

import { getCache, saveCache } from '../utils/s3';
import { chunkArray, countUniqueValues, range } from '../utils/utils';
import { datasetsType, deduplicateWorks, getFosmWorks, getOpenAlexPublications, groupByAffiliations } from '../utils/works';

const SEED_MAX = 2048;

const router = new express.Router();

const getData = async ({ options, type }) => {
  const shasum = crypto.createHash('sha1');
  shasum.update(JSON.stringify(options));
  const searchId = shasum.digest('hex');
  const cache = await getCache({ searchId, type });
  const queryId = Math.floor(Math.random() * SEED_MAX);
  if (cache) return cache;
  console.time(`1. Query ${queryId} | Requests ${options.affiliationStrings}`);
  // eslint-disable-next-line no-param-reassign
  options.years = range(options.startYear, options.endYear);
  const queries = [];
  queries.push(getFosmWorks({ options }));
  const affiliationStringsChunks = chunkArray({ array: options.affiliationStrings });
  const rorsChunks = chunkArray({ array: options.rors });
  // Separate RoRs from Affiliations strings to query OpenAlex
  affiliationStringsChunks.forEach((affiliationStrings) => {
    queries.push(getOpenAlexPublications({ options: { ...options, affiliationStrings, rors: [] } }));
  });
  rorsChunks.forEach((rors) => {
    queries.push(getOpenAlexPublications({ options: { ...options, rors, affiliationStrings: [] } }));
  });
  const responses = await Promise.all(queries);
  console.timeEnd(`1. Query ${queryId} | Requests ${options.affiliationStrings}`);
  const works = responses.flat();
  console.time(`2. Query ${queryId} | Dedup ${options.affiliationStrings}`);
  // Deduplicate publications by ids
  const deduplicatedWorks = deduplicateWorks(works);
  console.timeEnd(`2. Query ${queryId} | Dedup ${options.affiliationStrings}`);
  // Compute distinct affiliations of works
  console.time(`3. Query ${queryId} | GroupBy ${options.affiliationStrings}`);
  const uniqueAffiliations = groupByAffiliations({ options, works: deduplicatedWorks });
  console.timeEnd(`3. Query ${queryId} | GroupBy ${options.affiliationStrings}`);
  // Sort between publications and datasets
  console.time(`4. Query ${queryId} | Sort works ${options.affiliationStrings}`);
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
  console.timeEnd(`4. Query ${queryId} | Sort works ${options.affiliationStrings}`);
  // Compute distinct types & years for facet
  console.time(`5. Query ${queryId} | Facet ${options.affiliationStrings}`);
  const publicationsYears = countUniqueValues({ data: publications, field: 'year' });
  const datasetsYears = countUniqueValues({ data: datasets, field: 'year' });
  const publicationsTypes = countUniqueValues({ data: publications, field: 'type' });
  const datasetsTypes = countUniqueValues({ data: datasets, field: 'type' });
  const publicationsPublishers = countUniqueValues({ data: publications, field: 'publisher' });
  const datasetsPublishers = countUniqueValues({ data: datasets, field: 'publisher' });
  console.timeEnd(`5. Query ${queryId} | Facet ${options.affiliationStrings}`);
  // Build and serialize response
  console.time(`6. Query ${queryId} | Cache ${options.affiliationStrings}`);
  const result = {
    affiliations: uniqueAffiliations,
    datasets: {
      publishers: datasetsPublishers,
      results: datasets,
      types: datasetsTypes,
      years: datasetsYears,
    },
    publications: {
      publishers: publicationsPublishers,
      results: publications,
      types: publicationsTypes,
      years: publicationsYears,
    },
  };
  await saveCache({ result, searchId });
  console.timeEnd(`6. Query ${queryId} | Cache ${options.affiliationStrings}`);
  console.time(`7. Query ${queryId} | Serialization ${options.affiliationStrings}`);
  console.timeEnd(`7. Query ${queryId} | Serialization ${options.affiliationStrings}`);
  return result;
};

router.route('/affiliations')
  .post(async (req, res) => {
    try {
      const options = req?.body ?? {};
      if (!options?.affiliationStrings && !options?.rors) {
        res.status(400).json({ message: 'You must provide at least one affiliation string or RoR.' });
      } else {
        const affiliations = await getData({ options, type: 'affiliations' });
        res.status(200).json({ affiliations });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

router.route('/datasets')
  .post(async (req, res) => {
    try {
      const options = req?.body ?? {};
      if (!options?.affiliationStrings && !options?.rors) {
        res.status(400).json({ message: 'You must provide at least one affiliation string or RoR.' });
      } else {
        const datasets = await getData({ options, type: 'datasets' });
        res.status(200).json({ datasets });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

router.route('/publications')
  .post(async (req, res) => {
    try {
      const options = req?.body ?? {};
      if (!options?.affiliationStrings && !options?.rors) {
        res.status(400).json({ message: 'You must provide at least one affiliation string or RoR.' });
      } else {
        const publications = await getData({ options, type: 'publications' });
        res.status(200).json({ publications });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
