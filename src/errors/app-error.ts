/**
 * Detalle de un error de validación o de dominio.
 */
export interface ApiErrorDetail {
  field?: string;
  message: string;
}

/**
 * Error base de la aplicación.
 *
 * Representa un error controlado que puede traducirse a una respuesta HTTP
 * con un status y un código de error estables.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = new.target.name;
  }
}
