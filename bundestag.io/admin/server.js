const express = require("express");
const next = require("next");
var basicAuth = require("basic-auth-connect");
const request = require("request")

// require("./lib/parseOpenDataXml");

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app
  .prepare()
  .then(() => {
    const server = express();

    server.get("/health-check", (req, res) => {
      res.status(200).send("ok")
    });

    if (!dev) {
      console.log("ADMIN_USER:", process.env.ADMIN_USER.replace(/./g, '*'))
      console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD.replace(/./g, '*'))
      server.use(basicAuth(process.env.ADMIN_USER, process.env.ADMIN_PASSWORD));
    }

    server.all("/graphql", (req, res) => {
      console.log("HOHO")
      const url = process.env.BUNDESTAGIO_SERVER_URL;
      return req.pipe(request({ qs: req.query, uri: url, headers: {
        "bio-auth-token": process.env.BIO_EDIT_TOKEN
      } }).on('error', function (err) {
        console.info(err);
        return res.sendStatus(400);
      }))
        .pipe(res);
    })

    server.get("/procedure/:id", (req, res) => {
      const actualPage = "/procedure";
      const queryParams = { id: req.params.id };
      app.render(req, res, actualPage, queryParams);
    });

    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, err => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${PORT}`);
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
