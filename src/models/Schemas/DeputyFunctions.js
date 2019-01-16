import { Schema } from 'mongoose';

const DeputyFunctions = new Schema(
  {
    category: { type: String },
    functions: [{ type: String }],
  },
  { _id: false },
);

export default DeputyFunctions;
