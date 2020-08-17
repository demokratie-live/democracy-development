import express from "express";

const app = express();
const port = 3000;

app.get("/ber298", (_req, _res, next) => {
  console.log("ber298");
  next();
});

app.get("*", (_req, res) => {
  //   res.send("Hello World!");
  res.status(301).redirect("https://www.democracy-deutschland.de");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
