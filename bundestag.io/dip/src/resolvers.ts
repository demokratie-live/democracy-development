import DipAPI from './DipAPI'
import { Vorgang, Dokument } from './types'

export default {
  Document: {
   editor: (dokument: Dokument) => dokument.fundstelle.herausgeber,
   number: (dokument: Dokument) => dokument.fundstelle.dokumentnummer,
   type: (dokument: Dokument) => dokument.fundstelle.drucksachetyp,
   url: (dokument: Dokument) => dokument.fundstelle.pdf_url,
  },
  Procedure: {
    procedureId: (vorgang: Vorgang) => vorgang.id,
    tags: (vorgang: Vorgang) =>  vorgang.deskriptor?.map((d) => d.name),
    title: (vorgang: Vorgang) => vorgang.titel,
    type: (vorgang: Vorgang) => vorgang.typ,
    currentStatus: (vorgang: Vorgang) => vorgang.beratungsstand,
    period: (vorgang: Vorgang) => vorgang.wahlperiode,
    subjectGroups: (vorgang: Vorgang) => vorgang.sachgebiet,
    date: (vorgang: Vorgang) => vorgang.datum,
    importantDocuments: (vorgang: Vorgang, _args: any, { dataSources: { dipAPI } }: { dataSources: { dipAPI: DipAPI } }) => {
      return dipAPI.getVorgangsDokumente(vorgang.id)
    }
  },
  Query: {
    procedures: (_parent: any, _args: any, { dataSources: { dipAPI } }: { dataSources: { dipAPI: DipAPI } }) => {
      return dipAPI.getVorgaenge()
    }
  }
}
