"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const server_1 = __importDefault(require("./server"));
const { app, server } = server_1.default({ DIP_API_ENDPOINT: config_1.DIP_API_ENDPOINT, DIP_API_KEY: config_1.DIP_API_KEY });
app.listen({ port: config_1.PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${config_1.PORT}${server.graphqlPath}`);
});
