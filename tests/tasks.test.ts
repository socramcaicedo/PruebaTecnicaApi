import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';

const PASSWORD = 'secreto123';

const baseTask = {
  titulo: 'Parcial de sistemas',
  descripcion: 'Unidades 1 a 4',
  fecha_vencimiento: '2026-11-01',
};

async function registerAndLogin(email: string): Promise<string> {
  await request(app).post('/auth/register').send({
    nombre: 'Usuario de prueba',
    email,
    password: PASSWORD,
  });

  const login = await request(app)
    .post('/auth/login')
    .send({ email, password: PASSWORD });

  return login.body.token as string;
}

function createTask(
  token: string,
  overrides: Record<string, unknown> = {},
) {
  return request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...baseTask, ...overrides });
}

describe('Tasks', () => {
  it('rechaza una request sin token', async () => {
    const response = await request(app).post('/tasks').send(baseTask);

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('crea una tarea asociada al usuario y usa estado pendiente', async () => {
    const token = await registerAndLogin('ana@example.com');

    const response = await createTask(token);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      titulo: baseTask.titulo,
      descripcion: baseTask.descripcion,
      fecha_vencimiento: baseTask.fecha_vencimiento,
      estado: 'pendiente',
    });
    expect(typeof response.body.id).toBe('string');
    expect(response.body).not.toHaveProperty('user_id');
  });

  it('lista solo las tareas del usuario autenticado', async () => {
    const ana = await registerAndLogin('ana@example.com');
    const beto = await registerAndLogin('beto@example.com');

    await createTask(ana, { titulo: 'Tarea de Ana 1' });
    await createTask(ana, { titulo: 'Tarea de Ana 2' });
    await createTask(beto, { titulo: 'Tarea de Beto' });

    const anaList = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${ana}`);
    const betoList = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${beto}`);

    expect(anaList.status).toBe(200);
    expect(anaList.body.data).toHaveLength(2);
    expect(betoList.status).toBe(200);
    expect(betoList.body.data).toHaveLength(1);
    expect(betoList.body.data[0].titulo).toBe('Tarea de Beto');
  });

  it('devuelve una tarea propia y oculta la de otro usuario', async () => {
    const ana = await registerAndLogin('ana@example.com');
    const beto = await registerAndLogin('beto@example.com');
    const created = await createTask(ana);

    const own = await request(app)
      .get(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${ana}`);
    const foreign = await request(app)
      .get(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${beto}`);

    expect(own.status).toBe(200);
    expect(own.body.id).toBe(created.body.id);
    expect(foreign.status).toBe(404);
    expect(foreign.body.error.code).toBe('TASK_NOT_FOUND');
  });

  it('actualiza una tarea propia y rechaza la de otro usuario', async () => {
    const ana = await registerAndLogin('ana@example.com');
    const beto = await registerAndLogin('beto@example.com');
    const created = await createTask(ana);

    const own = await request(app)
      .put(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${ana}`)
      .send({
        titulo: 'Tarea actualizada',
        fecha_vencimiento: '2026-11-05',
        estado: 'en curso',
      });
    const foreign = await request(app)
      .put(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${beto}`)
      .send({
        titulo: 'Intento ajeno',
        fecha_vencimiento: '2026-11-05',
        estado: 'completada',
      });

    expect(own.status).toBe(200);
    expect(own.body.titulo).toBe('Tarea actualizada');
    expect(own.body.estado).toBe('en curso');
    expect(foreign.status).toBe(404);
    expect(foreign.body.error.code).toBe('TASK_NOT_FOUND');
  });

  it('elimina una tarea propia y rechaza la de otro usuario', async () => {
    const ana = await registerAndLogin('ana@example.com');
    const beto = await registerAndLogin('beto@example.com');
    const created = await createTask(ana);

    const foreign = await request(app)
      .delete(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${beto}`);

    expect(foreign.status).toBe(404);

    const own = await request(app)
      .delete(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${ana}`);

    expect(own.status).toBe(204);
    expect(own.text).toBe('');

    const afterDelete = await request(app)
      .get(`/tasks/${created.body.id}`)
      .set('Authorization', `Bearer ${ana}`);

    expect(afterDelete.status).toBe(404);
  });

  it('rechaza un id que no es UUID', async () => {
    const token = await registerAndLogin('ana@example.com');

    const response = await request(app)
      .get('/tasks/not-a-uuid')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rechaza un estado inválido', async () => {
    const token = await registerAndLogin('ana@example.com');

    const response = await createTask(token, { estado: 'terminada' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rechaza una fecha inválida', async () => {
    const token = await registerAndLogin('ana@example.com');

    const response = await createTask(token, {
      fecha_vencimiento: '01-11-2026',
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
