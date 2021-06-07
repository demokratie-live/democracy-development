"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.DIP_API_ENDPOINT = exports.DIP_API_KEY = void 0;
_a = process.env, _b = _a.DIP_API_KEY, exports.DIP_API_KEY = _b === void 0 ? '' : _b, _c = _a.DIP_API_ENDPOINT, exports.DIP_API_ENDPOINT = _c === void 0 ? 'https://search.dip.bundestag.de' : _c;
exports.PORT = process.env.PORT ? parseInt(process.env.PORT) : 3101;
