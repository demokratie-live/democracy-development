![Screenshot](https://www.democracy-deutschland.de/files/images/forfb2.png)

# Demokratie-App

[![Build Status](https://travis-ci.org/demokratie-live/democracy-development.svg?branch=master)](https://travis-ci.org/demokratie-live/democracy-development)

Webseite: https://www.democracy-deutschland.de/

Crowdfinanzierung: [Startnext](https://www.startnext.com/democracy)

Demo: https://www.democracy-deutschland.de/#prototyp

## Funktion

Es soll eine App und Desktop-Anwendung entwickelt werden, die es ermöglicht über Belange des Bundestages und lokaler Gruppen abstimmen zu können. Jeder Mensch soll dabei genau eine Stimme haben. Roboter sollen an der Abstimmung nicht teilnehmen können.

## Nutzen

Es wird ein Stimmungsbild über politische Entscheidungen erstellt, das als Grundlage für die Entscheidung der Verantwortungsträger dienen kann. Die Nutzer können Druck auf die Entscheidungsträger ausüben, wenn diese sich nicht an die Entscheidung der Mehrheit halten und eine Erklärung für sein Verhalten einfordern.

Stimmung wird messbar, zu jeder Zeit, zu jedem Thema, dass genug Teilnehmer hat.

## Anforderungen

- Sicherheit (Anonymität, Beweisbarkeit, Fälschungssicherheit)
- Useability & geringe Hürden zur Teilnahme.

Es sollte der Ansatz Security-by-Design verfolgt werden, um den Nutzer glaubhaft zu versichern, dass er keine Nachteile durch die Nutzung der Applikation hat. Absolute Sicherheit ist leider nie möglich und bedarf erheblichen Arbeitsaufwand. Hier muss zwischen Aufwand, Sicherheit und Usability abgewägt werden. Es sollte ein Modell der schrittweisen Einführung von Sicherheitsmechanismen verfolgt werden, um die Realisierung zu ermöglichen - der Nutzer sollte über die bereits erfüllten und unerfüllten Sicherheitsziele zu jeder Zeit informiert werden.

### Sicherheitsziele:

- Anonym
- Beweisbares Ergebniss
- (partielle) Dezentralität

## Implementierung - Ziele

Um die Realisierung zu gewährleisten muss das Projekt in Schritten implemntiert werden.

![app](https://github.com/demokratie-live/democracy-assets/blob/master/docu/api_structure_app.png)

## Roadmap - Versionen

DEMOCRACY Deutschland wurde über Startnext für einen Prototyp finanziert. Selbstverständlich planen wir darüber hinaus.

Daher haben wir eine Roadmap entwickelt, was wir wann erreichen möchten: [Roadmap](https://www.democracy-deutschland.de/#!engineering)

## Zentrale Architektur Fragen:

![v1_architektur](https://github.com/demokratie-live/democracy-assets/blob/master/diagram/Server-Client%20Architektur.png)

## Entwicklung & Werkzeuge

[MeisterTask](https://www.meistertask.com/app/project/p7zXoSfq/demokratie)

[Analysetool Dateistruktur](https://veniversum.me/git-visualizer/?owner=demokratie-live&repo=demokratie-app)

[Analysetool Commits](http://ghv.artzub.com/#repo=demokratie-app&climit=10000&user=demokratie-live)

[Malwerkzeug zur Planung](https://www.draw.io/)

## Open Source

Wir entwickeln Open Source unter der Apache 2.0 Lizenz

## Welche Architektur?

Für den Client [hier](https://github.com/demokratie-live/democracy-client/network/dependencies) und [hier](https://github.com/demokratie-live/democracy-client/blob/master/README.md) nachzulesen.

Für den Server [hier](https://github.com/demokratie-live/democracy-server/network/dependencies) und [hier](https://github.com/demokratie-live/democracy-server/blob/master/README.md) nachzulesen.

Für den bundestag.io (Bundestags-API) [hier](https://github.com/demokratie-live/bundestag.io/network/dependencies) und [hier](https://github.com/demokratie-live/bundestag.io/blob/master/README.md) nachzulesen

## Running the Dev Environment

Run the following:

```
git clone git@github.com:demokratie-live/democracy-development.git
cd democracy-development
```

### Without docker

You need to have a [MongoDB][mongo] running as well as [NodeJS][node] installed
on your system.

If you need further configuration, you can do:

```
cp .env.example .env
```

Change `.env` if necessary.

Once this is set up, run the following:

```
pnpm install
pnpm run dev
```

Now visit [localhost:3100][localhost] and you should see the GraphQL playground.

### With docker

Run:

```
docker-compose up
```

Now visit [localhost:3100][localhost] and you should see the GraphQL playground.

### Kuberneetes

#### Preparation

install kustomize `brew install kustomize`

#### Generate Kubernetes configs

run `pnpm build:k8s:STAGE`
_replace Stage with alpha|internal|local|prod_

#### Monitoring

https://www.youtube.com/watch?v=h_GGd7HfKQ8

- run `id` in your terminal and copy first uid and replace `user: 'YOUR_UID'` in docker-compose.yml file
- install `docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions`
- do configure docker loki plugin **Change the default logging driver**: https://grafana.com/docs/loki/latest/clients/docker-driver/configuration/#change-the-default-logging-driver

### build docker image of a service

Example for the **qr-code-handler** service

```
SERVICE=qr-code-handler
SERVICE_PATH=services/$SERVICE

docker buildx build \
    --build-arg SERVICE=$SERVICE \
    --build-arg SERVICE_PATH=$SERVICE_PATH \
    --build-arg NODE_VERSION=$(cat .node-version | tr -d 'v') \
    -f infra/Dockerfile \
    -t $SERVICE \
    .
```

## Contributing

Anyone and everyone is welcome to [contribute](https://github.com/demokratie-live/democracy-development/blob/master/CONTRIBUTE.md). Start by checking out the list of
[open issues](https://github.com/demokratie-live/democracy-development/issues).

## License

Copyright © 2017-present DEMOCRACY Deutschland e.V.. This source code is licensed under the Apache 2.0 license found in the
[LICENSE](https://github.com/demokratie-live/democracy-development/blob/master/LICENSE) file.

---

Made with ♥ by Team DEMOCRACY ([democracy-deutschland.de](https://www.democracy-deutschland.de)), [startnext contributors](https://www.startnext.com/democracy/unterstuetzer/) and [contributors](https://github.com/demokratie-live/democracy-development/graphs/contributors)

[node]: https://nodejs.org
[mongo]: https://www.mongodb.com/
[docker]: https://www.docker.com/
[localhost]: http://localhost:3100/
