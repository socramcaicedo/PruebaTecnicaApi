# PruebaTecnicaApi — API de Tareas

API REST para registro e inicio de sesión de usuarios y gestión de tareas
personales. Cada tarea pertenece únicamente al usuario que la creó.

**Estado actual:** Día 3 completado y verificado contra PostgreSQL. La suite
tiene 14 tests de integración pasando. Falta el Día 4: documentación final,
deploy y video.

## Stack

- Node.js 20+ (ideal 24 LTS)
- Express 5
- TypeScript 5 (`strict`)
- PostgreSQL 13+
- `pg` (SQL parametrizado, sin ORM)
- `dotenv`
- `bcrypt` + `jsonwebtoken`
- `ajv` + `ajv-formats`
- `swagger-ui-express` + `yaml`
- `vitest` + `supertest` (tests de integración)

## Arquitectura por capas

```text
HTTP
 │
 ├─ src/api/routes          → rutas y conexión de middlewares/controllers
 ├─ src/api/middlewares     → validate, auth, error
 ├─ src/controllers         → traducción HTTP
 ├─ src/services            → reglas de negocio y ownership
 ├─ src/persistence         → SQL parametrizado y repositorios
 └─ PostgreSQL
```

Regla principal: `api → controllers → services → persistence`. Nunca al revés.

## Estructura

```text
src/
├─ api/
│  ├─ routes/
│  ├─ middlewares/
│  └─ schemas/
├─ controllers/
├─ services/
├─ persistence/
├─ config/
├─ errors/
├─ utils/
├─ types/
├─ app.ts
└─ server.ts
db/schema.sql
docs/openapi.yaml
tests/
```

## Requisitos

- Node.js 20 o superior.
- PostgreSQL 13 o superior.

## Instalación

```bash
npm install
cp .env.example .env        # Windows: copy .env.example .env
```

Completar `.env` con los datos locales. Nunca commitear `.env`.

### Variables de entorno

| Variable | Descripción |
|---|---|
| `NODE_ENV` | `development`, `test` o `production` |
| `PORT` | Puerto HTTP (por defecto 3000) |
| `DATABASE_URL` | Conexión PostgreSQL de desarrollo |
| `DATABASE_URL_TEST` | Conexión PostgreSQL para tests |
| `JWT_SECRET` | Secreto de al menos 32 caracteres |
| `JWT_EXPIRES_IN` | Expiración del token (por defecto `1h`) |

Si la contraseña contiene caracteres especiales, codificalos en la URL. Por
ejemplo, `@` se codifica como `%40`. En PostgreSQL local sin SSL usá
`?sslmode=disable`; en Neon/Supabase usá `?sslmode=require`.

## Base de datos

Crear las bases:

```bash
createdb tasks_db
createdb tasks_test
```

Si `createdb` no está disponible en Windows:

```bash
psql -U postgres -c "CREATE DATABASE tasks_db;"
psql -U postgres -c "CREATE DATABASE tasks_test;"
```

Aplicar el esquema:

```bash
npm run db:setup
```

## Ejecución

```bash
npm run dev
```

- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`

Para producción:

```bash
npm run build
npm start
```

## Scripts

| Script | Acción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo |
| `npm run build` | Compilar TypeScript a `dist/` |
| `npm start` | Ejecutar la versión compilada |
| `npm run typecheck` | Verificar tipos sin emitir |
| `npm run db:setup` | Aplicar `db/schema.sql` |
| `npm test` | Ejecutar tests |

## Autenticación

Las rutas protegidas requieren:

```http
Authorization: Bearer <token>
```

El token se obtiene en `POST /auth/login` y expira en 1 hora.

## Endpoints

| Método | Ruta | Auth | Estado |
|---|---|---|---|
| POST | `/auth/register` | No | Implementado (Día 2) |
| POST | `/auth/login` | No | Implementado (Día 2) |
| POST | `/tasks` | Bearer | Implementado (Día 3) |
| GET | `/tasks` | Bearer | Implementado (Día 3) |
| GET | `/tasks/:id` | Bearer | Implementado (Día 3) |
| PUT | `/tasks/:id` | Bearer | Implementado (Día 3) |
| DELETE | `/tasks/:id` | Bearer | Implementado (Día 3) |

### Ejemplos de autenticación

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","email":"ana@example.com","password":"secreto123"}'

curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@example.com","password":"secreto123"}'
```

## Tareas

Cada tarea tiene:

| Campo | Tipo | Reglas |
|---|---|---|
| `id` | UUID | Generado por la base |
| `titulo` | string | 1–200 caracteres |
| `descripcion` | string o null | Máximo 1000 |
| `fecha_vencimiento` | date | Formato `YYYY-MM-DD` |
| `estado` | string | `pendiente`, `en curso`, `completada` |

Todas las rutas requieren `Authorization: Bearer <token>`. Un usuario no puede
ver, modificar ni eliminar tareas de otro: en esos casos la API responde 404.

```bash
# Crear
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"titulo":"Parcial","fecha_vencimiento":"2026-11-01"}'

# Listar
curl http://localhost:3000/tasks \
  -H "Authorization: Bearer <token>"
```

## Formato de respuestas

- Recurso individual exitoso: el recurso directo.
- Lista exitosa: `{ "data": [ ... ] }`.
- Error: `{ "error": { "code": "CODE", "message": "..." } }`.
- `DELETE` exitoso: `204` sin body.

## Tests

```bash
npm test
```

Los tests de autenticación y de tareas están en `tests/auth.test.ts` y
`tests/tasks.test.ts`. Requieren una base PostgreSQL de test configurada en
`DATABASE_URL_TEST`; se ejecutan con `npm test`. La suite cubre 14 casos:
registro, login, token, CRUD, validaciones y aislamiento entre usuarios.

## Postman

Archivos:

- `postman/PruebaTecnicaApi.postman_collection.json`
- `postman/PruebaTecnicaApi.postman_environment.json`

Importación:

1. Importá la colección en Postman.
2. Importá el environment `Prueba Técnica API — Local` (opcional; solo define `baseUrl`).
3. Seleccioná el environment.
4. Ejecutá `Auth → Registrar usuario` y después `Auth → Iniciar sesión`.
5. Ejecutá las requests de `Tasks` en orden.

La colección guarda automáticamente `{{token}}` y `{{taskId}}`. Incluye 13
requests: 5 de autenticación y 8 de tareas, con casos de error 400, 401, 404 y
409. La API debe estar corriendo y la base configurada.

También se puede ejecutar completa con Newman:

```bash
npx newman run postman/PruebaTecnicaApi.postman_collection.json \
  --env-var baseUrl=http://localhost:3000
```

## Próximos pasos

1. Día 4: tests completos, documentación final, deploy y video.
