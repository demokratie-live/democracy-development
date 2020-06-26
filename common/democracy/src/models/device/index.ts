import DeviceSchema, { Device } from "./schema";
import { model } from "mongoose";

export const DeviceModel = model<Device>("Device", DeviceSchema);
export { Device, DeviceSchema };
