import express, { Router } from 'express';
import agentRoutes from './agents';
import finance from './finance';
import recherche from './finance/recherche';
import services from './services';
import semestre from './semestre';

const router: Router = express.Router();

/**
 * Centralisation des routes de l'API
 */

router.use('/agents', agentRoutes);
router.use('/finance', finance);
router.use('/recherche', recherche);
router.use('/services', services);
router.use('/semestre', semestre);

// Prochaines routes :
// router.use('/v1/etudiants', etudiantRoutes);
// router.use('/v1/services', serviceRoutes);

export default router;
