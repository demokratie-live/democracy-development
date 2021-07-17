export default `

  enum VoteSelection {
    YES
    NO
    ABSTINATION
    NOTVOTED
  }

  type CommunityConstituencyVotes {
    constituency: String!
    yes: Int!
    no: Int!
    abstination: Int!
    total: Int!
  }

  type CommunityVotes {
    yes: Int!
    no: Int!
    abstination: Int!
    total: Int!
    constituencies: [CommunityConstituencyVotes!]!
  }

  type DeputyVote {
    deputy: Deputy!
    decision: VoteSelection!
  }

  type VoteResult {
    procedureId: String!
    yes: Int!
    no: Int!
    abstination: Int!
    notVoted: Int
    notVote: Int @deprecated
    governmentDecision: VoteSelection!
    decisionText: String
    namedVote: Boolean!
    partyVotes: [PartyVote!]!
    deputyVotes(constituencies: [String!], directCandidate: Boolean): [DeputyVote!]!
  }

  type PartyVote {
    party: String!
    main: VoteSelection!
    deviants: Deviants!
  }

  type Deviants {
    yes: Int!
    abstination: Int!
    no: Int!
    notVoted: Int
  }

  type Vote {
    _id: ID!
    voted: Boolean!
    voteResults: CommunityVotes
  }

  type VoteStatistic {
    proceduresCount: Int!
    votedProcedures: Int!
  }
  
  type Mutation {
    vote(procedure: ID!, selection: VoteSelection!, constituency: String): Vote!
  }
  

  type Query {
    votes(procedure: ID!, constituencies: [String!]): Vote
    communityVotes(procedure: ID!, constituencies: [String!]): CommunityVotes
    voteStatistic: VoteStatistic
  }
  `;
