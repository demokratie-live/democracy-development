import { mongoose } from "@democracy-deutschland/democracy-common";
import { DB_URL } from "./config";

let connection: typeof mongoose;

export const mongoConnect = async () => {
  mongoose.set("useFindAndModify", false);
  mongoose.set("debug", false);

  connection = await mongoose.connect(DB_URL!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  mongoose.connection.once("connected", () => {
    console.info("MongoDB is running");
  });
  mongoose.connection.on("error", (e: Error) => {
    console.error(e.stack);
    throw e;
  });
};

export const mongoDisconnect = () => {
  if (connection) {
    return connection.disconnect();
  }
};
