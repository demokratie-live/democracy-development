import { Schema } from 'mongoose';
import DeputyLink, { IDeputyLink } from './Link';

export interface IDeputyContact {
  address?: string | null;
  email?: string | null;
  links: IDeputyLink[];
}

const DeputyContactSchema = new Schema<IDeputyContact>(
  {
    address: { type: String },
    email: { type: String },
    links: [{ type: DeputyLink }],
  },
  { _id: false },
);

export default DeputyContactSchema;
