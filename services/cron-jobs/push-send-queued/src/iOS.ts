import axios from "axios";

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
  const { data } = await axios.post(`${process.env.GORUSH_URL}/api/push`, {
    notifications: [
      {
        tokens: [token],
        platform: 1,
        title,
        message,
        topic: process.env.APNS_TOPIC,
        badge: 0,
        development: process.env.NODE_ENV === "development",
        data: {
          ...payload,
        },
        sound: {
          name: "push.aiff",
        },
      },
    ],
  });
  console.log(data.logs);
  if (data.logs[0]) {
    return {
      sent: false,
      errors: data.logs.map(({ error }: { error: string }) => error),
    };
  }

  return { sent: true };
};
