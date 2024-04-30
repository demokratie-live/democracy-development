export default `

type ConferenceWeek {
  start: Date!
  end: Date!
  calendarWeek: Int!
}

type Query {
  currentConferenceWeek: ConferenceWeek!
}
`;
