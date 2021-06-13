import { DIP_API_KEY, DIP_API_ENDPOINT, PORT } from './config'
import Server from './server'
const server = Server({ DIP_API_ENDPOINT, DIP_API_KEY })
server.listen({ port: PORT }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
