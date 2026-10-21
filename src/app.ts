import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { parse as parseYaml } from 'yaml';
import { errorMiddleware } from './api/middlewares/error.middleware';
import { authRouter } from './api/routes/auth.routes';
import { NotFoundError } from './errors/http-errors';

const openApiDocument = parseYaml(
  readFileSync(resolve(process.cwd(), 'docs/openapi.yaml'), 'utf8'),
);

export const app = express();

app.use(express.json({ limit: '100kb' }));

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use('/auth', authRouter);

// Ruta no encontrada: pasa por el middleware central de errores.
app.use((_req, _res, next) => {
  next(new NotFoundError('Ruta no encontrada', 'ROUTE_NOT_FOUND'));
});

app.use(errorMiddleware);
