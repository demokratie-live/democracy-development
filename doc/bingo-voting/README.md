
![Screenshot](https://crypto.iti.kit.edu/fileadmin/_migrated/pics/BV_CeBIT08.jpg)

# Bingo Voting

  Bingo Voting ist ein elektronisches Wahlverfahren, das am Europäischen Institut für Systemsicherheit (EISS) 
  des Karlsruher Instituts für Technologie entwickelt wurde[1] und die fehlende Nachvollziehbarkeit vieler 
  elektronischer Wahlverfahren durch kryptographische Methoden beheben soll. Dabei wird die Korrektheit der 
  Wahl unter der Annahme garantiert, dass vertrauenswürdige Zufallszahlengeneratoren eingesetzt werden. 
  Der Name „Bingo Voting“ stammt von der Idee, als Zufallszahlengenerator ein mechanisches Gerät einzusetzen, 
  ähnlich wie bei Bingo oder Lotto.

  Bei dem Verfahren werden Wahlcomputer zur Stimmabgabe und -auszählung eingesetzt, allerdings bekommt der 
  Wähler bei der Wahl einen Papierbeleg, mit dessen Hilfe er die korrekte Zählung seiner Stimme nachvollziehen kann. 
  Der Beleg ist dabei nicht einfach eine Kopie des ausgefüllten Wahlzettels. Vielmehr ist die Stimmverteilung 
  aus dem Beleg nur für den Wähler selbst ersichtlich. Der Beleg ist weder dazu gedacht noch dazu geeignet, 
  eine Nachzählung des Wahlergebnisses durchzuführen und wird dem Wähler mit nach Hause gegeben.
  
  
  
## Konzept
  Das erklärte Ziel des Bingo Voting Verfahrens ist es, die Nachteile der herkömmlichen Wahlmaschinen, insbesondere die fehlende Nachprüfbarkeit, zu beheben und elektronische Verfahren für die Stimmabgabe nachprüfbar und damit verwendbar zu machen.

  Die Grundidee des Verfahrens ist es, dem Wähler einen Beleg, aus dem er seine Stimme ersehen kann, in die Hand zu geben und nach der Wahl Kopien aller Belege zu veröffentlichen. Dies gewährleistet:

  Jeder Wähler kann nachprüfen, dass sein Beleg veröffentlicht wurde, und damit, dass seine Stimme gezählt wurde.
  Jeder kann das Ergebnis der Auszählung anhand der veröffentlichten Belege nachprüfen.
  Ein triviales Verfahren wäre, dem Wähler einfach eine Kopie seines (mit einer Identifikationsnummer versehenen) Stimmzettels in die Hand zu geben. Nach der Wahl werden alle Stimmzettel veröffentlicht und jeder kann nachprüfen, dass sein Stimmzettel darunter ist, sowie die Auszählung und damit das Wahlergebnis nachvollziehen. Bei diesem naiven Verfahren wären durch den Beleg allerdings Erpressung und Stimmenkauf möglich, das Wahlgeheimnis wäre also nicht hinreichend geschützt.

  Kryptographische Verfahren ermöglichen jedoch Belege, aus denen nur der Wähler selbst seine Stimme ersehen kann und niemand sonst. Dadurch kann der Wähler mit seinem Beleg keiner anderen Person beweisen, was er gewählt hat.

  Der Beleg enthält neben der tatsächlichen Stimme des Wählers so genannte Füllstimmen (oder Dummy-Stimmen). Diese Stimmen wurden vor der Wahl festgelegt und gleichmäßig an die Kandidaten verteilt. Die echte Stimme wird in der Wahlkabine vor den Augen des Wählers erzeugt, so dass dieser sie kennt, ist aber für jeden anderen von einer Füllstimme nicht zu unterscheiden.
 
 https://de.wikipedia.org/wiki/Bingo_Voting
