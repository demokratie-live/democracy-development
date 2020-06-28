import gcm, { IResponseBody } from "node-gcm";
import gcmProvider from "./AndroidProvicer";

export const push = async ({
  title,
  message,
  payload,
  token,
  callback,
}: {
  title: string;
  message: string;
  payload: any;
  token: string;
  callback: (err: any, resJson: IResponseBody) => void;
}) => {
  // Check if Sending Interface is present
  if (!gcmProvider) {
    console.error("ERROR: gcmProvider not present");
    return;
  }

  // Construct Data Object
  const gcmMessage = new gcm.Message({
    data: {
      title,
      body: message,
      payload,
    },
  });

  gcmProvider.send(gcmMessage, token, callback);
};
