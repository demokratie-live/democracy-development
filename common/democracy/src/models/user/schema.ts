import { Schema, Document } from "mongoose";
import { Phone } from "../phone";
import { Device } from "../device";
import { Timestamps } from "../timestamp";

export interface User extends Document, Timestamps {
  device?: Device | string | null;
  phone?: Phone | string | null;
  verified: boolean;

  // methods
  isVerified: () => boolean;
}

const UserSchema = new Schema<User>(
  {
    device: { type: Schema.Types.ObjectId, ref: "Device" },
    phone: { type: Schema.Types.ObjectId, ref: "Phone" },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.methods.isVerified = function () {
  return this.verified;
};

UserSchema.index({ device: 1, phone: 1 }, { unique: true });

export default UserSchema;
