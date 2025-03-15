import { it } from 'vitest';
import { run } from '../../src/index.js';

it.skip(
  'full dev run',
  async () => {
    const results = await run();
    console.log('Results:', results);
  },
  { timeout: Infinity },
);
