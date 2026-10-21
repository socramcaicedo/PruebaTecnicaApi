import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';

/**
 * Registra un usuario y devuelve sus datos públicos.
 */
export async function register(req: Request, res: Response): Promise<void> {
  const user = await authService.register(
    req.body as authService.RegisterInput,
  );

  res.status(201).json(user);
}

/**
 * Inicia sesión y devuelve un token JWT.
 */
export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body as authService.LoginInput);

  res.status(200).json(result);
}
