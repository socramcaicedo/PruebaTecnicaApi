import type { Task, TaskStatus } from '../types/domain';
import { pool } from './db';

const TASK_COLUMNS =
  'id, titulo, descripcion, fecha_vencimiento, estado, created_at, updated_at';

export interface CreateTaskData {
  userId: string;
  titulo: string;
  descripcion: string | null;
  fechaVencimiento: string;
  estado: TaskStatus;
}

export interface UpdateTaskData {
  titulo: string;
  descripcion: string | null;
  fechaVencimiento: string;
  estado: TaskStatus;
}

/**
 * Inserta una tarea asociada al usuario autenticado.
 */
export async function create(data: CreateTaskData): Promise<Task> {
  const result = await pool.query(
    `INSERT INTO tasks (user_id, titulo, descripcion, fecha_vencimiento, estado)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${TASK_COLUMNS}`,
    [
      data.userId,
      data.titulo,
      data.descripcion,
      data.fechaVencimiento,
      data.estado,
    ],
  );

  const task = result.rows[0] as Task | undefined;

  if (!task) {
    throw new Error('Failed to create task');
  }

  return task;
}

/**
 * Lista únicamente las tareas del usuario autenticado.
 */
export async function findAllByUserId(userId: string): Promise<Task[]> {
  const result = await pool.query(
    `SELECT ${TASK_COLUMNS}
     FROM tasks
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows as Task[];
}

/**
 * Busca una tarea por id y dueño.
 */
export async function findByIdAndUserId(
  id: string,
  userId: string,
): Promise<Task | null> {
  const result = await pool.query(
    `SELECT ${TASK_COLUMNS}
     FROM tasks
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return (result.rows[0] as Task | undefined) ?? null;
}

/**
 * Actualiza una tarea solo si pertenece al usuario.
 */
export async function updateByIdAndUserId(
  id: string,
  userId: string,
  data: UpdateTaskData,
): Promise<Task | null> {
  const result = await pool.query(
    `UPDATE tasks
     SET titulo = $3,
         descripcion = $4,
         fecha_vencimiento = $5,
         estado = $6,
         updated_at = now()
     WHERE id = $1 AND user_id = $2
     RETURNING ${TASK_COLUMNS}`,
    [
      id,
      userId,
      data.titulo,
      data.descripcion,
      data.fechaVencimiento,
      data.estado,
    ],
  );

  return (result.rows[0] as Task | undefined) ?? null;
}

/**
 * Elimina una tarea solo si pertenece al usuario.
 *
 * @returns `true` si se eliminó, `false` si no existía o era de otro usuario.
 */
export async function deleteByIdAndUserId(
  id: string,
  userId: string,
): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM tasks
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return (result.rowCount ?? 0) > 0;
}
