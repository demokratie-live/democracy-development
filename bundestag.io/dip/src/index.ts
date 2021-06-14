import { DIP_API_KEY, DIP_API_ENDPOINT, PORT } from './config'
import createServer from './server'
const { app, server } = createServer({ DIP_API_ENDPOINT, DIP_API_KEY })
app.listen({ port: PORT }, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
});
