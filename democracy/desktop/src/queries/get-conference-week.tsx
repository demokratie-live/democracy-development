import { gql } from '@apollo/client';

export const GET_CONFERENCE_WEEK = gql`
  query conferenceWeek {
    currentConferenceWeek {
      calendarWeek
      end
      start
    }
  }
`;
