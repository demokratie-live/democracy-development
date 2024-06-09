import axios from 'axios';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('ConferenceWeek GraphQL API', () => {
  it('data with device', async () => {
    const response = await axios.post(
      GRAPHQL_API_URL,
      {
        query: `
        query CurrentConferenceWeek {
          currentConferenceWeek {
            start
            end
            calendarWeek
            __typename
          }
        }
      `,
      },
    );

    const { data } = response.data;

    expect(data).toBeDefined();
    expect(data.currentConferenceWeek).toBeDefined();
    expect(data.currentConferenceWeek.start).toBeDefined();
    expect(data.currentConferenceWeek.end).toBeDefined();
    expect(data.currentConferenceWeek.calendarWeek).toBeDefined();
  });
});
