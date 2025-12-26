import express, { Router } from 'express';
import agentRoutes from './agents';
import finance from './finance';
const router: Router = express.Router();

/**
 * Centralisation des routes de l'API
 */

router.use('/agents', agentRoutes);
router.use('/finance', finance);
// Prochaines routes :
// router.use('/v1/etudiants', etudiantRoutes);
// router.use('/v1/services', serviceRoutes);

export default router;
