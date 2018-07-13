import mongoose from "mongoose";

import CONSTANTS from "./constants";

mongoose.Promise = global.Promise;

// mongoose.set("debug", true);
const connect = async () =>
  new Promise((resolve, reject) => {
    try {
      mongoose.connect(CONSTANTS.DB_URL, {});
    } catch (err) {
      mongoose.createConnection(CONSTANTS.DB_URL, {});
    }

    mongoose.connection
      .once("open", () => {
        resolve();
      })
      .on("error", e => {
        reject(e);
      });
  });

export { mongoose };
export default connect;
