"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var app = express_1.default();
var port = 3000;
app.get("/ber298", function (_req, _res, next) {
    console.log("ber298");
    next();
});
app.get("*", function (_req, res) {
    //   res.send("Hello World!");
    res.status(301).redirect("https://democracy-deutschland.de");
});
app.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
//# sourceMappingURL=index.js.map