import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import type { RequestHandler } from 'express';
import type { ApiErrorDetail } from '../../errors/app-error';
import { ValidationError } from '../../errors/http-errors';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

type ValidationTarget = 'body' | 'params' | 'query';

function mapErrors(errors: ErrorObject[]): ApiErrorDetail[] {
  return errors.map((error) => {
    const path = error.instancePath.replace(/^\//, '');
    const missingProperty =
      'missingProperty' in error.params
        ? String(error.params.missingProperty)
        : undefined;

    return {
      field: path || missingProperty,
      message: error.message ?? 'Valor inválido',
    };
  });
}

/**
 * Crea un middleware que valida `body`, `params` o `query` con AJV.
 *
 * @param schema - JSON Schema a aplicar.
 * @param target - Parte de la request que se valida.
 * @throws {ValidationError} Si los datos no cumplen el esquema.
 */
export function validate(
  schema: object,
  target: ValidationTarget = 'body',
): RequestHandler {
  const validateFn = ajv.compile(schema);

  return (req, _res, next) => {
    const valid = validateFn(req[target]);

    if (!valid) {
      const details = mapErrors(validateFn.errors ?? []);
      throw new ValidationError('Datos inválidos', 'VALIDATION_ERROR', details);
    }

    next();
  };
}
