export default `

type ConferenceWeekDetailSessionTopTopic {
    lines: [String]
    documents: [String],
    isVote: Boolean
    procedureIds: [String]
}

type ConferenceWeekDetailSessionTopStatus {
    line: String
    documents: [String]
}

type ConferenceWeekDetailSessionTop {
    time: Date
    top: String
    heading: String
    article: String
    topic: [ConferenceWeekDetailSessionTopTopic]
    status: [ConferenceWeekDetailSessionTopStatus]
}

type ConferenceWeekDetailSession {
  date: Date
  dateText: String
  session: String
  tops: [ConferenceWeekDetailSessionTop]
}

type ConferenceWeekDetail {
  URL: String
  id: String!
  previousYear: Int
  previousWeek: Int
  thisYear: Int!
  thisWeek: Int!
  nextYear: Int
  nextWeek: Int
  sessions: [ConferenceWeekDetailSession]
}

type Query {
  conferenceWeekDetail(year: Int!, week: Int!): ConferenceWeekDetail
  conferenceWeekDetails(limit: Int, offset: Int): [ConferenceWeekDetail]
}
`;
