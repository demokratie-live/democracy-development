const gql = String.raw
export default gql`
mutation ($deputies: [AddDeputyInput!]!) {
  addDeputy(input: $deputies) {
    numUids
    deputy {
      _id
    }
  }
}
`
