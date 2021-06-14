import { gql } from 'apollo-server'
export default gql`
type Query {
  procedures(offset: Int, limit: Int! = 50, filter: ProcedureFilter): [Procedure]
  procedure(id: ID!): Procedure
}
scalar Date
input ProcedureFilter {
  before: Date
  after: Date
}

type Document {
  editor: String
  number: String
  type: String
  url: String
}
type Plenum {
  editor: String
  number: String
  link: String
  pages: String
}
type Procedure {
  procedureId: ID!
  title: String!
  abstract: String
  currentStatus: String
  type: String
  period: Int
  initiative: [String]
  date: Date
  subjectGroups: [String]
  tags: [String]
  importantDocuments: [Document]
  plenums: [Plenum]
  gestOrderNumber: String
  legalValidity: [String]
}
`
