

![Screenshot](https://www.democracy-deutschland.de/files/images/forfb2.png)

# Demokratie-App

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

## Implemntierung - Ziele

Um die Realisierung zu gewährleisten muss das Projekt in Schritten implemntiert werden.

![app](https://github.com/demokratie-live/democracy-assets/blob/master/docu/api_structure_app.png)

## Roadmap - Versionen

DEMOCRACY Deutschland wurde über Startnext für einen Prototyp finanziert. Selbstverständlich planen wir darüber hinaus.

Daher haben wir eine Roadmap entwickelt, was wir wann erreichen möchten: [Roadmap](https://github.com/demokratie-live/democracy-app/wiki/Roadmap)
 
## Definitionen

 - Wer darf eine Frage stellen?
 - Wer darf darauf Antworten(Identität)?
 - Welche Bedingungen muss eine Frage erfüllen? (z.b. muss eine konkrete/definierte Auswirkung haben, wer hat die Verantwortung die Auswirkungen zu dokumentieren/kommunizieren/durchzusetzen)
 - Wie lange darf zu einer Frage beantwortet werden? (z.b. immer, bis Ergebnis vorliegt, 3 Wochen)
 
 Zentrale Architektur Fragen:

![v1_architektur](https://github.com/demokratie-live/demokratie-app/blob/master/doc/diagram/Server-Client%20Architektur.png)
   
## Entwicklung & Werkzeuge

[MeisterTask](https://www.meistertask.com/app/project/p7zXoSfq/demokratie)

[Analysetool Dateistruktur](https://veniversum.me/git-visualizer/?owner=demokratie-live&repo=demokratie-app)

[Analysetool Commits](http://ghv.artzub.com/#repo=demokratie-app&climit=10000&user=demokratie-live)

[Malwerkzeug zur Planung](https://www.draw.io/)

## Open Source

Wir entwickeln Open Source unter der Apache 2.0 Lizenz

Vorteile:
- Jeder kann mitmachen, Collaboration ist einfach.
- Software kann auf Schwachstellen analysiert werden.
- Es entsteht ein öffentliche Werkzeug, dass jeder verwenden kann.

Nachteile:
- Software kann auf Schwachstellen analysiert werden.
- "Because there is no requirement to create a commercial product that will sell and generate money, open source software can tend to evolve more in line with developers’ wishes than the needs of the end user." [Source](http://entrepreneurhandbook.co.uk/open-source-software/)

## Welche Architektur?

Client:
- X [ReactNative](http://www.reactnative.com/) ![ulf](https://avatars3.githubusercontent.com/u/1238238?v=4&s=16)
- X [GraphQL](http://graphql.org/) ![ulf](https://avatars3.githubusercontent.com/u/1238238?v=4&s=16)

Server:
- [AWS Lambda](https://aws.amazon.com/de/lambda/details/) mit [Node](https://nodejs.org) ![ulf](https://avatars3.githubusercontent.com/u/1238238?v=4&s=16)
- [Azure Serverless](https://azure.microsoft.com/en-us/overview/serverless-computing/) mit [Node](https://nodejs.org) oder [PHP](https://php.net)

## Weiter Vorschläge

- Nutzererfahrung mit [Papierprototyp](https://de.wikipedia.org/wiki/Paper_Prototyping) ermitteln und testen
