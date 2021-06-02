const gql = String.raw
export default gql`
query download {
  downloaded: deputies {
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
