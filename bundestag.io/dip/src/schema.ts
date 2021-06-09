import { gql } from 'apollo-server'
export default gql`
type Query {
  procedures(offset: Int, limit: Int): [Procedure]
}
scalar Date

type Procedure {
  id: ID!
  titel: String!
  beratungsstand: String
  vorgangstyp: String
  typ: String
  wahlperiode: Int
  initiative: [String]
  datum: Date
  deskriptor: [Deskriptor]
  sachgebiet: [String]
}

type Deskriptor {
  fundstelle: Boolean
  name: String
  type: String
}
`
