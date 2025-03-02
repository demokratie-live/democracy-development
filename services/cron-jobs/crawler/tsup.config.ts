import { defineConfig, Options } from 'tsup';
import { tsupConfig } from 'tsup-config';

export default defineConfig({
  ...(tsupConfig as Options),
  entry: ['./src/main.ts'],
});
