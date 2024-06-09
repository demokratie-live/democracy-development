import axios from 'axios';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('Device GraphQL API', () => {
  describe('notification settings', () => {
    const SOME_DEVICE_HASH = Math.random().toString(36).substring(7);
    it('get notification settings', async () => {
      const response = await axios.post(
        GRAPHQL_API_URL,
        {
          query: `
        query NotificationSettings {
          notificationSettings {
            enabled
            conferenceWeekPushs
            voteConferenceWeekPushs
            voteTOP100Pushs
            outcomePushs
          }
          }
      `,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-device-hash': SOME_DEVICE_HASH,
          },
        },
      );

      const { data } = response.data;

      expect(data).toBeDefined();
      expect(data.notificationSettings).toBeDefined();
      expect(data.notificationSettings.enabled).toBeTruthy();
      expect(data.notificationSettings.conferenceWeekPushs).toBeTruthy();
      expect(data.notificationSettings.voteConferenceWeekPushs).toBeFalsy();
      expect(data.notificationSettings.voteTOP100Pushs).toBeFalsy();
      expect(data.notificationSettings.outcomePushs).toBeFalsy();
    });

    it('update notification settings', async () => {
      const response = await axios.post(
        GRAPHQL_API_URL,
        {
          query: `
        mutation UpdateNotificationSettings($enabled: Boolean!, $conferenceWeekPushs: Boolean!, $voteConferenceWeekPushs: Boolean!, $voteTOP100Pushs: Boolean!, $outcomePushs: Boolean!) {
          updateNotificationSettings(enabled: $enabled, conferenceWeekPushs: $conferenceWeekPushs, voteConferenceWeekPushs: $voteConferenceWeekPushs, voteTOP100Pushs: $voteTOP100Pushs, outcomePushs: $outcomePushs) {
            enabled
            conferenceWeekPushs
            voteConferenceWeekPushs
            voteTOP100Pushs
            outcomePushs
          }
        }
      `,
          variables: {
            enabled: true,
            conferenceWeekPushs: true,
            voteConferenceWeekPushs: true,
            voteTOP100Pushs: true,
            outcomePushs: true,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-device-hash': SOME_DEVICE_HASH,
          },
        },
      );

      const { data } = response.data;

      expect(data).toBeDefined();
      expect(data.updateNotificationSettings).toBeDefined();
      expect(data.updateNotificationSettings.enabled).toBeTruthy();
      expect(data.updateNotificationSettings.conferenceWeekPushs).toBeTruthy();
      expect(data.updateNotificationSettings.voteConferenceWeekPushs).toBeTruthy();
      expect(data.updateNotificationSettings.voteTOP100Pushs).toBeTruthy();
      expect(data.updateNotificationSettings.outcomePushs).toBeTruthy();
    });
    it('get updated notification settings', async () => {
      const response = await axios.post(
        GRAPHQL_API_URL,
        {
          query: `
        query NotificationSettings {
          notificationSettings {
            enabled
            conferenceWeekPushs
            voteConferenceWeekPushs
            voteTOP100Pushs
            outcomePushs
          }
          }
      `,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-device-hash': SOME_DEVICE_HASH,
          },
        },
      );
  
      const { data } = response.data;
  
      expect(data).toBeDefined();
      expect(data.notificationSettings).toBeDefined();
      expect(data.notificationSettings.enabled).toBeTruthy();
      expect(data.notificationSettings.conferenceWeekPushs).toBeTruthy();
      expect(data.notificationSettings.voteConferenceWeekPushs).toBeTruthy();
      expect(data.notificationSettings.voteTOP100Pushs).toBeTruthy();
      expect(data.notificationSettings.outcomePushs).toBeTruthy();
    });
  });
});
