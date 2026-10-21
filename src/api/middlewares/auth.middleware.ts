import type { RequestHandler } from 'express';
import { AuthenticationError } from '../../errors/http-errors';
import { verifyToken } from '../../utils/jwt';

/**
 * Verifica el header `Authorization: Bearer <token>` y adjunta el usuario
 * autenticado en `req.user`.
 *
 * @throws {AuthenticationError} Si el token falta, es inválido o expiró.
 */
export const authMiddleware: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new AuthenticationError('Token ausente', 'UNAUTHORIZED');
  }

  const token = header.slice('Bearer '.length).trim();

  if (!token) {
    throw new AuthenticationError('Token ausente', 'UNAUTHORIZED');
  }

  let userId: string;

  try {
    const payload = verifyToken(token);

    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new Error('Invalid subject');
    }

    userId = payload.sub;
  } catch {
    throw new AuthenticationError(
      'Token inválido o expirado',
      'UNAUTHORIZED',
    );
  }

  req.user = { id: userId };
  next();
};
