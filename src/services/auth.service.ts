import bcrypt from 'bcrypt';
import {
  AuthenticationError,
  ConflictError,
  ValidationError,
} from '../errors/http-errors';
import * as userRepository from '../persistence/user.repository';
import type { User } from '../types/domain';
import { signToken } from '../utils/jwt';

const BCRYPT_ROUNDS = 12;

export interface RegisterInput {
  nombre: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23505'
  );
}

/**
 * Registra un usuario nuevo.
 *
 * @param input - Datos validados del registro.
 * @returns Usuario público, sin `password_hash`.
 * @throws {ConflictError} Si el email ya está registrado.
 * @throws {ValidationError} Si el nombre queda vacío después de normalizarlo.
 */
export async function register(input: RegisterInput): Promise<User> {
  const nombre = input.nombre.trim();
  const email = input.email.trim().toLowerCase();

  if (!nombre) {
    throw new ValidationError('El nombre es obligatorio');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  try {
    return await userRepository.create({ nombre, email, passwordHash });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError(
        'El email ya está registrado',
        'EMAIL_ALREADY_EXISTS',
      );
    }

    throw error;
  }
}

/**
 * Valida las credenciales y genera un JWT.
 *
 * @param input - Email y contraseña validados.
 * @returns Token JWT.
 * @throws {AuthenticationError} Si el email no existe o la contraseña no coincide.
 */
export async function login(input: LoginInput): Promise<{ token: string }> {
  const email = input.email.trim().toLowerCase();
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new AuthenticationError(
      'Credenciales inválidas',
      'INVALID_CREDENTIALS',
    );
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    user.password_hash,
  );

  if (!passwordMatches) {
    throw new AuthenticationError(
      'Credenciales inválidas',
      'INVALID_CREDENTIALS',
    );
  }

  return { token: signToken(user.id) };
}
