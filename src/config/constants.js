export default {
  PORT: process.env.PORT || 3100,
  DB_URL: process.env.DB_URL || "mongodb://localhost:27020/bundestagio",
  DEMOCRACY_SERVER_WEBHOOK_URL:
    process.env.DEMOCRACY_SERVER_WEBHOOK_URL ||
    "http://localhost:3000/webhooks/bundestagio/update",
  GRAPHIQL: process.env.GRAPHIQL || false,
  GRAPHIQL_PATH: "/graphiql",
  GRAPHQL_PATH: "/graphql"
};
