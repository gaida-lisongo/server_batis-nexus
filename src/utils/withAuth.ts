import { NextRequest, NextResponse } from 'next/server';
import { JWTUtils, TokenPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user: TokenPayload;
}

/**
 * Higher-order function pour protéger les routes API
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Extraire le token
      const token = extractToken(request);
      
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'Token d\'authentification requis' },
          { status: 401 }
        );
      }

      // Vérifier le token
      const payload = await JWTUtils.verifyToken(token);
      
      // Ajouter les informations utilisateur à la requête
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = payload;
      
      // Appeler le handler avec la requête authentifiée
      return await handler(authenticatedRequest);
      
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token invalide ou expiré' },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware pour les méthodes spécifiques
 */
export function withAuthMethods(
  methods: string[],
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Si la méthode n'est pas dans la liste, ne pas vérifier l'auth
    if (!methods.includes(request.method)) {
      return await handler(request);
    }

    // Sinon, utiliser withAuth
    return await withAuth(handler as any)(request);
  };
}

/**
 * Extraire le token de la requête
 */
function extractToken(request: NextRequest): string | null {
  // Vérifier dans les headers Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Vérifier dans les cookies
  const tokenCookie = request.cookies.get('auth-token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}
