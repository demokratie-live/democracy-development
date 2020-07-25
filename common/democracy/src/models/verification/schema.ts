import { createSchema, Type } from 'ts-mongoose';

const VerificationSchema = createSchema(
  {
    phoneHash: Type.string({ type: String, required: true, unique: true }),
    verifications: Type.array().of({
      _id: Type.objectId(),
      deviceHash: Type.string(),
      oldPhoneHash: Type.string(),
      codes: Type.array().of({
        code: Type.string({ type: String, required: true }),
        time: Type.date({ type: Date, required: true }),
        SMSID: Type.string({ type: String, default: null }),
      }),
      SMSStatus: Type.number(),
      expires: Type.date({ type: Date, required: true }),
    }),
  },
  { timestamps: true },
);

export default VerificationSchema;
