import apn from "apn";
import apnProvider from "./iOSProvicer";

// Send single iOS notification
export const push = ({
  title,
  message,
  payload,
  token,
}: {
  title: string;
  message: string;
  payload: any;
  token: string;
}): Promise<apn.Responses> => {
  // Check if Sending Interface is present
  if (!apnProvider) {
    throw new Error("ERROR: apnProvider not present");
  }

  // Construct Data Object
  const data = new apn.Notification();
  data.alert = {
    title,
    body: message,
  };

  data.sound = "push.aiff";

  data.topic = process.env.APN_TOPIC!;
  data.payload = payload;

  // Do the sending
  return new Promise((resolve) => {
    apnProvider!.send(data, token).then(resolve);
  });
};
