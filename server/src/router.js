import express from 'express';

import openalexRouter from './routes/openalex';
import bsoRouter from './routes/bso';

const router = new express.Router();

router.use(openalexRouter);
router.use(bsoRouter);

export default router;
