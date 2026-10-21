import { AppError, type ApiErrorDetail } from './app-error';

/**
 * Error de validación de datos de entrada.
 */
export class ValidationError extends AppError {
  constructor(
    message = 'Datos inválidos',
    code = 'VALIDATION_ERROR',
    details?: ApiErrorDetail[],
  ) {
    super(400, code, message, details);
  }
}

/**
 * Error de autenticación.
 */
export class AuthenticationError extends AppError {
  constructor(message = 'No autorizado', code = 'UNAUTHORIZED') {
    super(401, code, message);
  }
}

/**
 * Error de recurso no encontrado.
 */
export class NotFoundError extends AppError {
  constructor(message = 'No encontrado', code = 'NOT_FOUND') {
    super(404, code, message);
  }
}

/**
 * Error de conflicto con el estado actual del recurso.
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflicto', code = 'CONFLICT') {
    super(409, code, message);
  }
}
