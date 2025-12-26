import express, { Router } from 'express';
const router: Router = express.Router();

import recette from './recette';
import retrait from './retrait';

router.use('/recettes', recette);
router.use('/retraits', retrait);

export default router;