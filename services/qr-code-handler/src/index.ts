import express from "express";
import mongoConnect from "./mongoose";
import { EntryModel } from "./models";

const app = express();
const port = 3000;

app.get("/:code", (req, _res, next) => {
  var code = req.params.code?.toLowerCase();
  if (code && code.length > 0 && code.match(/^[0-9a-z]+$/)) {
    console.log(`CODE: "${code}" redirected`);
    EntryModel.create({ code });
  } else {
    console.log(`CODE: "${code}" does not match rules`);
  }

  next();
});

app.get("*", (_req, res) => {
  res.status(301).redirect("https://www.democracy-deutschland.de");
});

app.listen(port, async () => {
  await mongoConnect();
  console.log(`Example app listening at http://localhost:${port}`);
});
