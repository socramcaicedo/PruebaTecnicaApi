import { NotFoundError, ValidationError } from '../errors/http-errors';
import * as taskRepository from '../persistence/task.repository';
import type { Task, TaskStatus } from '../types/domain';

export interface CreateTaskInput {
  titulo: string;
  descripcion?: string | null;
  fecha_vencimiento: string;
  estado?: TaskStatus;
}

export interface UpdateTaskInput {
  titulo: string;
  descripcion?: string | null;
  fecha_vencimiento: string;
  estado: TaskStatus;
}

function normalizeTitle(titulo: string): string {
  const normalized = titulo.trim();

  if (!normalized) {
    throw new ValidationError('El título es obligatorio');
  }

  return normalized;
}

function normalizeDescription(
  descripcion: string | null | undefined,
): string | null {
  const normalized = descripcion?.trim();
  return normalized ? normalized : null;
}

/**
 * Crea una tarea para el usuario autenticado.
 */
export async function createTask(
  userId: string,
  input: CreateTaskInput,
): Promise<Task> {
  return taskRepository.create({
    userId,
    titulo: normalizeTitle(input.titulo),
    descripcion: normalizeDescription(input.descripcion),
    fechaVencimiento: input.fecha_vencimiento,
    estado: input.estado ?? 'pendiente',
  });
}

/**
 * Lista las tareas del usuario autenticado.
 */
export async function listTasks(userId: string): Promise<Task[]> {
  return taskRepository.findAllByUserId(userId);
}

/**
 * Obtiene una tarea propia.
 *
 * @throws {NotFoundError} Si la tarea no existe o pertenece a otro usuario.
 */
export async function getTask(userId: string, id: string): Promise<Task> {
  const task = await taskRepository.findByIdAndUserId(id, userId);

  if (!task) {
    throw new NotFoundError('Tarea no encontrada', 'TASK_NOT_FOUND');
  }

  return task;
}

/**
 * Actualiza una tarea propia.
 *
 * @throws {NotFoundError} Si la tarea no existe o pertenece a otro usuario.
 */
export async function updateTask(
  userId: string,
  id: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const task = await taskRepository.updateByIdAndUserId(id, userId, {
    titulo: normalizeTitle(input.titulo),
    descripcion: normalizeDescription(input.descripcion),
    fechaVencimiento: input.fecha_vencimiento,
    estado: input.estado,
  });

  if (!task) {
    throw new NotFoundError('Tarea no encontrada', 'TASK_NOT_FOUND');
  }

  return task;
}

/**
 * Elimina una tarea propia.
 *
 * @throws {NotFoundError} Si la tarea no existe o pertenece a otro usuario.
 */
export async function deleteTask(userId: string, id: string): Promise<void> {
  const deleted = await taskRepository.deleteByIdAndUserId(id, userId);

  if (!deleted) {
    throw new NotFoundError('Tarea no encontrada', 'TASK_NOT_FOUND');
  }
}
