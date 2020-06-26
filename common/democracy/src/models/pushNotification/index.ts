import { typedModel } from "ts-mongoose";
import PushNotificationSchema, {
  PUSH_TYPE,
  PUSH_CATEGORY,
  PUSH_OS,
} from "./schema";

export { PUSH_TYPE, PUSH_CATEGORY, PUSH_OS, PushNotificationSchema };

export const PushNotificationModel = typedModel(
  "PushNotification",
  PushNotificationSchema
);
