import { mongoose } from "@democracy-deutschland/democracy-common";

export default async () => {
  mongoose.set("useFindAndModify", false);
  // Mongo Debug
  mongoose.set("debug", () => {
    return true;
  });

  // Connect
  try {
    await mongoose.connect(process.env.DB_URL!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error(err);
    await mongoose.createConnection(process.env.DB_URL!, {});
  }

  // Open
  mongoose.connection
    .once("open", () => console.info("MongoDB is running"))
    .on("error", (e: Error) => {
      // Unknown if this ends up in main - therefore we log here
      console.error(e.stack);
      throw e;
    });
};
