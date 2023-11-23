import express from 'express';

import worksRouter from './routes/works.routes';

const router = new express.Router();

router.use(worksRouter);

export default router;
