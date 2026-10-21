import { app } from './app';
import { Config } from './config/config';

const config = Config.getInstance();

app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
  console.log(`Swagger UI: http://localhost:${config.port}/docs`);
});
