

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
 
## Anforderungen an Wahlverfahren

  Die  Anforderungen an Wahlverfahren sind grob anhand der Wahlgrundsätze in Deutschland
  strukturiert.


### Anforderungen, die die geheime, freie Wahl betreffen:

   - *Wahlgeheimnis*: Während und nach der Wahl darf keine Information bekannt werden, die
   darauf schließen lässt, was ein Wähler gewählt hat.

   - *Quittungsfreiheit/Belegfreiheit*: Selbst, wenn der Wähler es wollte, könnte er einem Dritten nicht beweisen , was er gewählt hat.

   - *Nicht-Erpressbarkeit/Unmöglichkeit von Stimmkauf*: Der Wähler kann, selbst wenn
   er es wollte, nicht in einer Art und Weise seine Stimme abgeben, die dem Angreifer beweisen
   könnte, dass der Wähler mit hoher Wahrscheinlichkeit nicht das gewählt hat, was er eigentlich
   vorhatte .

   - *Keine erzwungene Enthaltung*: Eine wahlberechtigte Person kann nicht gezwungen oder
   erpresst werden, nicht zu wählen. Diese Anforderung gehört streng genommen zur Nicht-
   Erpressbarkeit, wird aber oft als Sonderfall behandelt, da diese Anforderung z.B. bei Präsenzwahlen prinzipiell unmöglich zu erreichen ist.

   - *Keine vorläufigen Zwischenergebnisse*: Vorläufige Zwischenergebnisse lassen die Aus-
   wahl eines Wählers, der in einem bestimmten Zeitraum gewählt hat, mit höherer Wahrscheinlichkeit 7 bestimmen, als wenn nur das Gesamtergebnis vorliegt. Diese Anforderung
   gehört aus einem anderen Grund außerdem auch zur Gleichheit der Wahl.

### Anforderungen, die die Korrektheit und die Nachvollziehbarkeit bzw. Öffentlichkeit der Wahl betreffen:

   - *Korrektheit*: Das Wahlergebnis wird aus den abgegebenen Stimmen korrekt berechnet.

   - *Integrität*: Es werden genau die Stimmen gezählt, die von wahlberechtigten Wählern abgegeben wurden. Es werden keine Stimmen unbefugt hinzugefügt, gelöscht oder verändert.

   - *Verifizierbarkeit*: Jeder kann nachprüfen, ob die eigene Stimme in der Auszählung berücksichtigt wurde (individuelle Verifizierbarkeit) und ob das Wahlergebnis korrekt berechnet
   wurde (universelle Verifizierbarkeit)

### Anforderungen, die die Gleichheit bzw. Fairness der Wahl betreffen:

   - *Gleiches Stimmgewicht*: Jeder Wähler kann nur eine Stimme abgeben und jede Stimme
   wird nur einmal gezählt. 

   - *Keine vorläufigen Zwischenergebnisse*: Jeder soll unter gleichen Voraussetzungen, also auch mit der gleichen Information zur Stimmabgabe gehen. Diese Anforderung gehört
   außerdem auch zum Wahlgeheimnis.

### Sonstige wünschenswerte oder möglicherweise notwendige Anforderungen:

   - *Robustheit*: Niemand soll einen Abbruch der Wahl oder eine Wiederholungswahl provozieren können. Dazu muss eine Manipulation beweisbar sein, damit zwischen einer echten und
   einer behaupteten Manipulation unterschieden werden kann.

   - *Benutzerfreundlichkeit*: intuitiv, leicht benutzbar, schnell, . . .

   - *Möglichkeit einer späteren Nachzählung / Archivierung der Stimmen*

   - *Flexibilität*: z.B. Möglichkeit von Kumulieren, Panaschieren, Write-In-Kandidaten, . . .

   - *Korrigierbarkeit*: Möglichkeit, im Nachhinein als unberechtigt/falsch abgegeben identifi-
   zierte Stimme zu löschen oder zu ändern)

   - Wahlspezifische Zusatzanforderungen: z.B. vorgegebene Reihenfolge der Kandidaten
   auf Stimmzettel, vorgegebenes Layout, ungültig wählen möglich, . . .
   
   - [Datenschutz Grundverordnung](https://dsgvo-gesetz.de/) & [Wiki](https://de.wikipedia.org/wiki/Datenschutz-Grundverordnung)
   
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
