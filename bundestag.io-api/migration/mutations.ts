const gql = String.raw // just for syntax highlighting
const procedures = gql`
mutation upload ($entries: [AddProcedureInput!]!) {
  uploaded: addProcedure(input: $entries) {
    numUids
    entries: procedure {
      _id
    }
  }
}
`

const deputies = gql`
mutation upload ($entries: [AddDeputyInput!]!) {
  uploaded: addDeputy(input: $entries) {
    numUids
    entries: deputy {
      _id
    }
  }
}
`
const conferenceWeekDetails = gql`
mutation upload ($entries: [AddConferenceWeekDetailInput!]!) {
  uploaded: addConferenceWeekDetail(input: $entries) {
    numUids
    entries: conferenceWeekDetail {
      URL
    }
  }
}
`

const namedPolls = gql`
mutation upload ($entries: [AddNamedPollInput!]!) {
  uploaded: addNamedPoll(input: $entries) {
    numUids
    entries: namedPoll {
      URL
    }
  }
}
`

export default {
  deputies,
  procedures,
  conferenceWeekDetails,
  namedPolls,
}
