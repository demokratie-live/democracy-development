export type ProcedureFilter = {
  before?: Date
  after?: Date
}
export type ProceduresArgs = {
  cursor: string,
  limit: number,
  offset: number,
  filter?: ProcedureFilter
}
