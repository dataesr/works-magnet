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
        const results = await Promise.all([
          getBsoWorks({ options, index: process.env.VITE_BSO_PUBLICATIONS_INDEX }),
          getOpenAlexPublications(options),
          getBsoWorks({ options, index: process.env.VITE_BSO_DATASETS_INDEX, filter: 'q=genre:dataset' }),
          // getBsoWorks({ options, index: process.env.VITE_BSO_PUBLICATIONS_INDEX, filter: 'q=genre_raw:dataset' }),
        ]);
        const data = {};
        data.publications = [...results[0].results, ...results[1].results];
        data.datasets = [...results[2].results, ...results[3].results];
        // Deduplicate publications by DOI or by hal_id
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
        // Goup by affiliations
        data.affiliations = groupByAffiliations({ ...data, options });
        res.status(200).json(data);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
