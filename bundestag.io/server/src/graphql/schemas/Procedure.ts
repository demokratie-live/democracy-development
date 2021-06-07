export default `

type FilteredConferenceWeekDetailSessionTopTopic {
  lines: [String]
  documents: [String],
  isVote: Boolean
  procedureId: String
}

type FilteredConferenceWeekDetailSessionTop {
  time: Date
  top: String
  heading: String
  article: String
  topic: FilteredConferenceWeekDetailSessionTopTopic
  status: [ConferenceWeekDetailSessionTopStatus]
}
type FilteredConferenceWeekDetailSession {
  date: Date
  dateText: String
  session: String
  top: FilteredConferenceWeekDetailSessionTop
}
type FilteredConferenceWeekDetail {
  URL: String
  id: String!
  previousYear: Int
  previousWeek: Int
  thisYear: Int!
  thisWeek: Int!
  nextYear: Int
  nextWeek: Int
  session: FilteredConferenceWeekDetailSession
}

enum VoteDecision {
  YES
  ABSTINATION
  NO
  NOTVOTED
}

enum VotingDocument {
  mainDocument
  recommendedDecision
}

type ProcedureCustomData {
  title: String
  voteResults: VoteResults
}

type VoteResults {
  yes: Int
  no: Int
  abstination: Int
  notVoted: Int
  decisionText: String
  votingDocument: VotingDocument
  votingRecommendation: Boolean
  partyVotes: [PartyVote]
}

type PartyVote {
  party: String!
  main: VoteDecision
  deviants: Deviants
}

input PartyVoteInput {
  party: String!
  main: VoteDecision
  deviants: DeviantsInput
}

type Deviants {
  yes: Int
  abstination: Int
  no: Int
  notVoted: Int
}

input DeviantsInput {
  yes: Int
  abstination: Int
  no: Int
  notVoted: Int
}

type Procedure {
  _id: ID!
  title: String!
  procedureId: String
  type: String
  period: Int
  currentStatus: String
  currentStatusHistory: [String]
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
  customData: ProcedureCustomData
  namedVote: Boolean
  voteDate: Date
  voteEnd: Date
  sessions: [FilteredConferenceWeekDetail]
}

type ProcedureUpdate {
  beforeCount: Int!
  afterCount: Int!
  newCount: Int
  changedCount: Int
  procedures: [Procedure]
}

type VoteResultTexts {
  results: [String!]!
}

type Query {
  procedure(procedureId: String!): Procedure
  procedures(offset: Int, period: [Int!], type: [String!], IDs: [String!], status: [String!], voteDate: [Boolean!], manageVoteDate: Boolean, limit: Int, offset: Int): [Procedure]
  allProcedures(offset: Int, period: [Int!], type: [String!]): [Procedure]
  procedureUpdates(since: Date!, limit: Int, offset: Int, periods: [Int!], types: [String!]): ProcedureUpdate
  voteResultTextHelper(procedureId: String!): [VoteResultTexts!]
}

type Mutation {
  saveProcedureCustomData(procedureId: String!, partyVotes: [PartyVoteInput!]!, decisionText: String!, votingDocument: VotingDocument!): Procedure @auth(requires: BACKEND) 
  scrapeProcedures(key: String!): Boolean 
}
`;
