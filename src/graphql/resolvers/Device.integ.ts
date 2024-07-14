import {
  Device,
  DeviceModel,
  Phone,
  PhoneModel,
  UserModel,
  VerificationModel,
} from '@democracy-deutschland/democracy-common';
import axios from 'axios';
import crypto from 'crypto';
import { connectDB, disconnectDB } from '../../services/mongoose';
import config from '../../config';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('Device GraphQL API', () => {
  const xDeviceHash = 'xDeviceHash_DEVICE_TESTS';
  const deviceHash = crypto.createHash('sha256').update(xDeviceHash).digest('hex');
  let device: Device;
  const PHONE_NUMBER = `+49123456789`;
  const xPhoneHash = crypto.createHash('sha256').update(PHONE_NUMBER).digest('hex');
  const phoneHash = crypto.createHash('sha256').update(xPhoneHash).digest('hex');
  let phone: Phone;

  beforeAll(async () => {
    await connectDB(config.DB_URL, { debug: false });

    device = await DeviceModel.create({
      deviceHash,
    });

    phone = await PhoneModel.create({
      phoneHash,
      xPhoneHash,
      device,
    });
  });

  afterAll(async () => {
    await Promise.all([
      UserModel.deleteMany({ device }),
      device.remove(),
      phone.remove(),
      VerificationModel.deleteMany({ phoneHash }),
    ]);

    await disconnectDB();
  });

  describe('Query', () => {
    describe('notificationSettings', () => {
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
              'x-device-hash': xDeviceHash,
            },
          },
        );

        const { data, error } = response.data;

        expect(error).toBeUndefined();
        expect(data).toBeDefined();
        expect(data.notificationSettings).toBeDefined();
        expect(data.notificationSettings.enabled).toBeTruthy();
        expect(data.notificationSettings.conferenceWeekPushs).toBeTruthy();
        expect(data.notificationSettings.voteConferenceWeekPushs).toBeFalsy();
        expect(data.notificationSettings.voteTOP100Pushs).toBeFalsy();
        expect(data.notificationSettings.outcomePushs).toBeFalsy();
      });

      it('is not allowed to get notification settings without device hash', async () => {
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
            },
          },
        );

        const { data, errors } = response.data;

        expect(data).toBeDefined();
        expect(data.notificationSettings).toBeNull();
        expect(errors).toBeDefined();
        expect(errors[0].message).toBe('Not Authorised!');
      });
    });
  });
  describe('Mutation', () => {
    describe('requestCode', () => {
      it('Not Authorised!', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
            mutation RequestCode($newPhone: String!, $oldPhoneHash: String) {
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
            },
          },
        );

        const { data, errors } = response.data;

        expect(data).toBeDefined();
        expect(data).toBeNull();
        expect(errors).toBeDefined();
        expect(errors[0].message).toBe('Not Authorised!');
      });
    });

    describe('requestVerification', () => {
      it('Not Authorised!', async () => {
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
              newPhoneHash: phoneHash,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const { data, errors } = response.data;

        expect(data).toBeDefined();
        expect(data).toBeNull();
        expect(errors).toBeDefined();
        expect(errors[0].message).toBe('Not Authorised!');
      });
    });

    describe('addToken', () => {
      it('Not Authorised!', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
                mutation AddToken($token: String!, $os: String!) {
                  addToken(token: $token, os: $os) {
                    succeeded
                  }
                }
              `,
            variables: {
              token: '000000',
              os: 'ios',
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const { data, errors } = response.data;

        expect(data).toBeDefined();
        expect(data).toBeNull();
        expect(errors).toBeDefined();
        expect(errors[0].message).toBe('Not Authorised!');
      });
    });

    describe('updateNotificationSettings', () => {
      it('Not Authorised!', async () => {
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

        const { data, errors } = response.data;

        expect(data).toBeDefined();
        expect(data.updateNotificationSettings).toBeNull();
        expect(errors).toBeDefined();
        expect(errors[0].message).toBe('Not Authorised!');
      });
    });

    describe('toggleNotification', () => {
      it('Not Authorised!', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
              mutation ToggleNotification($procedureId: String!) {
                toggleNotification(procedureId: $procedureId) {
                  title
                }
              }
            `,
            variables: {
              procedureId: '0000000',
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );

        const { data, errors } = response.data;

        expect(data).toBeDefined();
        expect(data.toggleNotification).toBeNull();
        expect(errors).toBeDefined();
        expect(errors[0].message).toBe('Not Authorised!');
      });
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
            'x-device-hash': xDeviceHash,
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
            'x-device-hash': xDeviceHash,
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

  describe('verify device', () => {
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
            'x-device-hash': xDeviceHash,
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
            'x-device-hash': xDeviceHash,
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
            'x-device-hash': xDeviceHash,
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
            'x-device-hash': xDeviceHash,
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
