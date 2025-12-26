import express, { Router, Request, Response } from 'express';
import crypto from 'crypto';
import Agent from '../../models/Agent';
import { JWTUtils, TokenPayload } from '../../utils/jwt';
import Autorisation from '../../models/Autorisation';
import Mail from '../../utils/Mail';

const router: Router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    try {
        const { matricule, secure } = req.body;

        if (!matricule || !secure) {
            return res.status(400).json({
                success: false,
                error: 'Matricule et mot de passe requis'
            });
        }

        // Récupérer l'agent et ses autorisations
        const hashSecure = crypto.createHash('sha256').update(secure).digest('hex');
        const agent = await Agent.findOne({ matricule, secure: hashSecure })
            .populate('grade');

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent non trouvé ou informations incorrectes'
            });
        }

        const autorisations: any[] = [];
        const authData = await Autorisation.find({ agents: agent._id });

        console.log("authData : ", authData);

        authData.forEach((aut) => {
            autorisations.push({
                _id: aut._id,
                designation: aut.designation
            });
        });
        // Générer le token JWT
        const tokenPayload: TokenPayload = {
            userId: agent._id.toString(),
            email: agent.email || '',
            role: 'agent'
        };

        console.log('POST /api/auth/login - Génération token pour:', tokenPayload);
        const token = await JWTUtils.generateToken(tokenPayload);
        console.log('- Token généré:', token ? 'succès' : 'échec');

        // Définir le cookie d'authentification
        const cookieOptions = {
            httpOnly: true,
            secure: false, // Désactivé en développement
            sameSite: 'lax' as const,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
            path: '/'
        };

        console.log('- Configuration cookie:', cookieOptions);
        res.cookie('auth-token', token, cookieOptions);
        console.log('- Cookie défini avec succès');

        return res.status(200).json({
            success: true,
            message: 'Authentification réussie',
            data: {
                agent: agent,
                autorisations: autorisations,
                token
            }
        });

    } catch (error: any) {
        console.error('Erreur lors de l\'authentification:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

// Route pour vérifier le token
router.get('/verify', async (req: Request, res: Response) => {
    try {
        const cookieToken = req.cookies?.['auth-token'];
        const authHeader = req.get('authorization');
        const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
        const token = cookieToken || headerToken;

        if (!token) {
            return res.status(401).json({ success: false, error: 'Aucun token trouvé' });
        }

        const payload = await JWTUtils.verifyToken(token);

        return res.status(200).json({
            success: true,
            data: payload
        });

    } catch (error: any) {
        return res.status(401).json({
            success: false,
            error: `Token invalide: ${error.message}`
        });
    }
});

// Check is User Exist
router.patch('/forgot', async (req: Request, res: Response) => {
    try {
        const { matricule } = req.body;

        if (!matricule) {
            return res.status(400).json({
                success: false,
                error: 'Matricule requis'
            });
        }

        const agent = await Agent.findOne({ matricule });

        if (!agent) {
            return res.status(404).json({
                success: false,
                error: 'Agent non trouvé'
            });
        }

        if (!agent.email) {
            return res.status(400).json({
                success: false,
                error: "L'agent n'a pas d'adresse e-mail renseignée."
            });
        }

        const newSecret = crypto.randomInt(100000, 999999).toString();

        // Body of mail for recovery (Plain text fallback)
        const textBody = `Bonjour ${agent.nom} ${agent.post_nom},\n\nVotre mot de passe a été réinitialisé.\nNouveau mot de passe : ${newSecret}\nConnectez-vous ici : http://localhost:3000/login`;

        // Elegant HTML Template
        const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px; }
                .content { padding: 40px; color: #374151; line-height: 1.6; }
                .content h2 { color: #111827; font-size: 20px; margin-bottom: 20px; }
                .password-box { background-color: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0; }
                .password-box span { font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 2px; }
                .button { display: inline-block; padding: 14px 30px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2); }
                .footer { padding: 20px; text-align: center; color: #9ca3af; font-size: 13px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; }
                .footer p { margin: 5px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>BATIS NEXUS</h1>
                </div>
                <div class="content">
                    <h2>Réinitialisation de votre mot de passe</h2>
                    <p>Bonjour <strong>${agent.nom} ${agent.post_nom}</strong>,</p>
                    <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Voici votre nouveau mot de passe temporaire :</p>
                    
                    <div class="password-box">
                        <span>${newSecret}</span>
                    </div>

                    <p>Pour votre sécurité, nous vous conseillons de changer ce mot de passe dès votre première connexion.</p>
                    
                    <div style="text-align: center;">
                        <a href="http://localhost:3000/login" class="button">Se connecter maintenant</a>
                    </div>
                </div>
                <div class="footer">
                    <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>
                    <p>&copy; ${new Date().getFullYear()} Batis Nexus. Tous droits réservés.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send mail of recovery (HTML + Text)
        await Mail.composeMail(textBody, agent.email, 'Réinitialisation de votre mot de passe - Batis Nexus', async () => {
            agent.secure = crypto.createHash('sha256').update(newSecret).digest('hex');
            await agent.save();
            console.log('Email envoyé avec succès et mot de passe mis à jour.');
        }, htmlBody);

        return res.status(200).json({
            success: true,
            data: agent
        });
    } catch (error: any) {
        console.error('Erreur lors de la vérification de l\'agent:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erreur interne du serveur'
        });
    }
});

export default router;
