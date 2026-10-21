import type { JSONSchemaType } from 'ajv';
import type {
  CreateTaskInput,
  UpdateTaskInput,
} from '../../services/task.service';

const TASK_STATUSES = ['pendiente', 'en curso', 'completada'] as const;

export const createTaskSchema: JSONSchemaType<CreateTaskInput> = {
  type: 'object',
  properties: {
    titulo: { type: 'string', minLength: 1, maxLength: 200 },
    descripcion: { type: 'string', nullable: true, maxLength: 1000 },
    fecha_vencimiento: { type: 'string', format: 'date' },
    estado: {
      type: 'string',
      enum: [...TASK_STATUSES],
      nullable: true,
    },
  },
  required: ['titulo', 'fecha_vencimiento'],
  additionalProperties: false,
};

export const updateTaskSchema: JSONSchemaType<UpdateTaskInput> = {
  type: 'object',
  properties: {
    titulo: { type: 'string', minLength: 1, maxLength: 200 },
    descripcion: { type: 'string', nullable: true, maxLength: 1000 },
    fecha_vencimiento: { type: 'string', format: 'date' },
    estado: { type: 'string', enum: [...TASK_STATUSES] },
  },
  required: ['titulo', 'fecha_vencimiento', 'estado'],
  additionalProperties: false,
};

export const taskIdParamsSchema: JSONSchemaType<{ id: string }> = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
  },
  required: ['id'],
  additionalProperties: false,
};
