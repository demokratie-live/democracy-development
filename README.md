# Demokratie-App

Webseite: https://www.democracy-deutschland.de/

Crowdfinanzierung: https://www.startnext.com/democracy

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
- Zwei kompatible Clients für Handy(+iOS) & Web
- Identität > Wie darf ein Nutzer sich registrieren und wie kann ein Nutzer sich auf der Desktop-Anwendung mit seinem Handy-Account anmelden?
- Sicherheit: Transportsicherheit(https); Annahme: Client ist sicher, Server ist sicher und vertrauenswürdig
- Server stellt 10 allgemeine Fragen zur Verfügung, Berechnet Ergebnis
- Client kann zu diesen Fragen abstimmen, Zeigt Ergebnis an
- Client muss schön sein & benutzbar(usability)

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
 
