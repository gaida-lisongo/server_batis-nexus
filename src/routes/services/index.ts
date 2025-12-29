import express, { Router } from 'express';
import section from './section';

const router: Router = express.Router();

router.use('/sections', section);

export default router;
