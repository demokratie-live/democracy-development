export const {
    MONGO_DB_URL = 'mongodb://localhost:27017/bundestagio',
    DIP_GRAPHQL_ENDPOINT = "http://localhost:3101",
    IMPORT_PROCEDURES_LIMIT = 100,
    IMPORT_PROCEDURES_FILTER_BEFORE = new Date().toISOString().slice(0,10),
    IMPORT_PROCEDURES_FILTER_AFTER = new Date(Number(new Date()) - 1000*60*60*24*7*4).toISOString().slice(0,10),
} = process.env;
