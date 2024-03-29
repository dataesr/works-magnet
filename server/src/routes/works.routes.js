import express from 'express';

import { chunkArray, countUniqueValues, range } from '../utils/utils';
import { datasetsType, deduplicateWorks, getFosmWorks, getOpenAlexPublications, groupByAffiliations } from '../utils/works';

const SEED_MEX = 2048;

const router = new express.Router();

router.route('/works')
  .post(async (req, res) => {
    try {
      const options = req?.body ?? {};
      if (!options?.affiliationStrings && !options?.rors) {
        res.status(400).json({ message: 'You must provide at least one affiliation string or RoR.' });
      } else {
        const queryId = Math.floor(Math.random() * SEED_MEX);
        console.time(`1. Query ${queryId} | Requests ${options.affiliationStrings}`);
        options.datasets = options.datasets === 'true';
        options.years = range(options.startYear, options.endYear);
        const queries = [];
        queries.push(getFosmWorks({ options }));
        const affiliationStringsChunks = chunkArray({ array: options.affiliationStrings });
        // Interrogate OpenAlex by separating ror from others affiliations
        affiliationStringsChunks.forEach((affiliationStrings) => {
          queries.push(getOpenAlexPublications({ options: { ...options, affiliationStrings, rors: [] } }));
        });
        if (options?.rors?.length > 0) {
          queries.push(getOpenAlexPublications({ options: { ...options, affiliationStrings: [] } }));
        }
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
        console.time(`6. Query ${queryId} | Serialization ${options.affiliationStrings}`);
        res.status(200).json({
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
        });
        console.timeEnd(`6. Query ${queryId} | Serialization ${options.affiliationStrings}`);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
