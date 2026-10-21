import type { Request, Response } from 'express';
import { ValidationError } from '../errors/http-errors';
import * as taskService from '../services/task.service';

function getTaskId(req: Request): string {
  const { id } = req.params;

  if (typeof id !== 'string') {
    throw new ValidationError('Id inválido');
  }

  return id;
}

/**
 * Crea una tarea para el usuario autenticado.
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  const task = await taskService.createTask(
    req.user!.id,
    req.body as taskService.CreateTaskInput,
  );

  res.status(201).json(task);
}

/**
 * Lista las tareas del usuario autenticado.
 */
export async function listTasks(req: Request, res: Response): Promise<void> {
  const tasks = await taskService.listTasks(req.user!.id);

  res.status(200).json({ data: tasks });
}

/**
 * Obtiene una tarea propia.
 */
export async function getTask(req: Request, res: Response): Promise<void> {
  const task = await taskService.getTask(req.user!.id, getTaskId(req));

  res.status(200).json(task);
}

/**
 * Actualiza una tarea propia.
 */
export async function updateTask(req: Request, res: Response): Promise<void> {
  const task = await taskService.updateTask(
    req.user!.id,
    getTaskId(req),
    req.body as taskService.UpdateTaskInput,
  );

  res.status(200).json(task);
}

/**
 * Elimina una tarea propia.
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  await taskService.deleteTask(req.user!.id, getTaskId(req));

  res.status(204).send();
}
