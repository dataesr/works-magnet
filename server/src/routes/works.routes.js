import express from 'express';

import {
  getBsoCount,
  getBsoWorks,
  getOpenAlexPublications,
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
        const data = { datasets: [], publications: [], total: {} };
        const publications = await Promise.all([
          getBsoWorks({ options, index: process.env.VITE_BSO_PUBLICATIONS_INDEX }),
          getOpenAlexPublications(options),
        ]);
        publications.forEach((publication) => {
          data.publications = [...data.publications, ...publication.results];
          data.total[publication.datasource] = publication.total;
        });
        const dataset = await getBsoWorks({ options, index: process.env.VITE_BSO_DATASETS_INDEX });
        data.datasets = [...data.datasets, ...dataset.results];
        data.total.dataset = dataset.total;
        if ((Number(data.total.bso) === 0) || (Number(data.total.bso) === Number(process.env.VITE_BSO_MAX_SIZE))) {
          const { count } = await getBsoCount(options);
          data.total.bso = count;
        }
        // Deduplicate publications by DOI or by hal_id
        data.total.all = data.publications.length;
        const deduplicatedPublications = {};
        data.publications.forEach((publication) => {
          const id = publication?.doi ?? publication?.primary_location?.landing_page_url?.split('/')?.pop() ?? publication.id;
          if (!Object.keys(deduplicatedPublications).includes(id)) {
            deduplicatedPublications[id] = publication;
          } else {
            deduplicatedPublications[id] = mergePublications(deduplicatedPublications[id], publication);
          }
        });
        data.publications = Object.values(deduplicatedPublications);
        data.total.deduplicated = Object.values(deduplicatedPublications).length;
        res.status(200).json(data);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
