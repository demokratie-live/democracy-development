/**
 * pnpm dev:mock — starts the mock server and `next dev` pointed at it.
 * Real service URLs from .env are overridden; login still uses CREDENTIALS from .env.
 */
import { spawn } from 'node:child_process';

import { MOCK_ENV, MOCK_ORIGIN } from './handlers';
import { startMockServer } from './server';

startMockServer().then((server) => {
  console.log(`[mock] listening on ${MOCK_ORIGIN}`);
  const next = spawn('next', ['dev', ...process.argv.slice(2)], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...MOCK_ENV },
  });
  const stop = () => {
    next.kill();
    server.close();
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
  next.on('exit', (code) => {
    server.close();
    process.exit(code ?? 0);
  });
});
