export default {
  PORT: process.env.PORT || 3100,
  DB_URL: process.env.DB_URL || 'mongodb://localhost/bundestagio',
  DEMOCRACY_SERVER_URL: process.env.DEMOCRACY_SERVER_URL || 'http://localhost:3000',
  GRAPHIQL_PATH: '/graphiql',
  GRAPHQL_PATH: '/graphql',
};
