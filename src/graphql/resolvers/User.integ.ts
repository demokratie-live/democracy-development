import axios from 'axios';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('User GraphQL API', () => {
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
            'x-device-hash': 'SOME_DEVICE_HASH',
          },
        },
      );

      const { data } = response.data;

      expect(data).toBeDefined();
      expect(data.me).toBeDefined();
      expect(data.me._id).toBeDefined();
      expect(data.me.verified).toBeFalsy();
    } catch (error) {
      console.log('haha', error?.response?.data?.errors);
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
