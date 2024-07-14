import {
  IProcedure,
  Device,
  Phone,
  User,
  ProcedureModel,
  DeviceModel,
  PhoneModel,
  UserModel,
} from '@democracy-deutschland/democracy-common';
import axios from 'axios';
import crypto from 'crypto';
import { connectDB, disconnectDB } from '../../services/mongoose';
import config from '../../config';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('SearchTerm Resolvers', () => {
  describe('Mutations', () => {
    describe('finishSearch', () => {
      let procedure: IProcedure;
      const procedureId = '0006010';
      let user: User;
      let device: Device;
      const xDeviceHash = 'SOME_DEVICE_HASH_SEARCH_TERM_RESOLVER_FINISH_SEARCH';
      const deviceHash = crypto.createHash('sha256').update(xDeviceHash).digest('hex');

      const PHONE_NUMBER = `+49112113112`;
      const xPhoneHash = crypto.createHash('sha256').update(PHONE_NUMBER).digest('hex');
      const phoneHash = crypto.createHash('sha256').update(xPhoneHash).digest('hex');
      let phone: Phone;
      let searchTerm: string;

      beforeAll(async () => {
        await connectDB(config.DB_URL, { debug: false });

        // create tmp procedure
        procedure = await ProcedureModel.create({
          procedureId,
          title: 'tmp procedure for finishSearch test',
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
          phoneHash: phoneHash,
        });

        // create tmp user
        user = await UserModel.create({
          verified: true,
          device,
          phone,
        });

        searchTerm = 'test';
      });

      afterAll(async () => {
        await Promise.all([procedure.remove(), user.remove(), phone.remove(), device.remove()]);
        await disconnectDB();
      });

      it('should finish search', async () => {
        const response = await axios.post(
          GRAPHQL_API_URL,
          {
            query: `
            mutation FinishSearch($term: String!) {
                finishSearch(term: $term) {
                    term
                }
            }
        `,
            variables: {
              term: searchTerm,
            },
          },
          {
            headers: {
              'x-device-hash': xDeviceHash,
              'x-phone-hash': xPhoneHash,
            },
          },
        );

        const { data, errors } = response.data;

        expect(errors).toBeUndefined();
        expect(data).toBeDefined();
        expect(data.finishSearch).toBeDefined();
        expect(data.finishSearch.term).toEqual(searchTerm);
      });

      it('Not Authorised!', async () => {
        const response = await axios.post(GRAPHQL_API_URL, {
          query: `
            mutation FinishSearch($term: String!) {
                finishSearch(term: $term) {
                    term
                }
            }
        `,
          variables: {
            term: searchTerm,
          },
        });

        const { data, errors } = response.data;

        expect(data).toBeDefined();
        expect(data).toBeNull();
        expect(errors).toBeDefined();
        expect(errors[0].message).toEqual('Not Authorised!');
      });
    });
  });
});
