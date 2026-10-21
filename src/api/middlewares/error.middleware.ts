import type { ErrorRequestHandler } from 'express';
import { AppError, type ApiErrorDetail } from '../../errors/app-error';

function getErrorType(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('type' in error)) {
    return undefined;
  }

  const value = (error as { type?: unknown }).type;
  return typeof value === 'string' ? value : undefined;
}

/**
 * Middleware central de errores.
 *
 * Traduce excepciones controladas y errores de Express a una respuesta
 * consistente: `{ error: { code, message, details? } }`.
 */
export const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Error interno del servidor';
  let details: ApiErrorDetail[] | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else {
    const type = getErrorType(err);

    if (type === 'entity.parse.failed') {
      statusCode = 400;
      code = 'INVALID_JSON';
      message = 'El body no es un JSON válido';
    } else if (type === 'entity.too.large') {
      statusCode = 413;
      code = 'PAYLOAD_TOO_LARGE';
      message = 'El body supera el tamaño permitido';
    }
  }

  if (statusCode >= 500) {
    console.error(`[${req.method}] ${req.originalUrl}`, err);
  }

  res.status(statusCode).json({
    error: details ? { code, message, details } : { code, message },
  });
};
