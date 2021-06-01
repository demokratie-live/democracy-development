const gql = String.raw // just for syntax highlighting
export const uploadProcedures = gql`
mutation($procedures: [AddProcedureInput!]!) {
  addProcedure(input: $procedures) {
    procedure {
      title
      procedureId
      type
      period
      currentStatus
    }
  }
}
`
