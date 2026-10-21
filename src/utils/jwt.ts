import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { Config } from '../config/config';

const config = Config.getInstance();

/**
 * Firma un JWT con el id del usuario en el claim `sub`.
 *
 * @param userId - Identificador del usuario autenticado.
 * @returns Token JWT firmado.
 */
export function signToken(userId: string): string {
  const options: SignOptions = {
    subject: userId,
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign({}, config.jwtSecret, options);
}

/**
 * Verifica un JWT y devuelve su payload.
 *
 * @param token - Token recibido en el header Authorization.
 * @throws {Error} Si el token es inválido, expiró o su payload no es un objeto.
 */
export function verifyToken(token: string): JwtPayload {
  const payload = jwt.verify(token, config.jwtSecret);

  if (typeof payload === 'string') {
    throw new Error('Invalid JWT payload');
  }

  return payload;
}
