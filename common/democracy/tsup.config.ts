import { defineConfig, Options } from 'tsup';
import { tsupConfig } from 'tsup-config';

export default defineConfig((options) => ({
  ...(tsupConfig as Options),
  ...options,
}));
