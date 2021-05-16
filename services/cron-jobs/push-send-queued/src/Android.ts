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
  console.log("SEND ANDROID", {
    title,
    message,
    payload,
    token,
  });
};
