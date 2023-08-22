import express from 'express';

const router = new express.Router();

router.route('/openalex')
  .get((req, res) => {
    res.json({ hello: 'Bonjour doadify API' });
  });

export default router;
