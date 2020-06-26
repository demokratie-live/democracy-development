import UserSchema, { User } from "./schema";
import { model, Model } from "mongoose";

export const UserModel = model<User>("User", UserSchema) as Model<User, {}>;
export { User, UserSchema };
