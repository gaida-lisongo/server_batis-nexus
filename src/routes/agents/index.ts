import express, { Router } from 'express';
import login from './login';
import manage from './manage';

const router: Router = express.Router();

router.use('/auth', login);
router.use('/', manage);
export default router;
