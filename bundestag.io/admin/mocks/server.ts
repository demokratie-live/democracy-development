/**
 * Serves the MSW handlers over HTTP so the admin's server side can use them.
 *
 *   pnpm mocks:server   (only the mock)
 *   pnpm dev:mock       (mock and admin together, see mocks/dev.ts)
 */
import { createServer, type IncomingMessage, type Server } from 'node:http';
import { getResponse } from 'msw';

import { handlers, MOCK_ORIGIN } from './handlers';

const toRequest = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') headers.set(key, value);
  }
  return new Request(new URL(req.url ?? '/', MOCK_ORIGIN), {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : body,
  });
};

export const startMockServer = (): Promise<Server> => {
  const port = Number(new URL(MOCK_ORIGIN).port);
  const server = createServer(async (req, res) => {
    const request = await toRequest(req);
    const response = await getResponse(handlers, request);
    if (!response) {
      console.warn(`[mock] no handler for ${req.method} ${req.url}`);
      res.writeHead(404, { 'content-type': 'text/plain' }).end(`no mock for ${req.method} ${req.url}\n`);
      return;
    }
    console.log(`[mock] ${req.method} ${req.url} → ${response.status}`);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
};

if (require.main === module) {
  startMockServer().then(() => console.log(`[mock] listening on ${MOCK_ORIGIN}`));
}
