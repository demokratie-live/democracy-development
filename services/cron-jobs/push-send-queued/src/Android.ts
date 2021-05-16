import axios from "axios";

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
  const { data } = await axios.post(`${process.env.GORUSH_URL}/api/push`, {
    notifications: [
      {
        tokens: [token],
        platform: 2,
        title,
        message,
        topic: process.env.APNS_TOPIC,
        badge: 0,
        development: process.env.NODE_ENV === "development",
        data: {
          payload,
        },
        // sound: {
        //   name: "push.aiff",
        // },
      },
    ],
  });

  if (data.logs[0]) {
    return {
      sent: false,
      errors: data.logs.map(({ error }: { error: string }) => error),
    };
  }

  return { sent: true };
};
