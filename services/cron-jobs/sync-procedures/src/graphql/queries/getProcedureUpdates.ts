import gql from "graphql-tag";

export default gql`
  query ProcedureUpdates(
    $since: Date!
    $limit: Int
    $offset: Int
    $periods: [Int!]
    $types: [String!]
  ) {
    procedureUpdates(
      since: $since
      limit: $limit
      offset: $offset
      periods: $periods
      types: $types
    ) {
      beforeCount
      afterCount
      newCount
      changedCount
      procedures {
        title
        procedureId
        type
        period
        currentStatus
        currentStatusHistory
        abstract
        tags
        subjectGroups
        history {
          assignment
          initiator
          decision {
            tenor
            type
            comment
          }
          date
        }
        importantDocuments {
          editor
          type
          url
          number
        }
        namedVote
        voteDate
        voteEnd
        customData {
          voteResults {
            yes
            no
            abstination
            notVoted
            decisionText
            votingDocument
            votingRecommendation
            partyVotes {
              party
              main
              deviants {
                yes
                no
                abstination
                notVoted
              }
            }
          }
        }
        sessions {
          thisYear
          thisWeek
          session {
            top {
              heading
              topic {
                isVote
              }
            }
          }
        }
      }
    }
  }
`;
