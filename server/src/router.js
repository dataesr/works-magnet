import express from 'express';

import affiliationsRouter from './routes/affiliations.routes';
import filesRouter from './routes/files.routes';
import mentionsRouter from './routes/mentions.routes';
import rorRouter from './routes/ror.routes';
import worksRouter from './routes/works.routes';

const router = new express.Router();

router.use(affiliationsRouter);
router.use(filesRouter);
router.use(mentionsRouter);
router.use(rorRouter);
router.use(worksRouter);

export default router;
