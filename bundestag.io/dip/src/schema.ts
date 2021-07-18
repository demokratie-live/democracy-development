import { gql } from 'apollo-server';
export default gql`
  type Query {
    procedure(id: ID!): Procedure
    procedures(cursor: String! = "*", offset: Int! = 0, limit: Int! = 50, filter: ProcedureFilter): ProcedureConnection
  }

  scalar Date
  input ProcedureFilter {
    before: Date
    after: Date
    types: [String]
  }

  type Document {
    editor: String
    number: String
    type: String
    url: String
  }
  type Plenum {
    editor: String
    number: String
    link: String
    pages: String
  }

  type Decision {
    page: String
    tenor: String
    document: String
    type: String
    comment: String
    foundation: String
    majority: String
  }

  type ProcessFlow {
    assignment: String
    initiator: String
    findSpot: String
    findSpotUrl: String
    decision: [Decision]
    date: Date
    abstract: String
  }

  type Procedure {
    procedureId: ID!
    title: String!
    abstract: String
    currentStatus: String
    type: String
    period: Int
    initiative: [String]
    date: Date
    subjectGroups: [String]
    tags: [String]
    importantDocuments: [Document]
    plenums: [Plenum]
    gestOrderNumber: String
    legalValidity: [String]
    history: [ProcessFlow]
  }

  # We cannot fully implement GraphQL Cursor Connections Specification as we don't
  # know how to generate cursors for single edges.
  # See: https://relay.dev/graphql/connections.htm
  type PageInfo {
    # hasPreviousPage: Boolean!
    hasNextPage: Boolean!
    startCursor: String!
    endCursor: String!
  }

  type ProcedureEdge {
    node: Procedure
    # cursor: String!
  }

  type ProcedureConnection {
    totalCount: Int!
    edges: [ProcedureEdge]
    pageInfo: PageInfo!
  }
`;
