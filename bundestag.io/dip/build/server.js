"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const DipAPI_1 = __importDefault(require("./DipAPI"));
const schema_1 = __importDefault(require("./schema"));
const resolvers_1 = __importDefault(require("./resolvers"));
function createServer({ DIP_API_ENDPOINT, DIP_API_KEY }) {
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs: schema_1.default,
        resolvers: resolvers_1.default,
        dataSources: () => ({ dipAPI: new DipAPI_1.default({ baseURL: DIP_API_ENDPOINT }) }),
        context: () => ({ DIP_API_KEY }),
    });
    const app = express_1.default();
    server.applyMiddleware({ app, path: '/' });
    return { app, server };
}
exports.default = createServer;
