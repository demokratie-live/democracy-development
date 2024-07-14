import { DeviceModel, UserModel } from '@democracy-deutschland/democracy-common';
import axios from 'axios';
import { connectDB, disconnectDB } from '../../../services/mongoose';
import crypto from 'crypto';
import config from '../../../config';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('Device GraphQL API', () => {
  const xDeviceHash = 'SOME_DEVICE_HASH_DEVICE_ADD_TOKEN_TESTS';
  const deviceHash = crypto.createHash('sha256').update(xDeviceHash).digest('hex');

  afterAll(async () => {
    await connectDB(config.DB_URL, { debug: false });
    const device = await DeviceModel.findOne({ deviceHash });

    await UserModel.deleteMany({ device });
    await device.remove();

    await disconnectDB();
  });
  it('should add a token to a device', async () => {
    const response = await axios.post(
      GRAPHQL_API_URL,
      {
        query: `
        mutation AddToken($token: String!, $os: String!) {
          addToken(token: $token, os: $os) {
            succeeded
            __typename
          }
        }
      `,
        variables: {
          token: '1234567890',
          os: 'ios',
        },
      },
      {
        headers: {
          version: '1.5.5',
          'x-device-hash': xDeviceHash,
        },
      },
    );

    const { data, errors } = response.data;

    expect(data).toBeDefined();
    expect(data.addToken).toBeDefined();
    expect(data.addToken.succeeded).toBeTruthy();
    expect(errors).toBeUndefined();
  });
});
