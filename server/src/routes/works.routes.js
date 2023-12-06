import express from 'express';

import { deduplicateWorks, getFosmWorks, getOpenAlexPublications, groupByAffiliations } from '../utils/works';

const router = new express.Router();

router.route('/works')
  .get(async (req, res) => {
    try {
      const options = req?.query ?? {};
      if (!options?.affiliations) {
        res.status(400).json({ message: 'You must provide at least one affiliation.' });
      } else {
        options.affiliations = options.affiliations.split(',');
        console.time(`0. Requests ${options.affiliations}`);
        const responses = await Promise.all([
          getFosmWorks({ options }),
          getOpenAlexPublications({ options }),
        ]);
        console.timeEnd(`0. Requests ${options.affiliations}`);
        console.time(`1. Concat ${options.affiliations}`);
        const works = [
          ...responses[0],
          ...responses[1],
        ];
        console.timeEnd(`1. Concat ${options.affiliations}`);
        console.time(`2. Dedup ${options.affiliations}`);
        // Deduplicate publications by ids
        const deduplicatedWorks = deduplicateWorks(works);
        console.timeEnd(`2. Dedup ${options.affiliations}`);
        // Compute distinct affiliations of works
        console.time(`3. GroupBy ${options.affiliations}`);
        const uniqueAffiliations = groupByAffiliations({ options, works: deduplicatedWorks });
        console.timeEnd(`3. GroupBy ${options.affiliations}`);
        // Sort between publications and datasets
        console.time(`4. Sort works ${options.affiliations}`);
        const publications = [];
        const datasets = [];
        const deduplicatedWorksLength = deduplicatedWorks.length;
        for (let i = 0; i < deduplicatedWorksLength; i += 1) {
          const deduplicatedWork = deduplicatedWorks[i];
          if (
            (deduplicatedWork.datasource.includes('fosm') && deduplicatedWork.type !== 'dataset')
            || (deduplicatedWork.datasource.includes('openalex') && deduplicatedWork.type !== 'dataset')
          ) {
            publications.push(deduplicatedWork);
          } else if (
            (deduplicatedWork.datasource.includes('fosm') && deduplicatedWork.type === 'dataset')
            || (deduplicatedWork.datasource.includes('openalex') && deduplicatedWork.type === 'dataset')
          ) {
            datasets.push(deduplicatedWork);
          } else {
            console.error(`Work not sorted : ${JSON.stringify(deduplicatedWork)}`);
          }
        }
        console.timeEnd(`4. Sort works ${options.affiliations}`);
        // Compute distinct types & years for facet
        console.time(`5. Facet ${options.affiliations}`);
        // TODO chek if Set is optim
        const publicationsYears = [...new Set(
          publications.filter((publication) => !!publication?.year).map((publication) => Number(publication.year)),
        )].sort((a, b) => b - a);
        const datasetsYears = [...new Set(
          datasets.filter((dataset) => !!dataset?.year).map((dataset) => Number(dataset.year)),
        )].sort((a, b) => b - a);
        const publicationsTypes = [...new Set(publications.map((publication) => publication?.type))];
        const datasetsTypes = [...new Set(datasets.map((dataset) => dataset?.type))];
        console.timeEnd(`5. Facet ${options.affiliations}`);
        // Build and serialize response
        console.time(`6. Serialization ${options.affiliations}`);
        res.status(200).json({
          affiliations: uniqueAffiliations,
          datasets: { results: datasets, types: datasetsTypes, years: datasetsYears },
          publications: { results: publications, types: publicationsTypes, years: publicationsYears },
        });
        console.timeEnd(`6. Serialization ${options.affiliations}`);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
