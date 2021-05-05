import apn from "apn";
import {
  APPLE_APN_KEY,
  APPLE_APN_KEY_ID,
  APPLE_TEAMID,
  NODE_ENV,
} from "./utils/config";

const key = APPLE_APN_KEY!;
const keyId = APPLE_APN_KEY_ID!;
const teamId = APPLE_TEAMID!;
const production = NODE_ENV === "production";

const apnProvider = () => {
  if (!key) {
    console.error(
      "ERROR: APPLE_APN_KEY Path was not found - Apple Notifications not possible"
    );
    return;
  }
  if (!keyId || !teamId) {
    console.error(
      "ERROR: APPLE_APN_KEY_ID or APPLE_TEAMID not specified in .env - Apple Notifications not possible"
    );
    throw new Error(
      "ERROR: APPLE_APN_KEY_ID or APPLE_TEAMID not specified in .env - Apple Notifications not possible"
    );
  }

  const options = {
    token: { key, keyId, teamId },
    production,
  };

  return new apn.Provider(options);
};

export default apnProvider();
