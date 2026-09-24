export interface PlenaryMinutesItem {
  meeting: number;
  period: number;
  date: Date;
  xml: string;
}

export interface DipPlenarprotokoll {
  id: string;
  dokumentnummer: string;
  wahlperiode: number;
  datum: string;
  fundstelle: {
    xml_url?: string;
  };
}

export interface DipPlenarprotokollResponse {
  numFound: number;
  cursor: string;
  documents: DipPlenarprotokoll[];
}
