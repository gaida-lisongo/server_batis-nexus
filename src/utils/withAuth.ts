import { Request, Response, NextFunction } from 'express';
import { JWTUtils, TokenPayload } from './jwt';

export interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

/**
 * Middleware pour protéger les routes API
 */
export const withAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token d\'authentification requis'
      });
    }

    // Vérifier le token
    const payload = await JWTUtils.verifyToken(token);

    // Ajouter les informations utilisateur à la requête
    (req as AuthenticatedRequest).user = payload;

    next();

  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: 'Token invalide ou expiré',
      details: error.message
    });
  }
};

/**
 * Middleware pour filtrer par rôles (optionnel)
 */
export const withRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user || !authReq.user.role || !roles.includes(authReq.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé : rôle insuffisant'
      });
    }
    next();
  };
};

/**
 * Extraire le token de la requête Express
 */
function extractToken(req: Request): string | null {
  // 1. Vérifier dans les headers Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Vérifier dans les cookies (si cookie-parser est utilisé ou manuellement)
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/auth-token=([^;]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
