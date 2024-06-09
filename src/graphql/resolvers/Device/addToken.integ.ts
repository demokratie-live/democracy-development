import axios from 'axios';

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || 'http://localhost:3000';

describe('Device GraphQL API', () => {
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
          token:
            '1234567890',
          os: 'ios',
        },
      },
      {
        headers: {
          "version": "1.5.5",
          'x-device-hash': 'SOME_DEVICE_HASH',
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
