import express from 'express';

import {
  getBsoWorks,
  getOpenAlexPublications,
  groupByAffiliations,
  mergePublications,
} from '../utils';

const router = new express.Router();

router.route('/works')
  .get(async (req, res) => {
    try {
      const options = req?.query ?? {};
      if (!options?.affiliations) {
        res.status(400).json({ message: 'You must provide at least one affiliation.' });
      } else {
        console.time(`0. Requests ${options.affiliations}`);
        const responses = await Promise.all([
          getBsoWorks({ options, index: process.env.VITE_BSO_PUBLICATIONS_INDEX }),
          getOpenAlexPublications(options),
          getBsoWorks({ options: { ...options, filter: { field: 'genre', value: 'dataset' } }, index: process.env.VITE_BSO_DATASETS_INDEX }),
        ]);
        console.timeEnd(`0. Requests ${options.affiliations}`);
        console.time(`1. Filter ${options.affiliations}`);
        const data = {};
        data.publications = { results: [
          ...responses[0].results.filter((result) => result.genre_raw !== 'dataset'),
          ...responses[1].results,
        ] };
        data.datasets = { results: [
          ...responses[0].results.filter((result) => result.genre_raw === 'dataset'),
          ...responses[2].results,
        ] };
        console.timeEnd(`1. Filter ${options.affiliations}`);
        console.time(`2. Dedup ${options.affiliations}`);
        // Deduplicate publications by DOI or by hal_id
        const deduplicatedPublications = {};
        data.publications.results.forEach((publication) => {
          const id = publication?.doi ?? publication?.primary_location?.landing_page_url?.split('/')?.pop() ?? publication.id;
          if (!Object.keys(deduplicatedPublications).includes(id)) {
            deduplicatedPublications[id] = publication;
          } else {
            deduplicatedPublications[id] = mergePublications(deduplicatedPublications[id], publication);
          }
        });
        data.publications.results = Object.values(deduplicatedPublications);
        console.timeEnd(`2. Dedup ${options.affiliations}`);
        // Compute distinct types & years for facet
        console.time(`3. Facet ${options.affiliations}`);
        data.publications.years = [...new Set(
          data.publications.results.filter((publication) => !!publication?.year).map((publication) => Number(publication.year)),
        )].sort((a, b) => b - a);
        data.datasets.years = [...new Set(
          data.datasets.results.filter((dataset) => !!dataset?.year).map((dataset) => Number(dataset.year)),
        )].sort((a, b) => b - a);
        data.publications.types = [...new Set(data.publications.results.map((publication) => publication?.type))];
        data.datasets.types = [...new Set(data.datasets.results.map((dataset) => dataset?.type))];
        console.timeEnd(`3. Facet ${options.affiliations}`);
        // Goup by affiliations
        console.time(`4. GroupBy ${options.affiliations}`);
        data.affiliations = groupByAffiliations({ ...data, options });
        console.timeEnd(`4. GroupBy ${options.affiliations}`);
        console.time(`5. Serialization ${options.affiliations}`);
        res.status(200).json(data);
        console.timeEnd(`5. Serialization ${options.affiliations}`);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
