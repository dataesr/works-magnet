import express from 'express';

import filesRouter from './routes/files.routes';
import worksRouter from './routes/works.routes';

const router = new express.Router();

router.use(filesRouter);
router.use(worksRouter);

export default router;
