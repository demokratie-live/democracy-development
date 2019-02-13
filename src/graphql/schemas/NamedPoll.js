export default `

type NamedPollMediaVideoURL {
  URL: String
  description: String
}

type NamedPollMedia {
  iTunesURL: String
  mediathekURL: String
  videoURLs: [NamedPollMediaVideoURL]
}

type NamedPollSpeech {
  deputyName: String
  deputyImgURL: String
  mediathekURL: String
  function: String
  party: String
}

type NamedPollVotesVotes {
  total: Int
  yes: Int
  no: Int
  abstain: Int
  na: Int
}

type NamedPollVotesParty {
  name: String
  votes: NamedPollVotesVotes
}

type NamedPollDeputy {
  webId: String
  URL: String
  imgURL: String
  state: String
  name: String
  party: String
  vote: String
}

type NamedPollVotes {
  all: NamedPollVotesVotes
  parties: [NamedPollVotesParty]
  deputies: [NamedPollDeputy]
}

type NamedPoll {
  _id: ID!
  webId: String!
  URL: String!
  date: Date
  deputyVotesURL: String
  description: String
  detailedDescription: String
  documents: [String]
  media: [NamedPollMedia]
  plenarProtocolURL: String
  procedureId: String
  speeches: [NamedPollSpeech]
  title: String
  votes: NamedPollVotes
}

type NamedPollUpdate {
  beforeCount: Int!
  afterCount: Int!
  newCount: Int
  changedCount: Int
  namedPolls: [NamedPoll]
}

type Query {
  namedPoll(webId: String!): NamedPoll
  namedPolls(limit: Int, offset: Int): [NamedPoll]
  namedPollUpdates(since: Date!, limit: Int, offset: Int): NamedPollUpdate
}
`;
