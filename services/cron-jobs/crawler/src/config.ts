let {
    MONGO_DB_URL = 'mongodb://localhost:27017/bundestagio',
    DIP_GRAPHQL_ENDPOINT = "http://localhost:3101",
    IMPORT_PROCEDURES_CHUNK_SIZE = 100,
    IMPORT_PROCEDURES_CHUNK_ROUNDS = 5,
    IMPORT_PROCEDURES_FILTER_BEFORE = new Date().toISOString().slice(0,10),
    IMPORT_PROCEDURES_FILTER_AFTER = new Date(Number(new Date()) - 1000*60*60*24*7*4).toISOString().slice(0,10),
} = process.env;
IMPORT_PROCEDURES_CHUNK_SIZE = Number(IMPORT_PROCEDURES_CHUNK_SIZE)
IMPORT_PROCEDURES_CHUNK_ROUNDS = Number(IMPORT_PROCEDURES_CHUNK_ROUNDS)

export default {
    MONGO_DB_URL,
    DIP_GRAPHQL_ENDPOINT,
    IMPORT_PROCEDURES_CHUNK_SIZE,
    IMPORT_PROCEDURES_CHUNK_ROUNDS,
    IMPORT_PROCEDURES_FILTER_BEFORE,
    IMPORT_PROCEDURES_FILTER_AFTER
}
