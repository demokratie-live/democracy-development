import { defineConfig } from 'tsup';
import { tsupConfig } from '../../../packages/tsup-config';

export default defineConfig((options) => {
  return {
    ...tsupConfig,
    // Add any service-specific configuration here
    entry: ['src/index.ts'],
    // Bundle all workspace dependencies to ensure they're properly included
    noExternal: [
      '@democracy-deutschland/bundestag.io-definitions',
      '@democracy-deutschland/bundestagio-common',
      '@democracy-deutschland/scapacra',
      '@democracy-deutschland/scapacra-bt',
    ],
  };
});