import DeviceSchema, { Device } from "./schema";
import { model, Model } from "mongoose";

export const DeviceModel = model<Device>("Device", DeviceSchema) as Model<
  Device,
  {}
>;
export { Device, DeviceSchema };
