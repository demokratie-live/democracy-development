import apn from "apn";
import apnProvider from "./iOSProvicer";

// Send single iOS notification
export const push = ({
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
  callback: (response: apn.Responses) => void;
}) => {
  // Check if Sending Interface is present
  if (!apnProvider) {
    console.error("ERROR: apnProvider not present");
    return;
  }

  // Construct Data Object
  const data = new apn.Notification();
  data.alert = {
    title,
    body: message,
  };

  data.topic = process.env.APN_TOPIC!;
  data.payload = payload;

  // Do the sending
  apnProvider.send(data, token).then((response) => {
    callback(response);
  });
};
