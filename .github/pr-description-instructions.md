# Richtlinien für PR-Titel und -Beschreibung

- PR-Titel: Kurz und aussagekräftig den Kern der Änderung benennen. Ein prägnanter Satz oder Halbsatz (max. ~60 Zeichen) genügt. Vermeide vage Titel – der Reviewer soll sofort erkennen können, worum es geht.
- Zusammenfassung (Beschreibung): Beginne die PR-Beschreibung mit ein paar Sätzen, die Motivation und Kontext der Änderung erklären. Beantworte die Frage, warum diese Änderung durchgeführt wurde (Problemstellung oder Feature-Wunsch) und wie sie das adressiert.
- Änderungsübersicht: Liste die wichtigsten Änderungen stichpunktartig auf. Zum Beispiel:
  - „Fügt neue Login-Seite mit Formularvalidierung hinzu.“
  - „Aktualisiert den Auth-Service zur Unterstützung von JWT-Token.“
  - „Behebt einen Fehler bei der Passwort-Zurücksetzen-Funktion.“

Jede Aufzählung soll eine signifikante Änderung oder Gruppe von Änderungen beschreiben.

- Testanweisungen / Überprüfung: Falls hilfreich, gib Hinweise, wie die Änderungen getestet werden können. Beschreibe z.B. Schritte, um das neue Feature manuell zu verifizieren, oder welche Unit/Integration-Tests hinzugefügt wurden. Ein Reviewer sollte wissen, worauf beim Testen zu achten ist.
- Weiteres / Sonstiges: Erwähne zusätzliche Informationen, die für diesen PR relevant sind. Dazu gehören ggf. Breaking Changes (inkompatible API-Änderungen, die besondere Beachtung erfordern), notwendige Datenbank-Migrationen, Auswirkungen auf andere Module oder bekannte Probleme, die nicht im Rahmen dieses PR behoben wurden.
- Issue-Referenzen: Verlinke zugehörige Issues oder Tickets (z.B. „Closes #123“), damit Zusammenhänge klar sind.
- Formatierung: Nutze Markdown-Elemente für eine übersichtliche Struktur. Überschriften wie Beschreibung, Änderungen, Tests können verwendet werden, um die Sektionen klar zu trennen (je nach Projektvorlage). Halte die Sprache sachlich und klar, fokussiert auf Fakten und die durchgeführten Änderungen.
