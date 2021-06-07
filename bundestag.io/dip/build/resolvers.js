"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inkrafttretenDateFormat = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric', month: '2-digit', day: '2-digit'
});
exports.default = {
    Plenum: {
        editor: (dok) => dok.herausgeber,
        number: (dok) => dok.dokumentnummer,
        link: (dok) => dok.pdf_url,
        pages: (dok) => `${dok.anfangsseite} - ${dok.endseite}`,
    },
    Document: {
        editor: (dok) => dok.herausgeber,
        number: (dok) => dok.dokumentnummer,
        type: (dok) => dok.drucksachetyp,
        url: (dok) => dok.pdf_url,
    },
    Procedure: {
        procedureId: (vorgang) => vorgang.id,
        tags: (vorgang) => { var _a; return (_a = vorgang.deskriptor) === null || _a === void 0 ? void 0 : _a.map((d) => d.name); },
        title: (vorgang) => vorgang.titel,
        type: (vorgang) => vorgang.typ,
        currentStatus: (vorgang) => vorgang.beratungsstand,
        period: (vorgang) => vorgang.wahlperiode,
        subjectGroups: (vorgang) => vorgang.sachgebiet,
        date: (vorgang) => vorgang.datum,
        plenums: (vorgang, _args, { dataSources: { dipAPI } }) => {
            return dipAPI.getVorgangsPlenarProtokolle(vorgang.id);
        },
        importantDocuments: (vorgang, _args, { dataSources: { dipAPI } }) => {
            return dipAPI.getVorgangsDrucksachen(vorgang.id);
        },
        gestOrderNumber: (vorgang) => vorgang.gesta,
        legalValidity: (vorgang) => {
            if (!vorgang.inkrafttreten)
                return [];
            return vorgang.inkrafttreten.map(ik => {
                const datum = inkrafttretenDateFormat.format(new Date(ik.datum));
                return `${datum}${ik.erlaeuterung ? ` (${ik.erlaeuterung})` : ''}`;
            });
        }
    },
    Query: {
        procedure: (_parent, args, { dataSources: { dipAPI } }) => {
            return dipAPI.getVorgang(args.id);
        },
        procedures: (_parent, args, { dataSources: { dipAPI } }) => {
            return dipAPI.getVorgaenge(args);
        }
    }
};
