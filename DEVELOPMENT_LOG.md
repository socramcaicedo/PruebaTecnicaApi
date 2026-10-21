# Bitácora de desarrollo — API de Tareas

## Datos del proyecto

- **Proyecto:** Sistema de Gestión de Tareas
- **Perfil:** Aprendiz / Practicante Backend Developer
- **Stack:** Node.js + Express 5 + TypeScript + PostgreSQL
- **Repositorio:** https://github.com/socramcaicedo/PruebaTecnicaApi
- **Período de trabajo:** 20–21/10/2026
- **Estado:** API funcional, tests de integración pasando y colección Postman verificada. Pendiente: deploy y video.

---

## 1. Resumen

Se implementó una API REST para registro e inicio de sesión de usuarios y gestión de tareas personales. Cada tarea pertenece únicamente al usuario que la creó.

La solución quedó organizada en capas:

```text
api → controllers → services → persistence → PostgreSQL
```

Decisiones principales:

- PostgreSQL con `pg` y SQL parametrizado, sin ORM.
- Configuración con `.env`, `.env.example` y patrón Singleton.
- JWT firmado con HS256 y middleware Bearer.
- Validación de entradas con AJV y JSON Schema.
- Errores personalizados con un middleware central.
- Respuestas exitosas con el recurso directo; listas con `{ "data": [...] }`; errores con `{ "error": { "code", "message", "details"? } }`.
- `DELETE` responde `204` sin body.
- Sin Builder, sin envelope de éxito con flag `success`, sin ORM y sin herramientas que el PDF no pidiera.

---

## 2. Registro cronológico

### Día 1 — Fundaciones (21/10/2026)

**Objetivo:** dejar el proyecto compilando, configurado y con la base lista.

Actividades:

1. Inicialización del repositorio y de `package.json`.
2. Instalación de Express 5, TypeScript, `pg`, `dotenv`, `bcrypt`, `jsonwebtoken`, AJV, Swagger y herramientas de desarrollo.
3. Configuración de TypeScript en modo `strict`.
4. Config Singleton con validación de variables de entorno.
5. Jerarquía de errores: `AppError`, `ValidationError`, `AuthenticationError`, `NotFoundError`, `ConflictError`.
6. Esquema PostgreSQL (`users`, `tasks`, índice por usuario).
7. Pool de conexiones y script `npm run db:setup`.
8. Bootstrap de Express, manejo de JSON inválido, 404 y middleware central de errores.
9. Swagger base y README inicial.

**Resultado:** el servidor arranca, `/docs` responde y el middleware de errores devuelve JSON consistente.

### Día 2 — Autenticación (21/10/2026)

Actividades:

1. Esquemas AJV de registro y login.
2. Middleware de validación reutilizable.
3. Repositorio de usuarios con SQL parametrizado.
4. Servicio de autenticación con bcrypt (cost 12).
5. Generación de JWT con `sub`, `iat` y `exp`.
6. Middleware Bearer para rutas protegidas.
7. Endpoints `POST /auth/register` y `POST /auth/login`.
8. Swagger de autenticación.
9. Tests de integración de registro, login y token.

**Resultado:** registro, login y protección de rutas funcionando; validaciones y errores con el formato estándar.

### Día 3 — Tareas (21/10/2026)

Actividades:

1. Esquemas AJV de creación, actualización y parámetro UUID.
2. Repositorio de tareas con todas las consultas filtradas por `user_id`.
3. Servicio con reglas de negocio y ownership.
4. Endpoints `POST /tasks`, `GET /tasks`, `GET /tasks/:id`, `PUT /tasks/:id` y `DELETE /tasks/:id`.
5. Swagger de tareas.
6. Tests de CRUD, validaciones y aislamiento entre usuarios.
7. Colección Postman con environment y ejecución con Newman.

**Resultado:** CRUD completo y ownership verificado; 14 tests pasando.

### Día 4 — Cierre (21/10/2026)

Actividades:

1. Conexión definitiva a PostgreSQL local.
2. Creación de `tasks_db` y `tasks_test`.
3. Verificación end-to-end con HTTP.
4. Suite de 14 tests en verde.
5. Colección Postman de 13 requests y 26 assertions, verificada con Newman.
6. README final y esta bitácora.
7. Revisión de la rúbrica y de los entregables.

**Pendiente:** deploy online y video explicativo.

---

## 3. Retos y soluciones

| # | Reto | Solución | Verificación |
|---|---|---|---|
| 1 | TypeScript 7 eliminó `moduleResolution: node` | Se cambió a `module: nodenext` y `moduleResolution: nodenext`, manteniendo salida CommonJS | `npm run typecheck` y `npm run build` |
| 2 | El `.env` usaba una contraseña incorrecta de PostgreSQL y devolvía `28P01` | Se actualizó la URL con la credencial correcta | Conexión y `npm run db:setup` |
| 3 | La contraseña contenía `@`, que rompe una URL de conexión | Se codificó como `%40` | Conexión con `pg` y tests |
| 4 | `sslmode=prefer` fallaba porque node-postgres lo trata como `verify-full` y el servidor local no soporta SSL | Se usó `sslmode=disable` en local | Conexión y suite completa |
| 5 | Vitest advertía que `vitest.config.ts` usaba ESM dentro de un paquete CommonJS | Se renombró a `vitest.config.mts` | `npm test` sin advertencia |
| 6 | AJV exigía `nullable: true` para el campo opcional `estado` | Se agregó `nullable: true` al esquema de creación | `npm run typecheck` y tests de validación |
| 7 | Express 5 tipa `req.params.id` como `string \| string[]` | Se agregó un helper `getTaskId` que valida el tipo antes de usarlo | `npm run typecheck` |
| 8 | La request de Postman “sin token” heredaba el Bearer de la carpeta y devolvía 201 | Se movió la autenticación a `request.auth` y se usó `noauth` en esa request | Newman: 13 requests, 26 assertions, 0 fallos |
| 9 | Los tests no podían ejecutarse sin una base válida | Se crearon `tasks_db` y `tasks_test` y se verificó la conexión | 14/14 tests |

---

## 4. Uso de asistentes de IA

Usé IA como asistente para análisis, planificación, generación de código, tests y colección Postman. Cada uso significativo quedó documentado con el prompt, lo aceptado, lo rechazado o modificado y la verificación realizada.

### 4.1 Análisis del PDF y plan de implementación

**Prompt exacto:**

> “analizame el pdf que est en el proyecto , analiza entiende lo que se quiere hacer con sus tecnologias , y estrategicamente decime como hacerlo con las tecnologias , con buena arquitectura por capas pero modular , dame un plan orgaizado concreto con lo que se quiere , que sea la mejor forma simple eficiente con buenas practicas”

**Qué acepté:**

- La lectura del PDF y la matriz de trazabilidad de requisitos.
- La arquitectura por capas `api → controllers → services → persistence`.
- El plan de 4 días y la separación de entregables.

**Qué rechacé o modifiqué:**

- Se descartaron tecnologías que no eran necesarias para la prueba: Prisma/ORM, zod, `json-schema-to-ts`, pino, helmet, cors, rate limiting, Docker, CI y ESLint/Prettier.
- Se reemplazaron por `pg`, AJV, `dotenv`, `swagger-ui-express` y `tsx`.
- Se rechazó el Builder para respuestas, porque solo hay dos formas fijas (éxito y error) y agregaba complejidad sin resolver un problema real.

**Verificación:**

- Contraste del plan contra el PDF: 100% de los requisitos obligatorios cubiertos.
- Revisión de guías de diseño de API (Microsoft, Google, Zalando, RFC 9457) y de la documentación de Express 5.
- `npm run typecheck`, `npm run build`, 14 tests y Newman.

### 4.2 Estandarización de respuestas y patrón Builder

**Prompt exacto:**

> “ENVUELVE LA RESPUESTAS ESTANDARIZA QUE SEA API RESPONSE SE , ANALIZA COMO FUNCIONA Y DEMAS , QUE SE UNA CLASE QUE TENGA LA ENVOLTURA SE LLAME Y LUEGO SE FABRIQUE Y ASI EN EL FORMATO BUILDER SI , DIME COMO SERIA EL PLAN CON ESTO”

**Qué acepté:**

- La necesidad de estandarizar las respuestas y centralizar los errores.
- La idea de una envoltura de error consistente.

**Qué rechacé o modifiqué:**

- Se descartó la clase `ApiResponse` con Builder.
- Se adoptó: recurso directo en éxitos individuales, `{ "data": [...] }` en listas y `{ "error": { "code", "message", "details"? } }` en errores.
- El middleware central construye el error sin una clase adicional.
- `DELETE` responde 204 sin body.
- No se agrega `success: true/false` porque duplica el status HTTP.

**Verificación:**

- Tests de integración de respuestas exitosas y de error.
- Newman: 13 requests y 26 assertions, incluyendo 400, 401, 404 y 409.
- Revisión manual de Swagger y del README.

### 4.3 Implementación por partes

**Prompt exacto:**

> “crea el desarrollo por favor , paso a paso por favor has una parte , luego pides permiso para la otra asi hasta terminar”

**Qué acepté:**

- El scaffold de Node/Express/TypeScript.
- Config Singleton, jerarquía de errores, esquemas AJV, repositorios, servicios, controllers y rutas.
- Tests de integración y colección Postman.

**Qué modifiqué:**

- `tsconfig` a `nodenext` por TypeScript 7.
- Helper `getTaskId` por el tipado de Express 5.
- `nullable: true` en el campo opcional `estado`.
- Configuración de Vitest a `.mts` para evitar la advertencia de ESM/CJS.
- Autenticación de Postman a nivel request para que la request sin token no heredara el Bearer.

**Verificación:**

- `npm run typecheck` y `npm run build` sin errores.
- 14/14 tests de integración.
- Prueba HTTP end-to-end: registro 201, login 200, CRUD, 204 y ownership 404.

### 4.4 Colección Postman

**Prompt exacto:**

> “dame una coleccion de postman con tdas las apis organizados y demas , asi”

**Qué acepté:**

- Colección con carpetas Auth y Tasks.
- Environment con `baseUrl`.
- Variables `token`, `taskId`, `email` y `password`.
- Scripts que guardan automáticamente el token y el id de la tarea.
- Tests de status y códigos de error.

**Qué modifiqué:**

- La primera versión usaba auth a nivel de carpeta; la request “sin token” heredaba el Bearer y devolvía 201. Se movió la auth a `request.auth` y se usó `noauth` en esa request.

**Verificación:**

- Newman: 13/13 requests, 26/26 assertions, 0 fallos.

---

## 5. Decisiones sin asistencia de IA

Estas decisiones de alcance y entorno las tomé yo; la IA ayudó a ejecutarlas y verificarlas.

### 5.1 Mantener el alcance estricto del PDF

**Contexto:** había varias tentaciones de agregar herramientas y patrones: ORM, Builder, validadores duplicados, Docker, CI, logs estructurados.

**Decisión:** implementar solo lo que el PDF pide y lo mínimo necesario para cumplirlo.

**Razonamiento:**

- El plazo era de 4 días.
- La rúbrica valora la claridad y la arquitectura, no la cantidad de dependencias.
- Cada herramienta extra agrega superficie de error y tiempo de configuración.
- El proyecto debía ser fácil de explicar y defender en el video.

**Evidencia:** el plan y el README listan explícitamente lo que no se agregó; el código no tiene ORM, Builder, Docker ni CI.

### 5.2 Usar el PostgreSQL local existente para la verificación

**Contexto:** se podía usar una base temporal, una base en la nube o el PostgreSQL 18 ya instalado localmente.

**Decisión:** usar el PostgreSQL local con las credenciales provistas, creando `tasks_db` y `tasks_test`.

**Razonamiento:**

- Permite verificar contra el mismo motor que se usa en desarrollo.
- Evita depender de una cuenta externa para los tests.
- Los datos quedan locales y la configuración es reproducible.

**Evidencia:** bases creadas, `npm run db:setup` aplicado y 14/14 tests pasando.

### 5.3 Validar la API desde un cliente real con Postman/Newman

**Contexto:** los tests de integración ya cubrían la API, pero faltaba una verificación desde un cliente HTTP externo.

**Decisión:** agregar una colección Postman y ejecutarla con Newman como aceptación adicional.

**Razonamiento:**

- Comprueba el flujo tal como lo usaría un consumidor real.
- Deja un artefacto reutilizable para el evaluador.
- Detecta problemas de variables, headers y orden de requests que los tests internos no ven.

**Evidencia:** 13 requests, 26 assertions y 0 fallos.

---

## 6. Verificación final

| Verificación | Resultado |
|---|---|
| `npm run typecheck` | ✅ |
| `npm run build` | ✅ |
| `npm test` | ✅ 14/14 |
| Registro y login HTTP | ✅ 201 / 200 |
| CRUD HTTP | ✅ 201 / 200 / 204 |
| Ownership | ✅ 404 para tareas ajenas |
| Swagger | ✅ `/docs` |
| Postman/Newman | ✅ 13 requests, 26 assertions, 0 fallos |
| Base de datos | ✅ `tasks_db` y `tasks_test` |

---

## 7. Pendientes

- Deploy online (Render + Neon u otro servicio).
- Video explicativo de 5–10 minutos.
- Actualizar el README con la URL del deploy y del video.

---

## 8. Conclusión

La API cumple los requisitos funcionales y arquitectónicos del PDF, con una solución deliberadamente simple: capas claras, SQL parametrizado, validación centralizada, JWT, errores consistentes y tests de integración.

La IA se usó como herramienta de apoyo, pero las decisiones de alcance, entorno y verificación fueron revisadas y ejecutadas con criterio. El resultado es un proyecto que puedo explicar y defender: cada dependencia tiene una justificación y cada requisito tiene una evidencia verificable.
