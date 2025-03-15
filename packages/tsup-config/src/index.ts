import { type Options } from 'tsup';

export const tsupConfig: Options = {
  dts: true, // Generate .d.ts files
  minify: true, // Minify output
  sourcemap: true, // Generate separate sourcemap files
  treeshake: true, // Remove unused code
  splitting: true, // Split output into chunks
  clean: true, // Clean output directory before building
  outDir: 'build', // Output directory
  entry: ['src/index.ts'], // Entry point(s)
  format: ['cjs', 'esm'], // Output in both CommonJS and ESM formats for better compatibility
  target: 'node16', // Target Node.js 16+ for better performance
  skipNodeModulesBundle: true, // Skip bundling node_modules for better build performance
};
