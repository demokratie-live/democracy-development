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
}

type Query {
  deputiesOfConstituency(constituency: String!, directCandidate: Boolean): [Deputy!]!
}
`;
