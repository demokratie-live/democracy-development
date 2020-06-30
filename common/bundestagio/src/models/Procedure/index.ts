import mongoose from "mongoose";
import ProcedureSchema, { IProcedure } from "./schema";

const ProcedureModel = mongoose.model<IProcedure>("Procedure", ProcedureSchema);

// ProcedureModel.createMapping({}, (err) => {
//   if (err) {
//     console.error(
//       `Elastic Search: Procedure.createMapping ${JSON.stringify(err)}`
//     );
//     return err;
//   }
//   const stream = Procedure.synchronize();
//   let count = 0;
//   stream.on("data", () => {
//     count += 1;
//   });

//   return new Promise((resolve, reject) => {
//     stream.on("close", () => {
//       console.info(`indexed ${count} documents!`);
//       resolve();
//     });
//     stream.on("error", (err2) => {
//       console.error("Elastic Search: ", err2);
//       reject();
//     });
//   });
// });

export { ProcedureModel };
