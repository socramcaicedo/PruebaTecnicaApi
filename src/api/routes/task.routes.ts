import { Router } from 'express';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '../../controllers/task.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createTaskSchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from '../schemas/task.schema';

export const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.post('/', validate(createTaskSchema), createTask);
taskRouter.get('/', listTasks);
taskRouter.get(
  '/:id',
  validate(taskIdParamsSchema, 'params'),
  getTask,
);
taskRouter.put(
  '/:id',
  validate(taskIdParamsSchema, 'params'),
  validate(updateTaskSchema),
  updateTask,
);
taskRouter.delete(
  '/:id',
  validate(taskIdParamsSchema, 'params'),
  deleteTask,
);
