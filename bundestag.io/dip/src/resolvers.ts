import DipAPI from './DipAPI'
import { Vorgang, Drucksache, Plenarprotokoll } from './dip-types'
import { ProceduresArgs } from './types'

const inkrafttretenDateFormat = new Intl.DateTimeFormat('de-DE', {
  year: 'numeric', month: '2-digit', day: '2-digit'
})

export default {
  Plenum: {
   editor: (dok: Plenarprotokoll) => dok.herausgeber,
   number: (dok: Plenarprotokoll) => dok.dokumentnummer,
   link: (dok: Plenarprotokoll) => dok.pdf_url,
   pages: (dok: Plenarprotokoll) => `${dok.anfangsseite} - ${dok.endseite}`,
  },
  Document: {
   editor: (dok: Drucksache) => dok.herausgeber,
   number: (dok: Drucksache) => dok.dokumentnummer,
   type: (dok: Drucksache) => dok.drucksachetyp,
   url: (dok: Drucksache) => dok.pdf_url,
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
    plenums: (vorgang: Vorgang, _args: any, { dataSources: { dipAPI } }: { dataSources: { dipAPI: DipAPI } }) => {
      return dipAPI.getVorgangsPlenarProtokolle(vorgang.id)
    },
    importantDocuments: (vorgang: Vorgang, _args: any, { dataSources: { dipAPI } }: { dataSources: { dipAPI: DipAPI } }) => {
      return dipAPI.getVorgangsDrucksachen(vorgang.id)
    },
    gestOrderNumber: (vorgang: Vorgang) => vorgang.gesta,
    legalValidity: (vorgang: Vorgang) => {
      if(!vorgang.inkrafttreten) return []
      return vorgang.inkrafttreten.map(ik => {
        const datum = inkrafttretenDateFormat.format(new Date(ik.datum))
        return `${datum}${ik.erlaeuterung ? ` (${ik.erlaeuterung})` : ''}`
      })
    }
  },
  Query: {
    procedure: (_parent: any,  args: { id: string }, { dataSources: { dipAPI } }: { dataSources: { dipAPI: DipAPI } }) => {
      return dipAPI.getVorgang(args.id)
    },
    procedures: (_parent: any, args: ProceduresArgs, { dataSources: { dipAPI } }: { dataSources: { dipAPI: DipAPI } }) => {
      return dipAPI.getVorgaenge(args)
    }
  }
}
