/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';

import CONFIG from './../../config';

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'WEB', enum: ['WEB', 'BACKEND'] },
  },
  { timestamps: true },
);

UserSchema.methods = {
  createToken(res) {
    const token = jwt.sign(
      {
        _id: this._id,
      },
      CONFIG.AUTH_JWT_SECRET,
    );
    res.cookie('token', token);
    return token;
  },
};

export default UserSchema;
