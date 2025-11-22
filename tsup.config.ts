import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: false, // GraphQL CodeGen generates types separately
  splitting: false,
  bundle: true,
  // Don't bundle node_modules dependencies, keep them external
  noExternal: [],
  // Automatically handles node: protocol imports
  platform: 'node',
  // Preserve source structure for better debugging
  shims: false,
  // Don't minify for better error messages in production
  minify: false,
});
