export type Deskriptor = {
   fundstelle: boolean
   name: string
   typ: string
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
}
export type Fundstelle = {
   id: string
   pdf_url: string
   dokumentnummer: string
   datum: Date
   dokumentart: string
   drucksachetyp: string
   herausgeber: string
   urheber: string[]
}

export type Dokument = {
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
