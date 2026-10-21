import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
    },
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
  },
});
