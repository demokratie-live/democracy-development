export default `
  type User {
    _id: String!
    verified: Boolean!
    deviceHash: String @deprecated
  }
  
  type Auth {
    token: String!
  }
  
  type Mutation {
    signUp(deviceHashEncrypted: String!): Auth
  }
  
  type Query {
    me: User
  }
  `;
