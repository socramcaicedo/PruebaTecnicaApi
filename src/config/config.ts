import 'dotenv/config';

/**
 * Configuración centralizada de la aplicación.
 *
 * Se carga una sola vez y se expone mediante el patrón Singleton.
 * Falla al arrancar si falta una variable obligatoria o si el secreto JWT
 * no tiene la longitud mínima requerida.
 */
export class Config {
  private static instance: Config | undefined;

  readonly nodeEnv: string;
  readonly port: number;
  readonly databaseUrl: string;
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;

  private constructor() {
    this.nodeEnv = process.env.NODE_ENV ?? 'development';
    this.port = Number(process.env.PORT ?? 3000);
    this.databaseUrl = this.requireEnv(
      this.nodeEnv === 'test' ? 'DATABASE_URL_TEST' : 'DATABASE_URL',
    );
    this.jwtSecret = this.requireEnv('JWT_SECRET');
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '1h';

    if (!Number.isInteger(this.port) || this.port <= 0) {
      throw new Error('PORT must be a positive integer');
    }

    if (this.jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters');
    }
  }

  /**
   * Devuelve la instancia única de configuración.
   */
  static getInstance(): Config {
    Config.instance ??= new Config();
    return Config.instance;
  }

  private requireEnv(name: string): string {
    const value = process.env[name];

    if (!value) {
      throw new Error(`Missing environment variable: ${name}`);
    }

    return value;
  }
}
