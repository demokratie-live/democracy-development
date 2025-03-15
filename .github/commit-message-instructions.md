# Richtlinien für Commit-Nachrichten

- Kurz und prägnant: Die erste Zeile der Commit-Message soll den Kern der Änderung zusammenfassen (idealerweise <= 72 Zeichen).
- Imperativ und Präsens: Formuliere die Betreffzeile im Imperativ, als würdest Du beschreiben, was dieser Commit tut. (Beispiel: „Add login feature“ statt „Added login feature“.)
- Englische Sprache: Nach Möglichkeit Commit-Beschreibungen auf Englisch verfassen, da der Quelltext und die meisten Kommentare/Bezeichner englisch sind.
- Conventional Commits (optional): Falls passend, beginne die Commit-Zeile mit einem Typ-Tag wie feat:, fix:, docs: etc., um die Art der Änderung kenntlich zu machen. (Z.B. feat: add user profile page für ein neues Feature.)
- Was und warum: Erläutere was geändert wurde und ggf. warum – vermeide es, lediglich Dateien oder Codezeilen zu beschreiben. Die Message soll dem Reviewer/Leser klar machen, welche Problemstellung gelöst oder welche Funktion hinzugefügt wurde.
- Groß-/Kleinschreibung & Format: Starte die erste Zeile mit einem Großbuchstaben und verzichte auf einen Punkt am Ende dieser Zeile. Nutze bei Bedarf nach der kurzen Zusammenfassung einen leeren Absatz und füge darunter eine detailliertere Beschreibung hinzu.
- Detailbeschreibung: In einem optionalen zweiten Abschnitt (nach einer Leerzeile) können technische Details, Gründe oder Hintergründe erläutert werden. Hier sind auch mehrere Sätze oder Aufzählungen möglich, um komplexere Änderungen zu erklären.
- Issue-Referenzen: Wenn relevant, referenziere zugehörige Ticket- oder Issue-Nummern. Zum Beispiel: Closes #123 am Ende der Nachricht, falls der Commit einen Issue abschließt.
- Ton und Stil: Halte den Ton sachlich und professionell. Vermeide Umgangssprache, Humor oder Entschuldigungen im Commit-Text – die Nachricht dient der Nachvollziehbarkeit der Änderung.
