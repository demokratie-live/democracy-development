/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.integ.ts'],
    setupFiles: ['./vitest.integration.setup.ts'],
    testTimeout: 30000, // Integration tests may take longer
    hookTimeout: 30000, // MongoDB connection may be slow
    pool: 'forks', // Isolate tests for DB operations
    poolOptions: {
      forks: {
        singleFork: true, // Run tests sequentially to avoid DB conflicts
      },
    },
  },
});
