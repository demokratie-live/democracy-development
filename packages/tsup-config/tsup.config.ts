import { defineConfig, Options } from 'tsup';
import { tsupConfig } from './src';

export default defineConfig({
  ...(tsupConfig as Options),
});
