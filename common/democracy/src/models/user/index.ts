import UserSchema, { User } from "./schema";
import { model } from "mongoose";

export const UserModel = model<User>("User", UserSchema);
