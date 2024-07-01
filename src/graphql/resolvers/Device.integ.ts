import axios from 'axios';
import crypto from 'crypto';

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

    it('is not allowed to update notification settings without device hash', async () => {
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
          },
        },
      );

      const error = response.data.errors.find((e) => e.path.includes('updateNotificationSettings'));
      if (error) {
        expect(error.message).toBe('Not Authorised!');
        expect(response.data.notificationSettings).toBeUndefined();
      } else {
        expect(true).toBeFalsy();
      }
    });
  });

  describe('verify device', () => {
    const SOME_DEVICE_HASH = Math.random().toString(36).substring(7);
    const PHONE_NUMBER = `+49123456789`;
    it('request verification code via sms', async () => {
      const response = await axios.post(
        GRAPHQL_API_URL,
        {
          query: `
            mutation RequestSmsCode($newPhone: String!, $oldPhoneHash: String) {
              requestCode(newPhone: $newPhone, oldPhoneHash: $oldPhoneHash) {
                reason
                allowNewUser
                succeeded
                resendTime
                expireTime
              }
            }
          `,
          variables: {
            newPhone: PHONE_NUMBER,
            oldPhoneHash: '',
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
      expect(data.requestCode).toBeDefined();
      expect(data.requestCode.succeeded).toBeTruthy();
    });

    it('request fast second verification code via sms', async () => {
      const response = await axios.post(
        GRAPHQL_API_URL,
        {
          query: `
            mutation RequestSmsCode($newPhone: String!, $oldPhoneHash: String) {
              requestCode(newPhone: $newPhone, oldPhoneHash: $oldPhoneHash) {
                reason
                allowNewUser
                succeeded
                resendTime
                expireTime
              }
            }
          `,
          variables: {
            newPhone: PHONE_NUMBER,
            oldPhoneHash: '',
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
      expect(data.requestCode).toBeDefined();
      expect(data.requestCode.succeeded).toBeFalsy();
    });

    it('try to verify phone number with wrong code', async () => {
      const newPhoneHash = crypto.createHash('sha256').update(PHONE_NUMBER).digest('hex');
      const response = await axios.post(
        GRAPHQL_API_URL,
        {
          query: `
            mutation RequestVerification($code: String!, $newPhoneHash: String!, $newUser: Boolean) {
              requestVerification(code: $code, newPhoneHash: $newPhoneHash, newUser: $newUser) {
                reason
                succeeded
              }
            }
          `,
          variables: {
            code: '123456',
            newPhoneHash,
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
      expect(data.requestVerification).toBeDefined();
      expect(data.requestVerification.succeeded).toBeFalsy();
    });

    it('verify phone number', async () => {
      const newPhoneHash = crypto.createHash('sha256').update(PHONE_NUMBER).digest('hex');
      const response = await axios.post(
        GRAPHQL_API_URL,
        {
          query: `
            mutation RequestVerification($code: String!, $newPhoneHash: String!, $newUser: Boolean) {
              requestVerification(code: $code, newPhoneHash: $newPhoneHash, newUser: $newUser) {
                reason
                succeeded
              }
            }
          `,
          variables: {
            code: '000000',
            newPhoneHash,
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
      expect(data.requestVerification).toBeDefined();
      expect(data.requestVerification.succeeded).toBeTruthy();
    });
  });
});
