import type { JSONSchemaType } from 'ajv';
import type {
  LoginInput,
  RegisterInput,
} from '../../services/auth.service';

export const registerSchema: JSONSchemaType<RegisterInput> = {
  type: 'object',
  properties: {
    nombre: { type: 'string', minLength: 1, maxLength: 100 },
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string', minLength: 8, maxLength: 72 },
  },
  required: ['nombre', 'email', 'password'],
  additionalProperties: false,
};

export const loginSchema: JSONSchemaType<LoginInput> = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email', maxLength: 255 },
    password: { type: 'string', minLength: 8, maxLength: 72 },
  },
  required: ['email', 'password'],
  additionalProperties: false,
};
