import { mongoose } from "@democracy-deutschland/democracy-common";
export default () =>
  new Promise<void>(async (resolve) => {
    mongoose.set("useFindAndModify", false);
    // Mongo Debug
    mongoose.set("debug", false);

    mongoose.connect(process.env.DB_URL!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.once("connected", () => {
      console.info("MongoDB is running");
      resolve();
    });
    mongoose.connection.on("error", (e: Error) => {
      // Unknown if this ends up in main - therefore we log here
      console.error(e.stack);
      throw e;
    });
  });
