export type ProcedureFilter = {
  before?: Date
  after?: Date
}
export type ProceduresArgs = {
  limit: number,
  offset?: number,
  filter?: ProcedureFilter
}
