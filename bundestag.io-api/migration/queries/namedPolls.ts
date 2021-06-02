const gql = String.raw
export default gql`
query download($limit: Int) {
  downloaded: namedPolls(limit: $limit) {
    webId
    URL
    date
    deputyVotesURL
    description
    detailedDescription
    documents
    procedureId
    title
    plenarProtocolURL
    media {
      iTunesURL
      mediathekURL
      videoURLs {
        URL
        description
      }
    }
    speeches {
      deputyName
      deputyName
      mediathekURL
      function
      party
    }
    votes {
      all {
        total
        yes
        no
        abstain
        na
      }
      parties {
        name
        votes {
          total
          yes
          no
          abstain
          na
        }
      }
      deputies {
        webId
        URL
        imgURL
        state
        name
        party
        vote
      }
      inverseVoteDirection
    }
  }
}
`
