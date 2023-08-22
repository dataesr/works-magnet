import express from 'express';
import fetch from 'node-fetch';

const router = new express.Router();

router.route('/openalex')
  .get(async (req, res) => {
    let urlParams = req?.query ?? {};
    if (process?.env?.VITE_OPENALEX_KEY) {
      urlParams = { api_key: process.env.VITE_OPENALEX_KEY, ...urlParams };
    } else {
      urlParams = { mailto: 'unknown@github.com', ...urlParams };
    }
    const url = `https://api.openalex.org/works?${new URLSearchParams(urlParams)}`;
    try {
      let response = await fetch(url, { method: 'GET' });
      response = await response.json();
      res.status(200).json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
