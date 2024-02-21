import express from 'express';

import { range, countUniqueValues } from '../utils/utils';
import { deduplicateWorks, getFosmWorks, getOpenAlexPublications, groupByAffiliations } from '../utils/works';
import webSocketServer from '../webSocketServer';

const router = new express.Router();

router.route('/works')
  .get(async (req, res) => {
    try {
      const options = req?.query ?? {};
      if (!options?.affiliationStrings) {
        res.status(400).json({ message: 'You must provide at least one affiliation.' });
      } else {
        webSocketServer.broadcast(0);
        console.time(`1. Requests ${options}`);
        options.affiliationStrings = options.affiliationStrings.split(',');
        if (options?.rors?.length > 0) {
          options.rors = options.rors.split(',');
        }
        options.datasets = options.datasets === 'true';
        options.years = range(options.startYear, options.endYear);
        const optionsWithAffiliationStringsOnly = {
          datasets: options.datasets, years: options.years, affiliationStrings: options.affiliationStrings.slice(0, 10), rors: [],
        };
        const queries = [];
        queries.push(getFosmWorks({ options }));
        queries.push(getOpenAlexPublications({ options: optionsWithAffiliationStringsOnly }));
        if (options.rors?.length > 0) {
          const optionsWithRorOnly = {
            datasets: options.datasets, years: options.years, affiliationStrings: [], rors: options.rors,
          };
          queries.push(getOpenAlexPublications({ options: optionsWithRorOnly }));
        }
        const responses = await Promise.all(queries);
        console.timeEnd(`1. Requests ${options}`);
        webSocketServer.broadcast(1);
        console.time(`2. Concat ${options}`);
        let works = [];
        if (options.rors?.length > 0) {
          works = [
            ...responses[0],
            ...responses[1],
            ...responses[2],
          ];
        } else {
          works = [
            ...responses[0],
            ...responses[1],
          ];
        }
        console.timeEnd(`2. Concat ${options}`);
        webSocketServer.broadcast(2);
        console.time(`3. Dedup ${options}`);
        // Deduplicate publications by ids
        const deduplicatedWorks = deduplicateWorks(works);
        console.timeEnd(`3. Dedup ${options}`);
        webSocketServer.broadcast(3);
        // Compute distinct affiliations of works
        console.time(`4. GroupBy ${options}`);
        const uniqueAffiliations = groupByAffiliations({ options, works: deduplicatedWorks });
        console.timeEnd(`4. GroupBy ${options}`);
        webSocketServer.broadcast(4);
        // Sort between publications and datasets
        console.time(`5. Sort works ${options}`);
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
        console.timeEnd(`5. Sort works ${options}`);
        webSocketServer.broadcast(5);
        // Compute distinct types & years for facet
        console.time(`6. Facet ${options}`);
        const publicationsYears = countUniqueValues({ data: publications, field: 'year' });
        const datasetsYears = countUniqueValues({ data: datasets, field: 'year' });
        const publicationsTypes = countUniqueValues({ data: publications, field: 'type' });
        const datasetsTypes = countUniqueValues({ data: datasets, field: 'type' });
        const publicationsPublishers = countUniqueValues({ data: publications, field: 'publisher' });
        const datasetsPublishers = countUniqueValues({ data: datasets, field: 'publisher' });
        console.timeEnd(`6. Facet ${options}`);
        webSocketServer.broadcast(6);
        // Build and serialize response
        console.time(`7. Serialization ${options}`);
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
        console.timeEnd(`7. Serialization ${options}`);
        webSocketServer.broadcast(7);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
