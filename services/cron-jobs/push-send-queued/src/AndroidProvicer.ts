import gcm from "node-gcm";

const gcmSender = () => {
  const key = process.env.NOTIFICATION_ANDROID_SERVER_KEY;
  if (!key) {
    console.error(
      "ERROR: NOTIFICATION_ANDROID_SERVER_KEY not specified in .env - Android Notifications not possible"
    );
    return;
  }
  return new gcm.Sender(key);
};

export default gcmSender();
