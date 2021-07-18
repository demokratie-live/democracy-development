import { DIP_API_KEY, DIP_API_ENDPOINT, PORT, RATE_LIMIT } from './config';
import createServer from './server';
const { app, server } = createServer({ DIP_API_ENDPOINT, DIP_API_KEY, RATE_LIMIT });
app.listen({ port: PORT }, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
});
