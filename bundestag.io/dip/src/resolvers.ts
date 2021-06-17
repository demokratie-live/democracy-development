import DipAPI from './DipAPI'
import { Vorgang, Vorgangsposition, Drucksache, Plenarprotokoll } from './dip-types'
import { ProceduresArgs } from './types'

const germanDateFormat = new Intl.DateTimeFormat('de-DE', {
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
  ProcessFlow: {
    initiator: (vp: Vorgangsposition) => {
      if (!vp.fundstelle.urheber?.length) return vp.vorgangsposition
      return `${vp.vorgangsposition},  Urheber : ${vp.fundstelle.urheber.join(', ')}`
    },
    assignment: (vp: Vorgangsposition) => vp.fundstelle.herausgeber,
    findSpotUrl: (vp: Vorgangsposition) => vp.fundstelle.pdf_url,
    findSpot: (vp: Vorgangsposition) => {
      const { fundstelle } = vp
      const { herausgeber, dokumentart, dokumentnummer } = fundstelle
      const datum = germanDateFormat.format(new Date(fundstelle.datum))
      let result = `${datum} - ${herausgeber}-${dokumentart} ${dokumentnummer}`
      const { anfangsseite, endseite, anfangsquadrant, endquadrant } = fundstelle as Plenarprotokoll
      if(![anfangsseite, endseite, anfangsquadrant, endquadrant].every(Boolean)) return result
      return `${result}, S. ${anfangsseite}${anfangsquadrant} - ${endseite}${endquadrant}`
    },
    date: (vp: Vorgangsposition) => new Date(vp.fundstelle.datum).toISOString(),
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
        const datum = germanDateFormat.format(new Date(ik.datum))
        return `${datum}${ik.erlaeuterung ? ` (${ik.erlaeuterung})` : ''}`
      })
    },
    history: (vorgang: Vorgang, _args: any, { dataSources: { dipAPI } }: { dataSources: { dipAPI: DipAPI } }) => {
      return dipAPI.getVorgangsVorgangspositionen(vorgang.id)
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
