import DipAPI from './DipAPI'
import { Vorgang } from './types'

export default {
  Procedure: {
    procedureId: (vorgang: Vorgang) => vorgang.id,
    tags: (vorgang: Vorgang) =>  vorgang.deskriptor?.map((d) => d.name),
    title: (vorgang: Vorgang) => vorgang.titel,
    type: (vorgang: Vorgang) => vorgang.typ,
    currentStatus: (vorgang: Vorgang) => vorgang.beratungsstand,
    period: (vorgang: Vorgang) => vorgang.wahlperiode,
    subjectGroups: (vorgang: Vorgang) => vorgang.sachgebiet,
    date: (vorgang: Vorgang) => vorgang.datum,
  },
  Query: {
    procedures: (_parent: any, _args: any, { dataSources: { dipAPI } }: { dataSources: { dipAPI: DipAPI } }) => {
      return dipAPI.getProcedures()
    }
  }
}
