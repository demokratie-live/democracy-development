# Flow Charts

Dieser Service liefert den Textabschnitt, in dem über eine **nicht namentliche Abstimmung** abgestimmt wird. Dafür benötigt er eine **URL** zu einem PDF mit einem Plenarsaalprotokoll, den **Titel** der Gesetzgebung oder des Antrags und optional die **Dokumentennummer**.

## High Level

```mermaid
flowchart TD
    Start([Input: '´plenaarsaalprotokoll-url, titel, dokumentennummer])
    Error([Es konnte kein text gefunden werden, da das Plenarsaalprotokoll nicht gefunden wurde])
    Output([Output: Abstimmungstext der nicht namentlichen abstimmung])

    Start --> |Ok|Output
    Start --> |Fehler|Error
```

## In Deep

```mermaid
flowchart TD
    Start([Start mit '´plenaarsaalprotokoll-url, titel, dokumentennummer])
    RequestDb([Datenbankabfrage: Plenarsaalprotokoll 'url'])
    AssistantExists{Assistent existiert?}
    CreateAssistant([Assistent erstellen])
    UploadFile([Datei bei openAI hochladen])
    CreateVectorStore([VectorStore erstellen])
    CheckOpenAI{VectorStore bei openAI verfügbar?}
    UseExistingVectorStore([Bestehenden VectorStore verwenden])
    CreateThread([Neuen Thread erstellen])
    StartThread([Thread mit Assistant starten])
    SaveEntry([Assistent und VectorStore in Datenbank speichern])
    GetMessages([Antwort abrufen])
    FilterMessage([Antwort zwischen ### herausfiltern])
    DeleteThread([Thread löschen])
    ReturnMessage([Antwort zurückgeben])
    Error([Fehler: Kein Plenarsaalprotokoll vorhanden])
    ReturnError([Fehlerantwort])

    Start --> RequestDb

    RequestDb -->|Eintrag vorhanden| AssistantExists
    RequestDb -->|Kein Eintrag| Error

    Error --> ReturnError

    AssistantExists --> |Ja| CheckOpenAI
    AssistantExists --> |Nein| CreateAssistant

    CreateAssistant --> CreateThread

    CheckOpenAI -->|Ja| UseExistingVectorStore
    CheckOpenAI -->|Nein| UploadFile

    UseExistingVectorStore --> CreateThread
    UploadFile --> CreateVectorStore

    CreateVectorStore --> CreateThread


    CreateThread --> StartThread
    StartThread --> SaveEntry
    SaveEntry --> GetMessages
    GetMessages --> FilterMessage
    FilterMessage --> DeleteThread
    DeleteThread --> ReturnMessage
```
