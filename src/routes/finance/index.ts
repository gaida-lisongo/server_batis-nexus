import express, { Router } from 'express';
const router: Router = express.Router();

import recette from './recette';
import retrait from './retrait';
import enrollement from './enrollement';

router.use('/recettes', recette);
router.use('/retraits', retrait);
router.use('/enrollements', enrollement);

export default router;