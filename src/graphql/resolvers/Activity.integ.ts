import {
  IProcedure,
  Device,
  Phone,
  User,
  ProcedureModel,
  DeviceModel,
  PhoneModel,
  UserModel,
  ActivityModel,
} from '@democracy-deutschland/democracy-common';
import axios from 'axios';
import crypto from 'crypto';
import { connectDB, disconnectDB } from '../../services/mongoose';
import config from '../../config';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('Activity Resolvers', () => {
  describe('Queries', () => {
    describe('activityIndex', () => {
      let procedure: IProcedure;
      let user: User;

      beforeAll(async () => {
        await connectDB(config.DB_URL, { debug: false });

        // create tmp procedure
        procedure = await ProcedureModel.create({
          procedureId: '0000010',
          title: 'tmp procedure for activityIndex test',
          period: 1,
          type: 'Antrag',
          voteResults: {
            yes: 0,
            no: 0,
            abstination: 0,
          },
        });

        user = await UserModel.create({
          verified: true,
        });

        // create tmp activities
        await ActivityModel.create([
          {
            procedure,
            kind: 'Phone',
            actor: user,
          },
        ]);
      });

      afterAll(async () => {
        await Promise.all([
          ActivityModel.deleteOne({ procedure: procedure }),
          procedure.remove(),
          user.remove(),
        ]);

        await disconnectDB();
      });

      it('fail to get activity index on non-existing procedure', async () => {
        const response = await axios.post(GRAPHQL_API_URL, {
          query: `
            query ActivityIndex($procedureId: String!) {
              activityIndex(procedureId: $procedureId) {
                activityIndex
                active
              }
            }
          `,
          variables: {
            procedureId: 'non-existing-procedure-id',
          },
        });

        const { data } = response.data;

        expect(data).toBeDefined();
        expect(data.activityIndex).toBeNull();
      });

      it('get activity index', async () => {
        const response = await axios.post(GRAPHQL_API_URL, {
          query: `
            query ActivityIndex($procedureId: String!) {
              activityIndex(procedureId: $procedureId) {
                activityIndex
                active
              }
            }
          `,
          variables: {
            procedureId: '0000010',
          },
        });

        const { data } = response.data;

        expect(data).toBeDefined();
        expect(data.activityIndex).toBeDefined();
        expect(data.activityIndex.activityIndex).toBe(1);
        expect(data.activityIndex.active).toBeTruthy();
      });
    });
  });

  describe('Mutations', () => {
    describe('increaseActivity', () => {
      const xDeviceHash = 'SOME_DEVICE_HASH_ACTIVITY_RESOLVER_INCREASE_ACTIVITY';
      const deviceHash = crypto.createHash('sha256').update(xDeviceHash).digest('hex');
      let device: Device;
      const xDeviceHashNotVerified =
        'SOME_DEVICE_HASH_ACTIVITY_RESOLVER_INCREASE_ACTIVITY_NOT_VERIFIED';
      const deviceHashNotVerified = crypto
        .createHash('sha256')
        .update(xDeviceHashNotVerified)
        .digest('hex');
      let deviceNotVerified: Device;
      const PHONE_NUMBER = `+49111111111`;
      const xPhoneHash = crypto.createHash('sha256').update(PHONE_NUMBER).digest('hex');
      const phoneHash = crypto.createHash('sha256').update(xPhoneHash).digest('hex');
      let procedure: IProcedure;
      let phone: Phone;
      let user: User;
      let userNotVerified: User;

      beforeAll(async () => {
        await connectDB(config.DB_URL, { debug: false });

        // create tmp procedure
        procedure = await ProcedureModel.create({
          procedureId: '0000000',
          title: 'tmp procedure for increaseActivity test',
          period: 1,
          type: 'Antrag',
          voteResults: {
            yes: 0,
            no: 0,
            abstination: 0,
          },
        });

        device = await DeviceModel.create({
          deviceHash,
        });

        deviceNotVerified = await DeviceModel.create({
          deviceHash: deviceHashNotVerified,
        });

        phone = await PhoneModel.create({
          phoneHash,
        });

        userNotVerified = await UserModel.create({
          verified: false,
          device: deviceNotVerified,
        });

        // create tmp user
        user = await UserModel.create({
          verified: true,
          device,
          phone,
        });
      });

      afterAll(async () => {
        await Promise.all([
          ActivityModel.deleteOne({ procedure: procedure }),
          procedure.remove(),
          phone.remove(),
          device.remove(),
          user.remove(),
          deviceNotVerified.remove(),
          userNotVerified.remove(),
        ]);

        await disconnectDB();
      });

      it('fail to increase activity on non-existing procedure', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
          mutation IncreaseActivity($procedureId: String!) {
            increaseActivity(procedureId: $procedureId) {
              activityIndex
              active
            }
          }
        `,
            variables: {
              procedureId: 'non-existing-procedure-id',
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-device-hash': xDeviceHash,
              'x-phone-hash': xPhoneHash,
            },
          },
        );

        const { data } = response.data;

        expect(data).toBeDefined();
        expect(data.increaseActivity).toBeNull();
      });

      it('increase activity', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
          mutation IncreaseActivity($procedureId: String!) {
            increaseActivity(procedureId: $procedureId) {
              activityIndex
              active
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
              'x-device-hash': xDeviceHash,
              'x-phone-hash': xPhoneHash,
            },
          },
        );

        const { data } = response.data;

        expect(data).toBeDefined();
        expect(data.increaseActivity).toBeDefined();
        expect(data.increaseActivity.activityIndex).toBeDefined();
        expect(data.increaseActivity.active).toBeTruthy();
      });

      it('not verified', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
          mutation IncreaseActivity($procedureId: String!) {
            increaseActivity(procedureId: $procedureId) {
              activityIndex
              active
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
              'x-device-hash': xDeviceHashNotVerified,
            },
          },
        );

        const { data, errors } = response.data;

        expect(data).toBeDefined();
        expect(data.increaseActivity).toBeNull();
        expect(errors).toBeDefined();
        expect(errors[0].message).toBe('Not Verified!');
      });
    });
  });
});
