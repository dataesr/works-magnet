import express from 'express';
import helloRouter from './routes/hello';

const router = new express.Router();

router.use(helloRouter);

export default router;
