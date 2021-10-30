import axios from 'axios';

// Send single iOS notification
export const push = async ({
  title,
  message,
  payload,
  token,
}: {
  title: string;
  message: string;
  payload: any;
  token: string;
}) => {
  const { data } = await axios
    .post(`${process.env.GORUSH_URL}/api/push`, {
      notifications: [
        {
          tokens: [token],
          platform: 1,
          title,
          message,
          topic: process.env.APN_TOPIC,
          badge: 0,
          development: process.env.NODE_ENV === 'development',
          data: {
            ...payload,
          },
          sound: {
            name: 'push.aiff',
          },
        },
      ],
    })
    .catch((e) => {
      console.error(JSON.stringify(e, null, 2));
      throw e;
    });

  console.info('data:', data);

  if (data.logs[0]) {
    return {
      sent: false,
      errors: data.logs.map(({ error }: { error: string }) => error),
    };
  }

  return { sent: true };
};
