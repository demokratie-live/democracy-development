# Code-Generierungsanweisungen für GitHub Copilot

## TypeScript und allgemeiner Stil

- TypeScript verwenden: Neue Dateien und Codebeispiele immer in TypeScript schreiben (keine rein JavaScript-Beispiele). Achte auf strikte Typisierung und nutze die in tsconfig.json aktivierten Strict-Optionen voll aus.
- Explizite Typen: Gib Datentypen explizit an, wo der Kontext es erfordert (bei öffentlichen Schnittstellen, komplexen Objekten etc.). Vermeide den Gebrauch des Typs any; nutze stattdessen Generics, Union-Types oder definierte Interfaces/Klassen.
- Projekt-Code-Stil beachten: Folge den etablierten Formatierungs- und Syntaxregeln des Projekts. (Einheitliche Einrückungen, Anführungszeichen, Semikolons etc. entsprechend etwaiger ESLint/Prettier-Konfiguration.) Bei Unsicherheit lieber den Code-Stil aus vorhandenen Dateien übernehmen.
- Moderne JavaScript-Features: Nutze aktuelle Sprachfeatures für klareren Code – z.B. Spread-Operator für Objekt-/Array-Kopien, Array-Methoden (map, filter, reduce), optionale Verkettung (?.) und Nullish Coalescing (??). Verwende async/await für asynchrone Abläufe und vermeide verschachtelte Promise-Ketten oder Callback-Höllen.
- Namensgebung & Kommentare: Wähle aussagekräftige, konsistente Bezeichnungen (CamelCase für Variablen/Funktionen, PascalCase für Klassen/Typen). Halte Bezeichner und Kommentare in Englisch. Füge Kommentare nur dort ein, wo nötig – der Code soll primär selbsterklärend sein.

## Frontend (Next.js & React)

- Funktionale Komponenten: Erstelle React-Komponenten als Functions (mit Hooks) anstatt als Klassen. Beispiele und Vorschläge sollten Hooks wie useState, useEffect, useContext etc. nutzen, um State und Lifecycle abzubilden.
- Next.js Konventionen: Nutze die Next.js-typischen Datenabfrage-Methoden. Beispielsweise bei Seiten-Komponenten getServerSideProps oder getStaticProps einsetzen, anstatt Daten direkt im Komponenten-Body zu laden (sofern das Projekt das Pages-Verzeichnis verwendet). Halte Dich an die Ordner- und Namenskonventionen (Pages, Components, evtl. App Router Strukturen) von Next.js.
- Wiederverwendbarkeit: Schlage vor, wiederkehrende Logik in eigene Hooks oder Utilities auszulagern. Vermeide Duplikate – z.B. statt ähnlichen Code mehrfach in verschiedenen Komponenten vorzuschlagen, lieber eine gemeinsame Hilfsfunktion oder Komponente erstellen.
- Styling und Markup: Falls CSS/Styling relevant ist, orientiere Dich an vorhandenen Patterns (z.B. Nutzung von CSS-Modulen, styled-components oder Tailwind, falls im Projekt verwendet – anderenfalls einfache CSS-Klassen). Achte bei JSX auf sauberes, semantisches HTML (richtige Tags für den Zweck) und beachte Accessibility (ARIA-Attribute, Alt-Texte für Bilder etc. bei passenden Vorschlägen).
- Keine unnötigen Dependencies: Schlage im Frontend nur etablierte Bibliotheken vor, die im Projekt bereits verwendet werden oder absolut notwendig sind. (Beispiel: Statt einer unbekannten AJAX-Library lieber die native Fetch API oder vorhandene Data-Fetching-Lösungen nutzen.)

## Backend (NestJS & GraphQL)

- NestJS-Dekoratoren korrekt einsetzen: Stelle sicher, dass Beispiele für Controller, Services usw. die richtigen Dekoratoren verwenden (@Controller, @Injectable, @Module, @Inject etc.). Bei GraphQL-Resolvern entsprechende Dekoratoren nutzen (@Resolver, @Query, @Mutation, @Args, @Context etc.), wie im NestJS-GraphQL-Paket vorgesehen.
- GraphQL Schema einhalten: Generierter Code für GraphQL sollte zum bestehenden Schema passen. Nutze bei Bedarf vorhandene DTOs/Type-Definitionen. Für Eingaben in Mutationen Input-Types oder DTO-Klassen vorschlagen, anstatt ungefilterte freie Parameter.
- Service Layer nutzen: Logik eher in NestJS Services kapseln als direkt im Controller oder Resolver zu implementieren. Copilot-Vorschläge sollten zeigen, wie z.B. ein Resolver einen Service aufruft, der die eigentliche Arbeit erledigt. Das hält den Code sauber und testbar.
- Error-Handling: Zeige im Backend-Code, wie Fehler gehandhabt werden (z.B. mittels Exceptions und globalen Filtern). Ein Beispiel: Bei ungültigen Eingaben eine BadRequestException werfen, bei fehlenden Ressourcen NotFoundException etc., anstatt ungeprüft Fehler durchschleifen zu lassen.
- Datenzugriff und -Validierung: Falls Copilot Code für Datenbankzugriff generiert, orientiere Dich an der im Projekt genutzten Strategie (z.B. Verwendung eines ORMs oder direkten Repositories). Schlage Validierungen vor (z.B. class-validator Decorators an DTOs in NestJS) um Eingaben zu prüfen, bevor sie weiterverarbeitet werden.

## Tools und Sonstiges

- pnpm verwenden: In allen Code-Snippets, die Paketinstallation oder Scripts demonstrieren, pnpm nutzen. (Beispiel: pnpm install statt npm install.) Gleiches gilt für Monorepo-interne Verweise – z.B. pnpm run <script> für Builds/Tests, und Querverweise zwischen Packages via Workspaces.
- Monorepo-Struktur berücksichtigen: Wenn Code-Vorschläge Imports aus anderen Teilen des Projekts enthalten, nutze die definierten Pfade oder Package-Namen gemäß TurboRepo-Konfiguration. Vermeide lange relative Pfade über viele Ordner hinweg – ggf. lieber Alias-Importe verwenden, falls konfiguriert.
- Keine fremden Technologien vorschlagen: Bleibe innerhalb des angegebenen Technologie-Stacks. Schlage z.B. keine Verwendung von Express, Angular o.ä. vor, da das Projekt auf NestJS und Next.js setzt. Neue Bibliotheken nur vorschlagen, wenn sie einen klaren Mehrwert bieten und gängiger Best Practice entsprechen.
- Performance: Bei Generierung von Algorithmus- oder Datenverarbeitungs-Code achte auf Effizienz. Vermeide z.B. unnötig mehrfaches Durchlaufen von Arrays/Collections. Zeige lieber idiomatische Lösungen (etwa Nutzung von Array-Methoden, effiziente GraphQL-Abfragen mit Batch-Loading oder ähnlichem) gemäß der erwarteten Datenmengen.
- Minimale sinnvolle Boilerplate: Halte Boilerplate-Code klein. Lieber exemplarisch eine vollständige Lösung aufzeigen als zu viel redundanten Code generieren. Zum Beispiel bei der Erstellung eines neuen Modules nur die wirklich nötigen Teile einfügen (Datei-Struktur andeuten, aber nicht jeden Dateiinhalt ausformulieren, sofern nicht verlangt).
