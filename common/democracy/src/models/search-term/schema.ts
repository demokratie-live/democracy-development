import { createSchema, Type } from 'ts-mongoose';

const SearchTermSchema = createSchema(
  {
    term: Type.string({ type: String, required: true, unique: true }),
    times: Type.array().of(Type.date({ type: Date, required: true })),
  },
  { timestamps: false },
);

export default SearchTermSchema;
