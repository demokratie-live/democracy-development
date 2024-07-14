import axios from 'axios';
import crypto from 'crypto';
import { connectDB, disconnectDB } from '../../services/mongoose';
import {
  Device,
  DeviceModel,
  IProcedure,
  Phone,
  PhoneModel,
  ProcedureModel,
  User,
  UserModel,
} from '@democracy-deutschland/democracy-common';
import config from '../../config';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('Resolver: Procedure', () => {
  describe('Query', () => {
    const xDeviceHash = 'SOME_DEVICE_HASH_PROCEDURE_RESOLVER_VOTED_PROCEDURES';
    const deviceHash = crypto.createHash('sha256').update(xDeviceHash).digest('hex');
    const PHONE_NUMBER = `+49111111112`;
    const xPhoneHash = crypto.createHash('sha256').update(PHONE_NUMBER).digest('hex');
    const phoneHash = crypto.createHash('sha256').update(xPhoneHash).digest('hex');
    let procedure: IProcedure;
    let device: Device;
    let phone: Phone;
    let user: User;
    let userNotVerified: User;

    beforeAll(async () => {
      await connectDB(config.DB_URL, { debug: false });

      // create tmp procedure
      procedure = await ProcedureModel.create({
        procedureId: '0000001',
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

      phone = await PhoneModel.create({
        phoneHash,
      });

      // create tmp user
      user = await UserModel.create({
        verified: true,
        device,
        phone,
      });

      userNotVerified = await UserModel.create({
        verified: false,
        device,
      });
    });

    afterAll(async () => {
      await Promise.all([
        procedure.remove(),
        phone.remove(),
        device.remove(),
        user.remove(),
        userNotVerified.remove(),
      ]);

      await disconnectDB();
    });
    describe('votedProcedures', () => {
      it('get voted procedures with no votes', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
        query VotedProcedures {
          votedProcedures {
            procedureId
          }
          }
      `,
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
        expect(data.votedProcedures).toBeDefined();
        expect(data.votedProcedures.length).toStrictEqual(0);
      });
      it('try to get voted procedures without phone', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
        query VotedProcedures {
          votedProcedures {
            procedureId
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

        const { data, errors } = response.data;

        expect(data).toBeDefined();
        expect(data).toBeNull();
        expect(errors).toBeDefined();
        expect(errors.length).toStrictEqual(1);
        expect(errors[0].message).toStrictEqual('Not Verified!');
      });
    });
    describe('notifiedProcedures', () => {
      it('get notified procedures with no votes', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
        query NotifiedProcedures {
          notifiedProcedures {
            procedureId
          }
          }
      `,
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
        expect(data.notifiedProcedures).toBeDefined();
        expect(data.notifiedProcedures.length).toStrictEqual(0);
      });
      it('try to get notified procedures without device', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
        query NotifiedProcedures {
          notifiedProcedures {
            procedureId
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
        expect(data).toBeNull();
        expect(errors).toBeDefined();
        expect(errors.length).toStrictEqual(1);
        expect(errors[0].message).toStrictEqual('Not Authorised!');
      });
    });
  });
});
