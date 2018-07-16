export default `

type LegislativePeriod {
  legislativePeriod: Int!
}

type Query {
  legislativePeriod(period: Int!): LegislativePeriod
  legislativePeriods: [LegislativePeriod]
}
`;
