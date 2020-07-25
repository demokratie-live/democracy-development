import { Schema } from "mongoose";

export interface IProcessDecision {
  page?: string;
  tenor?: string;
  document?: string;
  type?: string;
  comment?: string;
  foundation?: string;
  majority?: string;
}

const ProcessDecision = new Schema<IProcessDecision>(
  {
    page: String,
    tenor: String,
    document: String,
    type: String,
    comment: String,
    foundation: String,
    majority: String,
  },
  { _id: false }
);

export default ProcessDecision;
