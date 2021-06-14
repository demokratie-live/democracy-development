export type Deskriptor = {
   fundstelle: boolean
   name: string
   typ: string
}

export type Inkrafttreten = {
   datum: Date
   erlaeuterung?: string
}

export type Vorgang = {
   id: string
   titel: string
   typ: string
   beratungsstand: string
   wahlperiode: number
   sachgebiet: string[]
   datum: Date
   deskriptor?: Array<Deskriptor>
   gesta: string | undefined
   inkrafttreten?: Array<Inkrafttreten>
}
export type Plenarprotokoll = {
  id: string
  pdf_url: string,
  dokumentart: string
  dokumentnummer: string
  datum: Date
  verteildatum: Date
  herausgeber: string
  urheber: string[],
  anfangsseite: number
  endseite: number
  anfangsquadrant: string
  endquadrant: string
}

export type Drucksache = {
   id: string
   pdf_url: string
   dokumentart: string
   dokumentnummer: string
   datum: Date
   drucksachetyp: string
   herausgeber: string
   urheber: string[]
}

export type Fundstelle = Drucksache | Plenarprotokoll

export type Vorgangsposition = {
 id: string
 vorgangsposition: string
 zuordnung: string
 gang: boolean
 fortsetzung: boolean
 nachtrag: boolean
 vorgangstyp: string
 typ: string
 titel: string
 aktivitaet_anzahl: number
 dokumentart: string
 vorgang_id: string
 datum: Date
 fundstelle: Fundstelle
}
