export type Deskriptor = {
   fundstelle: boolean
   name: string
   typ: string
}
export type Vorgang = {
   id: String
   titel: String
   typ: String
   beratungsstand: String
   wahlperiode: Number
   sachgebiet: String[]
   datum: Date
   deskriptor?: Array<Deskriptor>
}
