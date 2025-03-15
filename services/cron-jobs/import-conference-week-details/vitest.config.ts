/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    testTimeout: process.env.NODE_ENV === 'debug' ? Infinity : 5000,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,ts}'],
      exclude: ['node_modules/**', 'build/**', '**/dist/**', '**/*.test.ts', '**/__tests__/**'],
      all: true,
    },
  },
});
