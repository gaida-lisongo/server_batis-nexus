import dotenv from 'dotenv';
// Charger les variables d'environnement le plus tôt possible
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes/index';
import dbConnect from './utils/dbConnected';

// Import models to ensure they are registered
import './models/Agent';
import './models/Annee';
import './models/Depense';
import './models/Autorisation';
import './models/Grade';

// Connexion à la base de données
dbConnect()
    .then(() => console.log('✅ Connexion MongoDB réussie'))
    .catch((err) => console.error('❌ Erreur de connexion MongoDB:', err));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS - Accepter toutes les origines
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques depuis /public
app.use(express.static(path.join(__dirname, '../public')));

// Route de santé
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Routes API (Main Router)
app.use('/api/v1', routes);

// Gestion des erreurs 404
app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Route non trouvée',
        path: req.path
    });
});

// Gestion globale des erreurs
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📁 Fichiers statiques servis depuis /public`);
    console.log(`💚 Health check disponible sur http://localhost:${PORT}/api/health`);
    console.log(`🔌 API v1 disponible sur http://localhost:${PORT}/api/v1`);
});

// Gestion de l'arrêt gracieux
process.on('SIGTERM', () => {
    console.log('SIGTERM reçu, arrêt du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT reçu, arrêt du serveur...');
    process.exit(0);
});
