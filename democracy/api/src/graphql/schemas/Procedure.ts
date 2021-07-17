export default `
${/* DEPRECATED ListType 2019-01-29 Renamed filed VOTING to PAST and IN_VOTE */ ''}
enum ProcedureType {
  IN_VOTE @deprecated(reason: "Use procedures Query param listTypes instead of type")
  PREPARATION @deprecated(reason: "Use procedures Query param listTypes instead of type")
  VOTING @deprecated(reason: "Use procedures Query param listTypes instead of type")
  PAST @deprecated(reason: "Use procedures Query param listTypes instead of type")
  HOT @deprecated(reason: "Use procedures Query param listTypes instead of type")
} 

enum ListType {
  PREPARATION
  IN_VOTE
  PAST
  HOT
  TOP100
  CONFERENCEWEEKS_PLANNED
}

type Procedure {
  _id: ID!
  title: String!
  procedureId: String!
  type: String!
  period: Int
  currentStatus: String
  currentStatusHistory: [String!]!
  abstract: String
  tags: [String!]!
  voteDate: Date
  voteEnd: Date
  voteWeek: Int
  voteYear: Int
  sessionTOPHeading: String
  subjectGroups: [String!]!
  submissionDate: Date
  activityIndex: ActivityIndex!
  votes: Int!
  importantDocuments: [Document!]!
  voteResults: VoteResult
  communityVotes(constituencies: [String!]): CommunityVotes
  voted: Boolean!
  votedGovernment: Boolean
  completed: Boolean
  notify: Boolean
  ${/* DEPRECATED ListType 2019-01-29 Renamed filed VOTING to PAST and IN_VOTE */ ''}
  listType: ProcedureType @deprecated(reason: "Use listTypes instead of type")
  list: ListType
  verified: Boolean
}

type SearchProcedures {
  procedures: [Procedure!]!
  autocomplete: [String!]!
}

input ProcedureFilter {
  subjectGroups: [String!]
  status: [String!]
  type: [String!]
  activity: [String!]
}

input ProcedureWOMFilter {
  subjectGroups: [String!]!
}

enum VotedTimeSpan {
  CurrentSittingWeek
  LastSittingWeek
  CurrentQuarter
  LastQuarter
  CurrentYear
  LastYear
  Period
}

type ProceduresHavingVoteResults {
  total: Int!
  procedures: [Procedure!]!
}

type Query {
  procedure(id: ID!): Procedure!
  ${/* DEPRECATED listType 2019-01-29 Renamed filed VOTING to PAST and IN_VOTE */ ''}
  procedures(listTypes: [ListType!], type: ProcedureType, pageSize: Int, offset: Int, sort: String, filter: ProcedureFilter): [Procedure!]!
  proceduresById(ids: [String!]!, pageSize: Int, offset: Int): [Procedure!]!
  proceduresByIdHavingVoteResults(procedureIds: [String!], timespan: VotedTimeSpan, pageSize: Int, offset: Int, filter: ProcedureWOMFilter): ProceduresHavingVoteResults!
  notifiedProcedures: [Procedure!]!
  searchProcedures(term: String!): [Procedure!]! @deprecated(reason: "use searchProceduresAutocomplete")
  searchProceduresAutocomplete(term: String!): SearchProcedures!
  votedProcedures: [Procedure!]!
  proceduresWithVoteResults(procedureIds: [String!]!): [Procedure!]!
}
`;
