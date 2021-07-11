export type ProcedureFilter = {
  before?: Date;
  after?: Date;
  types?: string[];
};
export type ProceduresArgs = {
  cursor: string;
  limit: number;
  offset: number;
  filter?: ProcedureFilter;
};
