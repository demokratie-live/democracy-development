export default `
type DeputyLink {
  name: String!
  URL: String!
  username: String
}

type DeputyContact {
  address: String
  email: String
  links: [DeputyLink!]!
}

type DeputyProcedure {
  decision: VoteSelection!
  procedure: Procedure!
}

type Deputy {
  _id: ID!
  webId: String!
  imgURL: String!
  name: String!
  party: String
  job: String
  biography: String
  constituency: String
  directCandidate: Boolean
  contact: DeputyContact
  totalProcedures: Int
  procedures(procedureIds: [String!], pageSize: Int, offset: Int): [DeputyProcedure!]!
  period: Int!
}

type DeputiesResult {
  total: Int!
  hasMore: Boolean!
  data: [Deputy!]!
}

type Query {
  deputiesOfConstituency(constituency: String!, period: Int, directCandidate: Boolean): [Deputy!]!
  deputies(period: Int, limit: Int, offset: Int, filterTerm: String, filterIds: [String!], excludeIds: [String!], filterConstituency: String): DeputiesResult!
  deputy(id: String!): Deputy
}
`;
