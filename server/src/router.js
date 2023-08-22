import express from 'express';

import openalexRouter from './routes/openalex';

const router = new express.Router();

router.use(openalexRouter);

export default router;
