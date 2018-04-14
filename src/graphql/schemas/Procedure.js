export default `
type Procedure {
  _id: ID!
  title: String!
  procedureId: String
  type: String
  period: Int
  currentStatus: String
  signature: String
  gestOrderNumber: String
  approvalRequired: [String]
  euDocNr: String
  abstract: String
  promulgation: [String]
  legalValidity: [String]
  tags: [String]
  subjectGroups: [String]
  history: [ProcessFlow]
  importantDocuments: [Document]
  bioUpdateAt: Date
}

type Query {
  getProcedure(_id: ID!): Procedure
  procedures(offset: Int, IDs: [String!], status: [String!]): [Procedure]
  allProcedures(offset: Int): [Procedure]
  procedureUpdates(offset: Int, period: [Int!], type: [String!]): [Procedure]
}
`;
