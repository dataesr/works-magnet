import express from 'express';

import filesRouter from './routes/files.routes';
import mentionsRouter from './routes/mentions.routes';
import worksRouter from './routes/works.routes';

const router = new express.Router();

router.use(filesRouter);
router.use(mentionsRouter);
router.use(worksRouter);

export default router;
