# Conference Week Details Import - Deployment Guide

## Übersicht

Dieser Service crawlt Sitzungswochen-Details vom Bundestag und verknüpft sie mit Procedures in der MongoDB.

## Wichtige Änderungen für Produktion

### 1. Crawler-Modi: Normal vs. Full-Crawl

Der Service bietet zwei intelligente Crawling-Modi:

#### 🔹 Normal-Modus (Standard - Empfohlen für Produktion)

**Verhalten:**

- Findet die letzten **3 Sitzungswochen MIT Sessions** in der Datenbank
- Startet von der ältesten dieser 3 Wochen
- Crawlt vorwärts bis zur aktuellen Woche
- **Effizient**: Nur relevante Wochen werden erfasst und aktualisiert

**Anwendungsfall:** Tägliche Updates in Produktion

**Ausführung:**

```bash
DB_URL=mongodb://localhost:27017/bundestagio node build/index.js
```

**Beispiel:**

- DB hat Wochen: 38 (mit Sessions), 39 (leer), 41 (mit Sessions), 42 (mit Sessions), 43 (leer)
- Crawler findet letzte 3 mit Sessions: 38, 41, 42
- Startet bei Woche 38 (älteste)
- Crawlt vorwärts bis zur aktuellen Woche

**Vorteile:**

- ✅ Sehr effizient für tägliche Updates
- ✅ Nur relevante Sitzungswochen werden gescannt
- ✅ Automatische Erkennung neuer Wochen
- ✅ Berücksichtigt Updates der letzten Wochen

---

#### 🔴 Full-Crawl-Modus (Für Datenbank-Wiederherstellung)

**Verhalten:**

- Startet bei der **aktuellen Kalenderwoche**
- Crawlt **rückwärts bis Woche 37/2025** (Legislaturperiode-Start)
- Erfasst ALLE verfügbaren Sitzungswochen

**Anwendungsfall:**

- Leere Datenbank (initial setup)
- Datenbank-Verlust
- Komplette Datenerfassung für Entwicklung/Tests

**Ausführung:**

```bash
FULL_CRAWL=true DB_URL=mongodb://localhost:27017/bundestagio node build/index.js
```

**⚠️ Warnung:**

- Full-Crawl dauert deutlich länger (5-15 Minuten)
- Macht mehr Server-Requests
- **Nur bei Bedarf verwenden** (nicht täglich!)

**Manuelle Start-Woche überschreiben:**

```bash
CONFERENCE_WEEK=45 CONFERENCE_YEAR=2025 node build/index.js
```

---

### 2. Intelligentes Rate-Limiting (statt festem Request-Limit)

Der Crawler nutzt intelligente Rate-Limiting-Strategien statt eines festen Request-Limits:

**Rate-Limiting-Konfiguration:**

- `maxRequestsPerMinute: 30` - Konservativ, vermeidet Server-Überlastung
- `maxConcurrency: 1` - Ein Request zur Zeit
- `maxRequestRetries: 10` - Automatisches Retry bei HTTP 429 (Too Many Requests)
- `retryOnBlocked: true` - Intelligentes Retry-Handling

**Vorteile:**

- ✅ Keine künstliche Obergrenze mehr
- ✅ Crawlt alle notwendigen Wochen automatisch
- ✅ Robustes Handling von Rate-Limits (HTTP 429)
- ✅ Automatische Retries mit exponential backoff

**Was passiert bei Rate-Limiting:**

1. Server antwortet mit HTTP 429 (Too Many Requests)
2. Crawler wartet automatisch (exponential backoff)
3. Request wird bis zu 10x wiederholt
4. Crawling wird fortgesetzt sobald Server wieder antwortet

---

### 3. Konfigurationskonstanten

Die Crawler-Logik verwendet folgende Konstanten (in `src/utils/determine-start-week.ts`):

```typescript
LEGISLATURE_START_WEEK = 37; // Woche 37/2025 = Start Legislaturperiode 21
LEGISLATURE_START_YEAR = 2025;
LOOKBACK_CONFERENCE_WEEKS = 3; // Anzahl vergangener Sitzungswochen für Updates
```

**⚠️ Anpassung bei neuer Legislaturperiode:**
Diese Werte müssen angepasst werden, wenn eine neue Legislaturperiode beginnt.

---

### 4. Empfohlene Ausführungsfrequenz

**Täglich ausführen** (z.B. 06:00 Uhr):

```bash
0 6 * * * /path/to/import-conference-week-details
```

Dies stellt sicher, dass:

- Neue Sitzungswochen zeitnah erfasst werden
- Aktualisierungen von Tagesordnungen berücksichtigt werden
- Der Vote-Date-Sync korrekte Daten erhält

## Datenfluss

1. **import-conference-week-details** (dieser Service)

   - Crawlt Sitzungswochen von bundestag.de
   - Speichert in `conferenceweekdetails` Collection
   - Verknüpft Procedures via Document-URLs

2. **sync-procedures** (nachgelagerter Service)
   - Liest Sitzungswochen aus MongoDB
   - Setzt `voteDate` auf Procedures mit `isVote: true`
   - Synchronisiert von `bundestagio` DB → `democracy` DB

## Manuelle Ausführung

### Normal-Modus (Empfohlen):

```bash
# Crawlt von den letzten 3 Sitzungswochen bis zur aktuellen Woche
DB_URL=mongodb://localhost:27017/bundestagio node build/index.js
```

### Full-Crawl-Modus (Bei DB-Verlust):

```bash
# Crawlt ALLE Wochen zurück bis Legislaturperiode-Start
FULL_CRAWL=true DB_URL=mongodb://localhost:27017/bundestagio node build/index.js
```

### Spezifische Woche manuell setzen:

```bash
# Überschreibt die automatische Start-Wochen-Bestimmung
CONFERENCE_WEEK=45 CONFERENCE_YEAR=2025 DB_URL=mongodb://localhost:27017/bundestagio node build/index.js
```

### Lokale Entwicklung:

```bash
# Build und Run
pnpm build
DB_URL=mongodb://localhost:27017/bundestagio node build/index.js
```

## Monitoring

### Erfolgreiche Ausführung prüfen:

```bash
# Anzahl gespeicherter Wochen
db.conferenceweekdetails.countDocuments()

# Neueste Woche
db.conferenceweekdetails.find().sort({year: -1, week: -1}).limit(1)

# Procedures mit voteDate
db.procedures.countDocuments({voteDate: {$exists: true, $ne: null}})
```

## Fehlerbehebung

### Problem: Neue Wochen werden nicht erfasst

**Lösung:** Service mit erhöhter Startwoche ausführen:

```bash
CONFERENCE_WEEK=<aktuelle_woche> node build/index.js
```

### Problem: Procedures haben kein voteDate

**Ursache:** Sitzungswoche wurde nicht erfasst oder `sync-procedures` nicht ausgeführt

**Lösung:**

1. Prüfen ob Sitzungswoche in DB: `db.conferenceweekdetails.find({year: 2025, week: 45})`
2. Falls nicht: Conference Week Scraper ausführen
3. Dann: `sync-procedures` Service ausführen

## Production Checklist

- [ ] Service läuft täglich (CronJob/Schedule konfiguriert)
- [ ] MongoDB-Verbindung korrekt konfiguriert
- [ ] Request-Limit auf mindestens 100 gesetzt
- [ ] Monitoring für erfolgreiche Ausführung eingerichtet
- [ ] Alert bei Fehlern konfiguriert
- [ ] sync-procedures läuft NACH diesem Service

## Environment Variables

| Variable           | Default                                 | Beschreibung                                                                              |
| ------------------ | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| `DB_URL`           | `mongodb://localhost:27017/bundestagio` | MongoDB Connection String                                                                 |
| `FULL_CRAWL`       | `false`                                 | `true` = Full-Crawl-Modus (alle Wochen), `false` = Normal-Modus (letzte 3 Sitzungswochen) |
| `CONFERENCE_YEAR`  | `2025`                                  | Jahr (wird meist automatisch bestimmt)                                                    |
| `CONFERENCE_WEEK`  | `<auto>`                                | Woche (wird automatisch bestimmt basierend auf DB-Status und Modus)                       |
| `CONFERENCE_LIMIT` | `10`                                    | Pagination Limit                                                                          |
