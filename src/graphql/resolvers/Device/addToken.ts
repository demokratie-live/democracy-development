import { compare } from 'compare-versions';
import { Resolvers } from '../../../generated/graphql';
import { logger } from '../../../services/logger';
import axios from 'axios';

export const addToken: Resolvers['Mutation']['addToken'] = async (
  parent,
  { token, os },
  { device, version, applicationId },
) => {
  logger.graphql('Device.mutation.addToken', { token, os }, { device, version, applicationId });

  const oldToken = device.pushTokens.find((pushToken) => pushToken.token === token);

  if (os === 'ios' && compare(version, '1.5.5', '<')) {
    // Convert apn to fcm token
    const response = await axios.post<{
      results: { registration_token?: string; apns_token: string; status: string }[];
    }>(
      'https://iid.googleapis.com/iid/v1:batchImport',
      {
        application: applicationId || process.env.APPLICATION_BUNDLE_IDENTIFIER,
        sandbox: false,
        apns_tokens: [token],
      },
      {
        headers: {
          Authorization: `key=${process.env.CLOUD_MESSAGING_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );
    const fpnToken = response.data.results[0]?.registration_token;
    if (fpnToken && !oldToken) {
      device.pushTokens.push({
        token: fpnToken,
        os: 'fcm',
      });
    }
  } else if (oldToken?.os !== 'fcm') {
    device.pushTokens.push({
      token: token,
      os: 'fcm',
    });
  }
  await device.save();

  return {
    succeeded: true,
  };
};
