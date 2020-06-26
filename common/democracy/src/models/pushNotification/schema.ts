import { createSchema, Type } from "ts-mongoose";

export const PUSH_TYPE = {
  PROCEDURE: "procedure",
  PROCEDURE_BULK: "procedureBulk",
};

export const PUSH_CATEGORY = {
  CONFERENCE_WEEK: "conferenceWeek",
  CONFERENCE_WEEK_VOTE: "conferenceWeekVote",
  TOP100: "top100",
  OUTCOME: "outcome",
};

export const PUSH_OS = {
  IOS: "ios",
  ANDROID: "android",
};

const PushNotificationSchema = createSchema(
  {
    type: Type.string({
      enum: [PUSH_TYPE.PROCEDURE, PUSH_TYPE.PROCEDURE_BULK],
      required: true,
    }),
    category: Type.string({
      enum: [
        PUSH_CATEGORY.CONFERENCE_WEEK,
        PUSH_CATEGORY.CONFERENCE_WEEK_VOTE,
        PUSH_CATEGORY.TOP100,
        PUSH_CATEGORY.OUTCOME,
      ],
      required: true,
    }),
    title: Type.string({
      required: true,
    }),
    message: Type.string({
      required: true,
    }),
    procedureIds: Type.array({ required: true }).of(
      Type.string({ required: true })
    ),
    token: Type.string({
      required: true,
    }),
    os: Type.string({
      enum: ["android", "ios"],
      required: true,
    }),
    time: Type.date({
      required: true,
    }),
    sent: Type.boolean({
      default: false,
    }),
    failure: Type.string({}),
  },
  { timestamps: true }
);

PushNotificationSchema.index({ category: -1 }, { background: true });
PushNotificationSchema.index({ token: -1 }, { background: true });
PushNotificationSchema.index({ time: -1 }, { background: true });
PushNotificationSchema.index({ sent: -1 }, { background: true });
PushNotificationSchema.index({ os: -1 }, { background: true });

export default PushNotificationSchema;
