const gql = String.raw
export default gql`
query download($limit: Int) {
  downloaded: deputies(limit: $limit) {
    biography
    constituency
    constituencyName
    directCandidate
    functions {
      category
      functions
    }
    imgURL
    job
    links {
      name
      URL
      username
    }
    name
    office
    party
    publicationRequirement
    speechesURL
    URL
    votesURL
    webId
  }
}
`
