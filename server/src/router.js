import express from 'express';

import bsoRouter from './routes/bso.routes';
import openalexRouter from './routes/openalex.routes';
import worksRouter from './routes/works.routes';

const router = new express.Router();

router.use(bsoRouter);
router.use(openalexRouter);
router.use(worksRouter);

export default router;
