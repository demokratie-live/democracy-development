import { Schema, Document, Types } from "mongoose";
import { IProcedure } from "../procedure/schema";
import { Timestamps } from "../timestamp";

export interface Device extends Document, Timestamps {
  deviceHash: string;
  pushTokens: {
    token: string;
    os: string;
  }[];
  notificationSettings: {
    enabled: boolean;
    disableUntil: Date;
    newVote: boolean; // TODO remove
    newPreperation: boolean; // TODO remove
    conferenceWeekPushs: boolean;
    voteConferenceWeekPushs: boolean;
    voteTOP100Pushs: boolean;
    outcomePushs: boolean;
    procedures: (Types.ObjectId | IProcedure)[];
    tags: string[];
  };
}

const DeviceSchema = new Schema<Device>(
  {
    deviceHash: { type: String, required: true, unique: true },
    pushTokens: [
      {
        token: String,
        os: String,
      },
    ],
    notificationSettings: {
      enabled: { type: Boolean, default: true },
      disableUntil: Date,
      newVote: { type: Boolean, default: false }, // TODO remove
      newPreperation: { type: Boolean, default: false }, // TODO remove
      conferenceWeekPushs: { type: Boolean, default: true },
      voteConferenceWeekPushs: { type: Boolean, default: false },
      voteTOP100Pushs: { type: Boolean, default: false },
      outcomePushs: { type: Boolean, default: false },
      procedures: [{ type: Schema.Types.ObjectId, ref: "Procedure" }],
      tags: [],
    },
  },
  { timestamps: true }
);

export default DeviceSchema;
