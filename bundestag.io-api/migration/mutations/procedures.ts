const gql = String.raw // just for syntax highlighting
export default gql`
mutation($procedures: [AddProcedureInput!]!) {
  addProcedure(input: $procedures) {
    numUids
    procedure {
      _id
    }
  }
}
`
