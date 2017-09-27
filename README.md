

![Screenshot](https://www.democracy-deutschland.de/images/forfb2.png)

# Demokratie-App

Webseite: https://www.democracy-deutschland.de/

Crowdfinanzierung: [Startnext](https://www.startnext.com/democracy)

Demo: https://www.democracy-deutschland.de/#prototyp

## Funktion

Es soll eine App und Desktop-Anwendung entwickelt werden, die es ermöglicht über Belange des Bundestages und lokaler Gruppen abstimmen zu können. Jeder Mensch soll dabei genau eine Stimme haben. Roboter sollen an der Abstimmung nicht teilnehmen können.

## Nutzen

Es wird ein Stimmungsbild über politische Entscheidungen erstellt, dass als Grundlage für die Entscheidung der Verantwortungsträger dienen kann. Die Nutzer können Druck auf Entscheidungsträger ausüben, wenn dieser sich nicht an die Entscheidung der Mehrheit hält und eine Erklärung für sein Verhalten einfordern.

Stimmung wird messbar, zu jeder Zeit, zu jedem Thema, dass genug Teilnehmer hat.

## Anforderungen

- Sicherheit (Anonymität, Beweisbarkeit, Fälschungssicherheit)
- Useability & geringe Hürden zur Teilnahme.

Es sollte der Ansatz Security-by-Design verfolgt werden, um den Nutzer glaubhaft zu versichern, dass er keine Nachteile durch die Nutzung der Applikation hat. Absolute Sicherheit ist leider nie möglich und bedarf erheblichen Arbeitsaufwand. Hier muss zwischen Aufwand, Sicherheit und Usability abgewägt werden. Es sollte ein Modell der schrittweisen einführung von Sicherheitsmechanismen verfolgt werden, um die Realisierung zu ermöglichen - der Nutzer sollte über die bereits erfüllten und unerfüllten Sicherheitsziele zu jeder Zeit informiert werden.

### Sicherheitsziele:
- Anonym
- Beweisbares Ergebniss
- (partielle) Dezentralität

## Implemntierung - Ziele

Um die Realisierung zu gewährleisten muss das Projekt in Schritten implemntiert werden.

### V1

- Technologie Entscheidung
- Zwei kompatible Clients für Handy(+iOS) & Web (Die Handy App läd die HTML & JS files vom Hanyspeicher?!)
- Identität > Wie darf ein Nutzer sich registrieren und wie kann ein Nutzer sich auf der Desktop-Anwendung mit seinem Handy-Account anmelden?
- Sicherheit: Transportsicherheit(https); Annahme: Client ist sicher, Server ist sicher und vertrauenswürdig
- Server stellt 10 allgemeine Fragen zur Verfügung, Berechnet Ergebnis
- Client kann zu diesen Fragen abstimmen, Zeigt Ergebnis an
- Client muss schön & benutzbar sein (usability)

### V2

 - Redaktion für Bundestag wird aufgebaut, betreibt einen Frage-Server
 - Möglichkeit mehrere Frage-Server aufzusetzen und die Fragen in der gleichen App anzuzeigen. > Followermodell?
 - Sicherheitsziel: Anonymität gegenüber den Servern; jeder darf einen Frage-Server betreiben, kann aber nicht zurückschließen, wer abgestimmt hat und wie.

### V3

 - Serverfunktionalität wird in den Client eingebunden -> Jeder kann Fragen stellen
 - Sicherheitsziel: Dezentral, Anonym, beweisbares Ergebniss, Ausfallssicherheit - ein Client geht offline - das Ergebniss kann nachwievor berechnet werden.
 
## Definitionen

 - Wer darf eine Frage stellen?
 - Wer darf darauf Antworten(Identität)?
 - Welche Bedingungen muss eine Frage erfüllen? (z.b. muss eine konkrete/definierte Auswirkung haben, wer hat die Verantwortung die Auswirkungen zu dokumentieren/kommunizieren/durchzusetzen)
 - Wie lange darf zu einer Frage beantwortet werden? (z.b. immer, bis Ergebnis vorliegt, 3 Wochen)
 
 
 
 
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
   
## Entwicklung & Werkzeuge

Vorschlag: Nutzung von [Kanban](https://kb.webcraft-media.de/?controller=BoardViewController&action=readonly&token=649348bb701244fff358494e1a9945a9bf2fcf0eaa2f69116b0df197a93d)

[Analysetool Dateistruktur](https://veniversum.me/git-visualizer/?owner=demokratie-live&repo=demokratie-app)

[Analysetool Commits](http://ghv.artzub.com/#repo=demokratie-app&climit=10000&user=demokratie-live)

[Malwerkzeug zur Planung](https://www.draw.io/)

## Open vs Closed Source

Soll das Projekt Open oder Closed Source entwickelt werden?

### Open Source

- Jeder kann mitmachen, Collaboration ist einfach.
- Software kann auf Schwachstellen analysiert werden.
- Es entsteht ein öffentliche Werkzeug, dass jeder verwenden kann.
- "Because there is no requirement to create a commercial product that will sell and generate money, open source software can tend to evolve more in line with developers’ wishes than the needs of the end user." [Source](http://entrepreneurhandbook.co.uk/open-source-software/)

### Closed Source

- Software kann nicht auf Schwachstellen analysiert werden
- Bessere monetäre Verwertbarkeit?
