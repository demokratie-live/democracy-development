export default `

type ActivityIndex {
  activityIndex: Int!
  active: Boolean
}

type Query {
  activityIndex(procedureId: String!): ActivityIndex
}
 
type Mutation {
  increaseActivity(procedureId: String!): ActivityIndex
}
`;
