import express from 'express';
import fetch from 'node-fetch';

import { getBsoQuery, getBsoWorks } from '../utils';

const router = new express.Router();

router.route('/bso/count')
  .get(async (req, res) => {
    try {
      const options = req?.query ?? {};
      if (!options?.affiliations) {
        res.status(400).json({ message: 'You must provide at least one affiliation.' });
      } else {
        const body = getBsoQuery(options);
        delete body._source;
        delete body.size;
        delete body.sort;
        let response = await fetch(`${process.env.VITE_BSO_URL}/_count`, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'content-type': 'application/json',
            Authorization: process.env.VITE_BSO_AUTH,
          },
        });
        response = await response.json();
        res.status(200).json(response);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

router.route('/bso/works')
  .get(async (req, res) => {
    try {
      const options = req?.query ?? {};
      const index = options?.index ?? process.env.VITE_BSO_PUBLICATIONS_INDEX;
      if (!options?.affiliations) {
        res.status(400).json({ message: 'You must provide at least one affiliation.' });
      } else {
        const response = await getBsoWorks({ index, options });
        res.status(200).json(response);
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
