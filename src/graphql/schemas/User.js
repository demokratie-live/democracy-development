export default `

enum UserRole {
  WEB
  BACKEND
}

type User {
  email: String!
  role: UserRole
  jwt: String
}

type Mutation {
  signIn(email: String!, password: String!): User
}
`;
