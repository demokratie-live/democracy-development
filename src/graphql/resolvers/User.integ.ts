import axios from 'axios';
import { connectDB, disconnectDB } from '../../services/mongoose';
import { DeviceModel, UserModel } from '@democracy-deutschland/democracy-common';
import crypto from 'crypto';
import config from '../../config';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('User GraphQL API', () => {
  const xDeviceHash = 'SOME_DEVICE_HASH_USER_TESTS';
  const deviceHash = crypto.createHash('sha256').update(xDeviceHash).digest('hex');

  afterAll(async () => {
    await connectDB(config.DB_URL, { debug: false });
    const device = await DeviceModel.findOne({ deviceHash });

    await UserModel.deleteMany({ device });
    await device.remove();

    await disconnectDB();
  });

  it('request unverified user with device', async () => {
    try {
      const response = await axios.post(
        GRAPHQL_API_URL,
        {
          query: `
        query Me {
        me {
          _id
          verified
          __typename
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
      expect(data.me).toBeDefined();
      expect(data.me._id).toBeDefined();
      expect(data.me.verified).toBeFalsy();
    } catch (error) {
      console.error(error?.response?.data?.errors);
    }
  });
  it('request unverified user without device', async () => {
    const response = await axios.post(GRAPHQL_API_URL, {
      query: `
          query Me {
          me {
            _id
            verified
            __typename
          }
          }
        `,
    });
    const { data } = response.data;

    expect(data).toBeDefined();
    expect(data.me).toBeNull();
  });
});
