export interface MetaData {
  hits: number;
  nextOffset: number;
  staticItemCount: number;
}

export interface PlenaryMinutesItem {
  meeting: number;
  date: Date;
  xml: string;
}
