import type { User, UserWithPassword } from '../types/domain';
import { pool } from './db';

export interface CreateUserInput {
  nombre: string;
  email: string;
  passwordHash: string;
}

/**
 * Inserta un usuario y devuelve sus datos públicos.
 */
export async function create(input: CreateUserInput): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (nombre, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nombre, email, created_at`,
    [input.nombre, input.email, input.passwordHash],
  );

  const user = result.rows[0] as User | undefined;

  if (!user) {
    throw new Error('Failed to create user');
  }

  return user;
}

/**
 * Busca un usuario por email, incluyendo el hash para validar el login.
 */
export async function findByEmail(
  email: string,
): Promise<UserWithPassword | null> {
  const result = await pool.query(
    `SELECT id, nombre, email, password_hash, created_at
     FROM users
     WHERE email = $1`,
    [email],
  );

  return (result.rows[0] as UserWithPassword | undefined) ?? null;
}
