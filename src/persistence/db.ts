import { Pool, types } from 'pg';
import { Config } from '../config/config';

// node-postgres convierte DATE en Date. La API expone fecha_vencimiento
// como string YYYY-MM-DD, por lo que se conserva el valor original.
types.setTypeParser(1082, (value) => value);

/**
 * Pool de conexiones PostgreSQL compartido por los repositorios.
 */
export const pool = new Pool({
  connectionString: Config.getInstance().databaseUrl,
});
