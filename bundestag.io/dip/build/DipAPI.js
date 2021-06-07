"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_datasource_rest_1 = require("apollo-datasource-rest");
class DipAPI extends apollo_datasource_rest_1.RESTDataSource {
    constructor({ baseURL }) {
        super();
        this.baseURL = baseURL;
    }
    willSendRequest(request) {
        request.headers.set('Authorization', `ApiKey ${this.context.DIP_API_KEY}`);
    }
    getVorgang(vorgangsId) {
        return this.get(`/api/v1/vorgang/${vorgangsId}`);
    }
    getVorgaenge(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const { before, after } = args.filter || {};
            const filter = {};
            if (after)
                filter['f.datum.start'] = after;
            if (before)
                filter['f.datum.end'] = before;
            let { documents, cursor } = yield this.get(`/api/v1/vorgang`, filter);
            while (documents.length < args.limit + args.offset) {
                const res = yield this.get(`/api/v1/vorgang`, Object.assign(Object.assign({}, filter), { cursor }));
                cursor = res.cursor;
                if (res.documents.length === 0) {
                    break;
                }
                documents = documents.concat(res.documents);
            }
            return documents.slice(args.offset, args.limit + args.offset);
        });
    }
    getVorgangsVorgangspositionen(vorgangsId) {
        return __awaiter(this, void 0, void 0, function* () {
            const { documents: vorgangspositionen } = yield this.get(`/api/v1/vorgangsposition`, {
                'f.vorgang': vorgangsId
            });
            return vorgangspositionen;
        });
    }
    getVorgangsDrucksachen(vorgangsId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vorgangspositionen = yield this.getVorgangsVorgangspositionen(vorgangsId);
            return vorgangspositionen
                .filter((vp) => vp.dokumentart === 'Drucksache')
                .map((vp) => vp.fundstelle);
        });
    }
    getVorgangsPlenarProtokolle(vorgangsId) {
        return __awaiter(this, void 0, void 0, function* () {
            const vorgangspositionen = yield this.getVorgangsVorgangspositionen(vorgangsId);
            return vorgangspositionen
                .filter((vp) => vp.dokumentart === 'Plenarprotokoll')
                .map((vp) => vp.fundstelle);
        });
    }
}
exports.default = DipAPI;
