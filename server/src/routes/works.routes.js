import express from 'express';

import { range, countUniqueValues } from '../utils/utils';
import { deduplicateWorks, getFosmWorks, getOpenAlexPublications, groupByAffiliations } from '../utils/works';
import webSocketServer from '../webSocketServer';

const router = new express.Router();

router.route('/works')
  .get(async (req, res) => {
    try {
      const options = req?.query ?? {};
      if (!options?.affiliations) {
        res.status(400).json({ message: 'You must provide at least one affiliation.' });
      } else {
        webSocketServer.broadcast('start');
        console.time(`0. Requests ${options.affiliations}`);
        options.affiliations = options.affiliations.split(',');
        options.datasets = options.datasets === 'true';
        options.years = range(options.startYear, options.endYear);
        const responses = await Promise.all([
          getFosmWorks({ options }),
          getOpenAlexPublications({ options }),
        ]);
        console.timeEnd(`0. Requests ${options.affiliations}`);
        webSocketServer.broadcast('step_0');
        console.time(`1. Concat ${options.affiliations}`);
        const works = [
          ...responses[0],
          ...responses[1],
        ];
        console.timeEnd(`1. Concat ${options.affiliations}`);
        webSocketServer.broadcast('step_1');
        console.time(`2. Dedup ${options.affiliations}`);
        // Deduplicate publications by ids
        const deduplicatedWorks = deduplicateWorks(works);
        console.timeEnd(`2. Dedup ${options.affiliations}`);
        webSocketServer.broadcast('step_2');
        // Compute distinct affiliations of works
        console.time(`3. GroupBy ${options.affiliations}`);
        const uniqueAffiliations = groupByAffiliations({ options, works: deduplicatedWorks });
        console.timeEnd(`3. GroupBy ${options.affiliations}`);
        webSocketServer.broadcast('step_3');
        // Sort between publications and datasets
        console.time(`4. Sort works ${options.affiliations}`);
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
        console.timeEnd(`4. Sort works ${options.affiliations}`);
        webSocketServer.broadcast('step_4');
        // Compute distinct types & years for facet
        console.time(`5. Facet ${options.affiliations}`);
        const publicationsYears = countUniqueValues({ data: publications, field: 'year' });
        const datasetsYears = countUniqueValues({ data: datasets, field: 'year' });
        const publicationsTypes = countUniqueValues({ data: publications, field: 'type' });
        const datasetsTypes = countUniqueValues({ data: datasets, field: 'type' });
        const publicationsPublishers = countUniqueValues({ data: publications, field: 'publisher' });
        const datasetsPublishers = countUniqueValues({ data: datasets, field: 'publisher' });
        console.timeEnd(`5. Facet ${options.affiliations}`);
        webSocketServer.broadcast('step_5');
        // Build and serialize response
        console.time(`6. Serialization ${options.affiliations}`);
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
        console.timeEnd(`6. Serialization ${options.affiliations}`);
        webSocketServer.broadcast('step_6');
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
