const gql = String.raw

export default gql`
query download {
  downloaded: conferenceWeekDetails {
    URL
    id
    previousYear
    previousWeek
    thisYear
    thisWeek
    nextYear
    nextWeek
    sessions {
      date
      dateText
      session
      tops {
        time
        top
        heading
        article
        topic {
          lines
          documents
          isVote
          procedureIds
        }
        status {
          line
          documents
        }
      }
    }
  }
}
`
