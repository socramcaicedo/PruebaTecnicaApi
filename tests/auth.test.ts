import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';

const user = {
  nombre: 'Ana',
  email: 'ana@example.com',
  password: 'secreto123',
};

describe('POST /auth/register', () => {
  it('registra un usuario y no expone el hash', async () => {
    const response = await request(app).post('/auth/register').send(user);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      nombre: user.nombre,
      email: user.email,
    });
    expect(typeof response.body.id).toBe('string');
    expect(response.body).not.toHaveProperty('password_hash');
  });

  it('rechaza un email duplicado', async () => {
    await request(app).post('/auth/register').send(user);

    const response = await request(app).post('/auth/register').send(user);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('rechaza un email inválido', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ ...user, email: 'no-es-email' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(Array.isArray(response.body.error.details)).toBe(true);
  });
});

describe('POST /auth/login', () => {
  it('devuelve un token con credenciales válidas', async () => {
    await request(app).post('/auth/register').send(user);

    const response = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: user.password });

    expect(response.status).toBe(200);
    expect(typeof response.body.token).toBe('string');
  });

  it('rechaza una contraseña incorrecta', async () => {
    await request(app).post('/auth/register').send(user);

    const response = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: 'incorrecta' });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});
