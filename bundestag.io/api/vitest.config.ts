import { createRequire } from 'node:module';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);

export default defineConfig({
  resolve: {
    // graphql-tools loads the CJS build; use the same instance in tests
    alias: { graphql: require.resolve('graphql') },
  },
  test: {
    environment: 'node',
    include: ['**/__tests__/**/*.test.ts'],
    globals: true,
  },
});
