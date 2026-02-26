import express from 'express';

const router = new express.Router();

router.route('/ror-organizations/:ror')
  .get(async (req, res) => {
    try {
      const url = `https://api.ror.org/organizations/${req.params.ror}`;
      const headers = { cache: 'force-cache' };
      if (process?.env?.ROR_API_KEY) {
        headers.headers = { 'client-id': process.env.ROR_API_KEY };
      }
      const response = await fetch(url, headers);
      if (response.ok) {
        const tmp = await response.json();
        res.status(200).json(tmp);
      } else {
        console.error(`${response.status} | While fetching ${url}`);
        res.status(500).json({ message: 'Internal Server Error.' })
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error.' });
    }
  });

export default router;
