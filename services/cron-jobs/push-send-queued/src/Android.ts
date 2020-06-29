import gcm, { IResponseBody } from "node-gcm";
import gcmProvider from "./AndroidProvicer";

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
}): Promise<gcm.IResponseBody> => {
  // Check if Sending Interface is present
  if (!gcmProvider) {
    throw new Error("ERROR: gcmProvider not present");
  }

  // Construct Data Object
  const gcmMessage = new gcm.Message({
    data: {
      title,
      body: message,
      payload,
    },
  });

  return new Promise((resolve, reject) => {
    gcmProvider!.send(gcmMessage, token, (error, response) => {
      if (error) {
        reject({ error, response });
      }
      resolve(response);
    });
  });
};
