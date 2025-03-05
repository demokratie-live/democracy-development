import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
