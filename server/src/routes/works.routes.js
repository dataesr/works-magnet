import express from 'express';

import { chunkArray, countUniqueValues, range } from '../utils/utils';
import { deduplicateWorks, getFosmWorks, getOpenAlexPublications, groupByAffiliations } from '../utils/works';
import webSocketServer from '../webSocketServer';

const router = new express.Router();

router.route('/works')
  .get(async (req, res) => {
    try {
      const options = req?.query ?? {};
      if (!options?.affiliationStrings && !options?.rors) {
        res.status(400).json({ message: 'You must provide at least one affiliation string or RoR.' });
      } else {
        webSocketServer.broadcast(0);
        console.time(`1. Requests ${options.affiliationStrings}`);
        options.affiliationStrings = options.affiliationStrings.split(',');
        if (options?.rors?.length > 0) {
          options.rors = options.rors.split(',');
        }
        options.datasets = options.datasets === 'true';
        options.years = range(options.startYear, options.endYear);
        const queries = [];
        queries.push(getFosmWorks({ options }));
        const affiliationStringsChunks = chunkArray({ array: options.affiliationStrings });
        affiliationStringsChunks.forEach((affiliationStrings) => {
          queries.push(getOpenAlexPublications({ options: { ...options, affiliationStrings, rors: [] } }));
        });
        if (options?.rors?.length > 0) {
          queries.push(getOpenAlexPublications({ options: { ...options, affiliationStrings: [] } }));
        }
        const responses = await Promise.all(queries);
        console.timeEnd(`1. Requests ${options.affiliationStrings}`);
        webSocketServer.broadcast(1);
        const works = responses.flat();
        console.time(`2. Dedup ${options.affiliationStrings}`);
        // Deduplicate publications by ids
        const deduplicatedWorks = deduplicateWorks(works);
        console.timeEnd(`2. Dedup ${options.affiliationStrings}`);
        webSocketServer.broadcast(2);
        // Compute distinct affiliations of works
        console.time(`3. GroupBy ${options.affiliationStrings}`);
        const uniqueAffiliations = groupByAffiliations({ options, works: deduplicatedWorks });
        console.timeEnd(`3. GroupBy ${options.affiliationStrings}`);
        webSocketServer.broadcast(3);
        // Sort between publications and datasets
        console.time(`4. Sort works ${options.affiliationStrings}`);
        const publications = [];
        let datasets = [];
        const deduplicatedWorksLength = deduplicatedWorks.length;
        if (options.datasets) {
          datasets = deduplicatedWorks;
        } else {
          for (let i = 0; i < deduplicatedWorksLength; i += 1) {
            const deduplicatedWork = deduplicatedWorks[i];
            if (deduplicatedWork.type !== 'dataset') {
              publications.push(deduplicatedWork);
            } else {
              datasets.push(deduplicatedWork);
            }
          }
        }
        console.timeEnd(`4. Sort works ${options.affiliationStrings}`);
        webSocketServer.broadcast(4);
        // Compute distinct types & years for facet
        console.time(`5. Facet ${options.affiliationStrings}`);
        const publicationsYears = countUniqueValues({ data: publications, field: 'year' });
        const datasetsYears = countUniqueValues({ data: datasets, field: 'year' });
        const publicationsTypes = countUniqueValues({ data: publications, field: 'type' });
        const datasetsTypes = countUniqueValues({ data: datasets, field: 'type' });
        const publicationsPublishers = countUniqueValues({ data: publications, field: 'publisher' });
        const datasetsPublishers = countUniqueValues({ data: datasets, field: 'publisher' });
        console.timeEnd(`5. Facet ${options.affiliationStrings}`);
        webSocketServer.broadcast(5);
        // Build and serialize response
        console.time(`6. Serialization ${options.affiliationStrings}`);
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
        console.timeEnd(`6. Serialization ${options.affiliationStrings}`);
        webSocketServer.broadcast(6);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
