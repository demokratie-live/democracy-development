import { typedModel } from "ts-mongoose";
import SearchTermSchema from "./schema";

export const SearchTermModel = typedModel("SearchTerm", SearchTermSchema);
export { SearchTermSchema };
