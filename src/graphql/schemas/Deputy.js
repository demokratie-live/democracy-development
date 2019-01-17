export default `

type DeputyLink {
  name: String
  URL: String
}

type DeputyFunctions {
  category: String
  functions: [String],
}

type Deputy {
  _id: ID!
  URL: String!
  webId: String
  imgURL: String
  party: String
  name: String!
  job: String
  office: [String]
  links: [DeputyLink]
  biography: [String]
  constituency: String
  constituencyName: String
  directCandidate: Boolean,
  functions: [DeputyFunctions],
  speechesURL: String
  votesURL: String
  publicationRequirement: [String]
}

type DeputyUpdate {
  beforeCount: Int!
  afterCount: Int!
  newCount: Int
  changedCount: Int
  deputies: [Deputy]
}

type Query {
  deputy(webId: String!): Deputy
  deputies(limit: Int, offset: Int): [Deputy]
  deputyUpdates(since: Date!, limit: Int, offset: Int): DeputyUpdate
}
`;
