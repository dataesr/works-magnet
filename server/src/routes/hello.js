import express from 'express';

const router = new express.Router();

router.route('/hello')
  .get((req, res) => {
    res.json({ hello: 'Bonjour doadify API' });
  });

export default router;
