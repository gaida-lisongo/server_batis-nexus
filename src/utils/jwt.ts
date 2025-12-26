const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes

export interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// Utiliser Web Crypto API pour la compatibilité Edge Runtime
async function getSignature(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );

  // Convertir en hex
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export class JWTUtils {
  // Génération d'un token simple (remplacer par JWT en production)
  static async generateToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): Promise<string> {
    const now = Date.now();
    const tokenData = {
      ...payload,
      iat: now,
      exp: now + JWT_EXPIRES_IN
    };

    const tokenString = JSON.stringify(tokenData);
    const signature = await getSignature(tokenString);

    // Utiliser un séparateur différent du point pour éviter les conflits
    const combined = `${tokenString}|||${signature}`;
    const encoder = new TextEncoder();
    const buffer = encoder.encode(combined);
    return btoa(String.fromCharCode.apply(null, Array.from(buffer)));
  }

  static async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = atob(token);
      const parts = decoded.split('|||');

      if (parts.length !== 2) {
        throw new Error('Format de token invalide');
      }

      const [tokenString, signature] = parts;

      if (!tokenString || !signature) {
        throw new Error('Format de token invalide');
      }

      // Vérifier la signature
      const expectedSignature = await getSignature(tokenString);

      if (signature !== expectedSignature) {
        throw new Error('Signature invalide');
      }

      const payload = JSON.parse(tokenString) as TokenPayload;

      // Vérifier l'expiration
      if (payload.exp && Date.now() > payload.exp) {
        throw new Error('Token expiré');
      }

      return payload;
    } catch (error: any) {
      throw new Error(`Token invalide ou expiré: ${error.message}`);
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = atob(token);
      const [tokenString] = decoded.split('|||');
      if (!tokenString) return null;
      return JSON.parse(tokenString) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}
