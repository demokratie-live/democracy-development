export default `

type LegislativePeriod {
  number: Int!
  start: Date!
  end: Date
  deputies: Int!
}

type Query {
  legislativePeriod(period: Int!): LegislativePeriod
  legislativePeriods: [LegislativePeriod]
}
`;
