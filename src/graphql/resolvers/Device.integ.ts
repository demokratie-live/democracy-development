import axios from 'axios';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('Device GraphQL API', () => {
  it('should return data', async () => {
    const response = await axios.post(GRAPHQL_API_URL, {

      query: `
        query NotificationSettings {
          notificationSettings {
            enabled
            conferenceWeekPushs
            voteConferenceWeekPushs
            voteTOP100Pushs
            outcomePushs
            __typename
          }
          }
      `,
    }, {
      headers: {
        'Content-Type': 'application/json',
        "x-device-hash": "SOME_DEVICE_HASH"
      },
    
    });

    const { data } = response.data;

    expect(data).toBeDefined();
    expect(data.notificationSettings).toBeDefined();
    expect(data.notificationSettings.enabled).toBeDefined();
    expect(data.notificationSettings.conferenceWeekPushs).toBeDefined();
    expect(data.notificationSettings.voteConferenceWeekPushs).toBeDefined();
    expect(data.notificationSettings.voteTOP100Pushs).toBeDefined();
    expect(data.notificationSettings.outcomePushs).toBeDefined();
  });
});