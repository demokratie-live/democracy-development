/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Allows describe, it, expect without imports
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./vitest.unit.setup.ts'],
    coverage: {
      enabled: false, // Enable after migration
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'src/**/*.test.ts',
        'src/**/*.integ.ts',
        'src/generated/**',
      ],
    },
  },
});
