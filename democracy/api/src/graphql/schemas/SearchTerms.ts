export default `

type SearchTerm {
  term: String!
}

type Query {
  mostSearched: [SearchTerm!]!
}
 
type Mutation {
  finishSearch(term: String!): SearchTerm!
}
`;
