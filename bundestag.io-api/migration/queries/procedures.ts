const gql = String.raw // just for syntax highlighting
 export default gql`
 query download($limit: Int) {
  downloaded: procedures(limit: $limit) {
    title
    procedureId
    type
    period
    currentStatus
    currentStatusHistory
    signature
    gestOrderNumber
    approvalRequired
    euDocNr
    abstract
    promulgation
    legalValidity
    tags
    subjectGroups
    history {
      assignment
      initiator
      findSpot
      findSpotUrl
      decision {
        page
        tenor
        document
        type
        comment
        foundation
        majority
      }
      date
    }
    importantDocuments {
      editor
      number
      type
      url
    }
    customData {
      title
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
            abstination
            no
            notVoted
          }
        }
      }
    }
    namedVote
    voteDate
    voteEnd
    sessions {
      URL
      id
      previousYear
      previousWeek
      thisYear
      thisWeek
      nextYear
      nextWeek
      session {
        date
        dateText
        session
        top {
          time
          top
          heading
          article
          topic {
            lines
            documents
            isVote
            procedureId
          }
          status {
            line
            documents
          }
        }
      }
    }
  }
}
`

