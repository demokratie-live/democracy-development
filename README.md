![Screenshot](https://github.com/demokratie-live/democracy-assets/blob/master/images/forfb2.png)

# DEMOCRACY Server for the DEMOCRACY App &nbsp; <a href="https://github.com/kriasoft/nodejs-api-starter/stargazers" target="_blank"><img src="https://img.shields.io/github/stars/demokratie-live/democracy-server.svg?style=social&label=Star&maxAge=3600" height="20"/></a> <a href="https://twitter.com/democracy_de" target="_blank"><img src="https://img.shields.io/twitter/follow/democracy_de.svg?style=social&label=Follow&maxAge=3600" height="20"/></a> <a href="https://www.facebook.com/democracygermany/" target="_blank"><img src="https://github.com/demokratie-live/democracy-assets/blob/master/docu/facebook.png" height="20"/></a> <a href="https://discord.gg/Pdu3ZEV" target="_blank"><img src="https://github.com/demokratie-live/democracy-assets/blob/master/docu/discord.png" height="20"/></a>

[![Build Status](https://travis-ci.org/demokratie-live/democracy-server.svg?branch=master)](https://travis-ci.org/demokratie-live/democracy-server)

The Serversoftware for the DEMOCRACY APP. This is an API Defintion and Server for Data required and created by the DEMOCRACY App.

## Tech Stack

- [Node.js][node], [pnpm][pnpm], [JavaScript][js]

[More Dependecies](https://github.com/demokratie-live/democracy-server/network/dependencies)

![Projekt Struktur](https://github.com/demokratie-live/democracy-assets/blob/master/docu/api_structure_server.png)

## Prerequisites

- [Node.js][node]
- [MongoDB][mongo]

## Getting started

Clone the git repo & run the project

```
git clone git@github.com:demokratie-live/democracy-server.git
cd democracy-server
pnpm install
```

Rename the `.env.example` file to `.env` (Windows: `.env.`)

### Compile and start

```
pnpm dev
```

### Import Data from local Bundestag.io Server

A local bundestag.io server will automagically scrape the latest procedures and
update the democracy-server database.
Run a local bundestag.io server according to its
[README](https://github.com/demokratie-live/bundestag.io) and wait for the cron
job to finish.

### Test Project

```
pnpm lint
```

## Diagrams

All sorts of visual Documentation.

### Server <-> Bundestag.io

![](https://github.com/demokratie-live/democracy-assets/blob/master/docu/Communication_bundestagio_democracyserver.png)

### Database Model Prototyp

![](https://github.com/demokratie-live/democracy-assets/blob/master/docu/Datenbank%20Model.png)
![](https://github.com/demokratie-live/democracy-assets/blob/master/docu/ServerDatabase.png)

### Client -> Server: Increase Activity

![](https://github.com/demokratie-live/democracy-assets/blob/master/docu/activity.png)

### Client -> Server: Authentification

![](https://github.com/demokratie-live/democracy-assets/blob/master/docu/auth.png)

## Contributing

Anyone and everyone is welcome to [contribute](CONTRIBUTING.md). Start by checking out the list of
[open issues](https://github.com/demokratie-live/democracy-server/issues).

## License

Copyright © 2017-present DEMOCRACY Deutschland e.V.. This source code is licensed under the Apache 2.0 license found in the
[LICENSE](https://github.com/demokratie-live/democracy-server/blob/master/LICENSE) file.

---

Made with ♥ by Team DEMOCRACY ([democracy-deutschland.de](https://www.democracy-deutschland.de)), [startnext contributors](https://www.startnext.com/democracy/unterstuetzer/) and [contributors](https://github.com/demokratie-live/democracy-server/graphs/contributors)

[node]: https://nodejs.org
[pnpm]: https://pnpm.io
[js]: https://developer.mozilla.org/docs/Web/JavaScript
