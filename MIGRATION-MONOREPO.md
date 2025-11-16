# Migration: democracy-api → democracy-development Monorepo

## Übersicht

Dieses Dokument beschreibt die vollständige Migration des `democracy-api` Repositories in das `democracy-development` Monorepo unter Beibehaltung der Git-History und Integration in die bestehende Monorepo-Infrastruktur.

## Aktuelle Situation

### democracy-api (Standalone-Repository)
- **Package Manager**: pnpm@10.19.0
- **Node.js**: >=20.9.0
- **Testing Framework**: Jest
- **Linting**: ESLint (legacy config)
- **Build Tool**: TypeScript Compiler (tsc)
- **Version**: 0.2.78
- **Git Tags**: Versioning mit `v0.2.x` Schema
- **Commit Convention**: Conventional Commits mit commitlint
- **Husky Hooks**: commit-msg Hook für commitlint
- **Dependencies**: 
  - `@democracy-deutschland/bundestag.io-definitions@^1.0.0`
  - `@democracy-deutschland/democracy-common@0.2.12-alpha.3`
  - Apollo Server Express v2
  - Mongoose v5
  - GraphQL v14

### democracy-development (Monorepo)
- **Package Manager**: pnpm@10.5.1
- **Node.js**: v18.18.2 (per .node-version)
- **Testing Framework**: Vitest
- **Linting**: ESLint v9 (flat config)
- **Build Tools**: Turbo, tsup
- **Workspace Structure**: pnpm workspaces
- **Shared Configs**: packages/tsconfig, packages/tsup-config
- **Commit Convention**: Deutsche Commit-Guidelines
- **Husky**: Version 9.0.11 (ohne Hooks aktuell)

## Kritische Unterschiede & Konfliktpotenziale

### 1. Package Manager Version ⚠️
- **democracy-api**: pnpm@10.19.0
- **democracy-development**: pnpm@10.5.1
- **Konfliktpotenzial**: HOCH
- **Lösung**: Monorepo-Version auf pnpm@10.19.0 anheben oder auf gemeinsame Version einigen

### 2. Node.js Version ⚠️
- **democracy-api**: >=20.9.0 (required für @typescript-eslint@8.x)
- **democracy-development**: v18.18.2
- **Konfliktpotenzial**: SEHR HOCH - democracy-api kann nicht mit Node 18 laufen
- **Lösung**: .node-version im Monorepo auf v20.9.0+ aktualisieren

### 3. Testing Framework ⚠️
- **democracy-api**: Jest mit separaten Configs (unit + integration)
- **democracy-development**: Vitest (per Copilot Instructions vorgeschrieben)
- **Konfliktpotenzial**: MITTEL
- **Lösung**: 
  - **Option A**: democracy-api Tests von Jest auf Vitest migrieren (empfohlen)
  - **Option B**: Jest für democracy-api beibehalten (gegen Monorepo-Konventionen)

### 4. ESLint Configuration ⚠️
- **democracy-api**: Legacy ESLint, kein eslint.config.mjs gefunden
- **democracy-development**: ESLint v9 mit Flat Config
- **Konfliktpotenzial**: MITTEL
- **Lösung**: ESLint Config für democracy-api auf Flat Config migrieren

### 5. TypeScript Configuration ⚠️
- **democracy-api**: Eigene tsconfig.json (keine shared config)
- **democracy-development**: Empfehlung packages/tsconfig zu verwenden
- **Konfliktpotenzial**: GERING
- **Lösung**: tsconfig.json erweitern von packages/tsconfig

### 6. Build Tools ⚠️
- **democracy-api**: tsc (TypeScript Compiler)
- **democracy-development**: Turbo + tsup (per Copilot Instructions)
- **Konfliktpotenzial**: MITTEL
- **Lösung**: Build-Prozess evaluieren - tsc für Server-Projekte ist akzeptabel

### 7. Dependencies ⚠️
- **democracy-api**: Referenziert `@democracy-deutschland/democracy-common@0.2.12-alpha.3`
- **democracy-development**: Hat `@democracy-deutschland/democracy-common` in `common/democracy/`
- **Konfliktpotenzial**: GERING
- **Lösung**: Workspace-Referenz verwenden: `@democracy-deutschland/democracy-common: workspace:*`

### 8. Commit Conventions ⚠️
- **democracy-api**: Conventional Commits (Englisch) mit commitlint
- **democracy-development**: Deutsche Commit-Guidelines, kein commitlint aktiv
- **Konfliktpotenzial**: NIEDRIG - Prozess-Unterschied
- **Lösung**: Monorepo commitlint aktivieren oder democracy-api Hooks entfernen

### 9. GitHub Actions Workflows ⚠️
- **democracy-api**: 
  - test.yaml (QA: lint, test, build)
  - test-integration.yaml (Garden.io Integration Tests)
  - build-and-release.yaml (Docker Build + Push, Infrastructure PR)
- **democracy-development**:
  - test.yaml (Turbo: lint, test)
  - build-and-push.yaml (Multi-Package Docker Build)
  - release.yaml (Multi-Package Versioning)
  - get-changed-services.yaml (Changed Package Detection)
- **Konfliktpotenzial**: HOCH
- **Lösung**: democracy-api Workflows müssen in Monorepo-Workflows integriert werden

### 10. Versioning & Releases ⚠️
- **democracy-api**: standard-version (v0.2.78), Tags: `v0.2.x`
- **democracy-development**: commit-and-tag-version, Tags: `<package>@v<version>`
- **Konfliktpotenzial**: HOCH
- **Lösung**: 
  - Neues Tag-Schema: `democracy-api@v0.2.78`
  - Alte Tags bleiben erhalten (Git History)
  - Monorepo-Workflow übernimmt ab Migration

### 11. Docker & Infrastructure ⚠️
- **democracy-api**: 
  - Eigenes Dockerfile (multi-stage mit pnpm@10.19.0)
  - Docker Image: `democracy/democracy-server`
  - Infrastructure PR-Workflow nach `demokratie-live/infrastructure`
- **democracy-development**: 
  - Gemeinsames Dockerfile in `infra/Dockerfile`
  - Service-spezifische Dockerfiles möglich
  - Build-Args: SERVICE, SERVICE_PATH, NODE_VERSION
- **Konfliktpotenzial**: MITTEL
- **Lösung**: 
  - **Option A**: democracy-api Dockerfile nach `services/democracy-api/Dockerfile` verschieben
  - **Option B**: Monorepo Dockerfile für democracy-api anpassen

### 12. Garden.io Configuration ⚠️
- **democracy-api**: Eigenes garden.yaml mit Build/Deploy/Test
- **democracy-development**: project.garden.yml (Project-Level)
- **Konfliktpotenzial**: GERING
- **Lösung**: garden.yaml nach `services/democracy-api/garden.yml` verschieben

### 13. Environment Configuration ⚠️
- **democracy-api**: Umfangreiches .env.example (JWT, SMS, GraphQL, Firebase, etc.)
- **democracy-development**: Keine zentrale .env.example
- **Konfliktpotenzial**: GERING
- **Lösung**: .env.example nach `services/democracy-api/.env.example` verschieben

## Pre-Migration Checklist

### Phase 1: Vorbereitung (KRITISCH)

- [x] **Node.js Version angleichen**
  - [x] democracy-development/.node-version auf v20.9.0 aktualisieren
  - [x] Alle bestehenden Services auf Node 20 Kompatibilität prüfen (alle 23 Services erfolgreich gebaut)
  - [x] CI/CD Workflows aktualisieren (uses: actions/setup-node@v4 mit node-version-file: '.node-version')

- [x] **pnpm Version angleichen**
  - [x] democracy-development/package.json: `packageManager: pnpm@10.19.0`
  - [x] pnpm-lock.yaml neu generieren mit pnpm@10.19.0
  - [x] CI/CD: Workflows auf `corepack enable` migriert (build-and-push.yaml, release.yaml)

- [x] **Testing Framework entscheiden**
  - [x] Entscheidung: Jest behalten vs. Vitest Migration → **Vitest gewählt**
  - [x] Falls Vitest: Migration-Plan für 13 Testdateien (3 Unit-Tests, 9 Integration-Tests)
  - [x] Vitest Migration durchgeführt:
    - [x] Vitest Konfiguration erstellt (vitest.config.unit.ts, vitest.config.integration.ts)
    - [x] package.json aktualisiert (Jest entfernt, Vitest hinzugefügt)
    - [x] Unit-Tests migriert (validatePhone.test.ts, Activity.test.ts, ConferenceWeek.test.ts)
    - [x] Integration-Tests kompatibel (keine Änderungen nötig dank globals: true)
    - [x] Jest/Babel Konfigurationsdateien entfernt

- [x] **Development Tool Migration**
  - [x] ts-node-dev durch tsx ersetzt (16. November 2025)
  - [x] Monorepo-Konsistenz erreicht (alle Services nutzen tsx)
  - [x] Performance-Verbesserung: 3-5x schnellere Hot-Reload-Zeiten
  - [x] Native Node.js 20+ --env-file Support

- [ ] **ESLint Migration planen**
  - [ ] democracy-api auf ESLint v9 Flat Config migrieren
  - [ ] Legacy .eslintrc* Konfiguration in eslint.config.mjs konvertieren
  - [ ] Lint-Ergebnisse vor/nach Migration vergleichen

### Phase 2: Repository-Vorbereitung

- [ ] **democracy-api Repository aufräumen**
  - [ ] Alle Branches auf Stand bringen
  - [ ] Offene PRs mergen oder schließen
  - [ ] CI/CD auf grün bringen
  - [ ] Letzten Release-Tag setzen (v0.2.78 oder höher)

- [ ] **democracy-development Backup**
  - [ ] Repository State dokumentieren
  - [ ] Aktuelle Git-Tags sichern
  - [ ] Branch Protection Rules dokumentieren

### Phase 3: Dependency-Analyse

- [ ] **Shared Dependencies prüfen**
  - [ ] @democracy-deutschland/democracy-common: workspace:* Referenz vorbereiten
  - [ ] @democracy-deutschland/bundestag.io-definitions Version abgleichen
  - [ ] Mongoose Version prüfen (democracy-api: v5, bundestag.io: v6)
  - [ ] GraphQL Version prüfen (democracy-api: v14, bundestag.io: v16)

- [ ] **Konfliktpotenzial Dependencies**
  - [ ] Apollo Server (v2 in democracy-api vs. v4 in bundestag.io)
  - [ ] TypeScript Version angleichen (democracy-api: 5.7.3)
  - [ ] @typescript-eslint Version (democracy-api: 8.15.0 vs. development: 8.25.0)

### Phase 4: Workflow-Integration

- [ ] **GitHub Actions vorbereiten**
  - [ ] democracy-api Service zu get-changed-services.yaml hinzufügen
  - [ ] build-and-push.yaml für democracy-api testen
  - [ ] release.yaml für democracy-api Versioning vorbereiten
  - [ ] Infrastructure PR-Workflow in Monorepo integrieren

- [ ] **Commitlint-Strategie**
  - [ ] Entscheidung: Monorepo-weites commitlint aktivieren vs. nur für democracy-api
  - [ ] .commitlintrc.json in Monorepo-Root oder Service-spezifisch
  - [ ] Husky Hooks konfigurieren (derzeit keine im Monorepo)

### Phase 5: Build & CI/CD

- [ ] **Turbo Configuration**
  - [ ] turbo.json: Pipeline für democracy-api definieren
  - [ ] Build-Dependencies für democracy-api festlegen
  - [ ] Cache-Strategie für democracy-api

- [ ] **Docker Build**
  - [ ] Dockerfile-Strategie wählen (Service-spezifisch vs. Monorepo-Dockerfile)
  - [ ] Docker Image Name: democracy-api oder democracy-server beibehalten?
  - [ ] Build-Args und Multi-Stage Build testen

- [ ] **Garden.io Integration**
  - [ ] garden.yml in services/democracy-api/garden.yml verschieben
  - [ ] Project-Level project.garden.yml erweitern
  - [ ] Integration Tests in Monorepo-CI einbinden

## Migration-Schritte

### Schritt 1: Git-Subtree Preparation

```bash
# In democracy-api Repository
cd /Users/manuelruck/Work/democracy/repos/democracy-api

# Alle Dateien in Unterordner verschieben (für saubere Subtree-Merge)
git checkout -b migration/prepare-subtree
mkdir -p democracy-api-temp
git ls-files | while read file; do
  mkdir -p "democracy-api-temp/$(dirname "$file")"
  git mv "$file" "democracy-api-temp/$file"
done

# .gitignore, .github, etc. verschieben
for file in .*; do
  if [ -f "$file" ]; then
    git mv "$file" "democracy-api-temp/$file"
  fi
done

git commit -m "chore: prepare for monorepo migration - move to democracy-api-temp/"

# Zurück in Root verschieben als services/democracy-api
git mv democracy-api-temp services
git mv services/democracy-api-temp services/democracy-api
git commit -m "chore: finalize migration structure - services/democracy-api"
```

### Schritt 2: Monorepo Integration (Git Subtree Merge)

```bash
# In democracy-development Repository
cd /Users/manuelruck/Work/democracy/repos/democracy-development

# Remote hinzufügen
git remote add democracy-api /Users/manuelruck/Work/democracy/repos/democracy-api

# Branch fetchen
git fetch democracy-api migration/prepare-subtree

# Merge mit --allow-unrelated-histories
git checkout -b migration/integrate-democracy-api
git merge --allow-unrelated-histories democracy-api/migration/prepare-subtree -m "chore: merge democracy-api into monorepo

Merges the complete democracy-api repository including git history.
All files are placed in services/democracy-api/.

Related repositories:
- Source: https://github.com/demokratie-live/democracy-api
- Last version: v0.2.78
"

# Remote entfernen
git remote remove democracy-api
```

**Alternative: Git Subtree Add** (bevorzugt für saubere History)

```bash
cd /Users/manuelruck/Work/democracy/repos/democracy-development

git subtree add --prefix=services/democracy-api \
  /Users/manuelruck/Work/democracy/repos/democracy-api \
  migration/prepare-subtree \
  --squash
```

### Schritt 3: Monorepo-Anpassungen

```bash
# In democracy-development/services/democracy-api

# 1. package.json anpassen
# - Workspace Dependencies auf workspace:* umstellen
# - Scripts für Monorepo anpassen
# - Shared configs referenzieren

# 2. pnpm-workspace.yaml bereits korrekt (services/**/*)

# 3. Dependencies installieren
pnpm install

# 4. Build testen
pnpm --filter democracy-api build

# 5. Tests ausführen
pnpm --filter democracy-api test
```

### Schritt 4: Configuration-Migration

**services/democracy-api/package.json** Änderungen:

```json
{
  "name": "democracy-api",  // Kein @democracy-deutschland Scope
  "dependencies": {
    "@democracy-deutschland/democracy-common": "workspace:*",
    "@democracy-deutschland/bundestag.io-definitions": "workspace:*"
  },
  "devDependencies": {
    "tsconfig": "workspace:*"
  }
}
```

**services/democracy-api/tsconfig.json** erweitern:

```json
{
  "extends": "tsconfig/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    // ... bestehende Optionen
  }
}
```

**services/democracy-api/garden.yml** (umbenennen von garden.yaml):

```yaml
# Unverändert, nur Pfad-Anpassungen falls nötig
```

### Schritt 5: GitHub Actions Integration

**democracy-development/.github/workflows/test.yaml** erweitern:

```yaml
# Bestehende Konfiguration beibehalten
# Tests laufen automatisch via Turbo für geänderte Packages
```

**democracy-development/turbo.json** erweitern:

```json
{
  "pipeline": {
    "build": {
      "outputs": ["dist/**"],
      "dependsOn": ["^build"]
    }
  }
}
```

**Neuer Workflow für Infrastructure-Updates**:

```yaml
# .github/workflows/update-infrastructure.yaml
# Basierend auf democracy-api/.github/workflows/build-and-release.yaml
# Nur für democracy-api Service
```

### Schritt 6: Commitlint & Husky Integration (Optional)

Falls Monorepo-weites commitlint gewünscht:

```bash
# In democracy-development Root
pnpm add -D @commitlint/cli @commitlint/config-conventional

# .commitlintrc.json erstellen
{
  "extends": ["@commitlint/config-conventional"]
}

# Husky Hook aktivieren
echo "npx commitlint --edit \$1" > .husky/commit-msg
chmod +x .husky/commit-msg
```

### Schritt 7: Dokumentation

```bash
# services/democracy-api/README.md aktualisieren
# - Monorepo-Kontext hinzufügen
# - Build/Test Commands mit pnpm Workspaces
# - Verweis auf Root-Level Dokumentation

# democracy-development/README.md erweitern
# - democracy-api als Service auflisten
# - Spezielle Anforderungen dokumentieren

# .github/copilot-instructions.md für democracy-api
# - Service-spezifische Anweisungen beibehalten
# - Monorepo-Kontext hinzufügen
```

## Post-Migration Validierung

### Funktionale Tests

- [ ] **Build-Prozess**
  ```bash
  pnpm --filter democracy-api build
  ```

- [ ] **Unit Tests**
  ```bash
  pnpm --filter democracy-api test
  ```

- [ ] **Linting**
  ```bash
  pnpm --filter democracy-api lint
  ```

- [ ] **Integration Tests**
  ```bash
  garden test democracy-api-integration
  ```

- [ ] **Development Server**
  ```bash
  pnpm --filter democracy-api dev
  # MongoDB muss laufen!
  ```

### CI/CD Validation

- [ ] **GitHub Actions**
  - [ ] Pull Request erstellen
  - [ ] test.yaml Workflow erfolgreich
  - [ ] Changed Services Detection korrekt
  - [ ] Docker Build erfolgreich

- [ ] **Release-Prozess**
  - [ ] Manueller Release Workflow testen (dry-run)
  - [ ] Versioning mit `democracy-api@v0.2.79`
  - [ ] Docker Image Push
  - [ ] Infrastructure PR

### Dependency-Validierung

- [ ] **Workspace Dependencies**
  ```bash
  pnpm --filter democracy-api list --depth 0
  # Prüfen: @democracy-deutschland/* von workspace
  ```

- [ ] **No Hoisting Issues**
  - [ ] GraphQL Resolvers funktionieren
  - [ ] MongoDB Connection funktioniert
  - [ ] Apollo Server startet

## Rollback-Plan

Falls Migration fehlschlägt:

```bash
# 1. Migration-Branch verwerfen
git checkout master
git branch -D migration/integrate-democracy-api

# 2. Standalone democracy-api bleibt funktionsfähig
cd /Users/manuelruck/Work/democracy/repos/democracy-api
git checkout main  # oder master

# 3. Monorepo ist unverändert
# Kein Push bedeutet keine Auswirkungen
```

## Risiken & Mitigations

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|--------|-------------------|--------|------------|
| Node.js Version-Inkompatibilität | HOCH | HOCH | .node-version vorab anpassen, alle Services testen |
| pnpm Hoisting-Probleme | MITTEL | HOCH | .npmrc mit shamefully-hoist testen |
| GraphQL Schema-Konflikte | GERING | MITTEL | Codegen vor/nach Migration vergleichen |
| CI/CD Pipeline-Fehler | MITTEL | MITTEL | Workflows in Feature-Branch testen |
| Docker Build-Fehler | GERING | MITTEL | Multi-Stage Build lokal testen |
| Dependency-Duplikate | MITTEL | GERING | pnpm dedupe nach Installation |
| Verlust Git-History | GERING | HOCH | Subtree-Merge statt Copy verwenden |
| Infrastructure-Deployment-Fehler | MITTEL | HOCH | Infrastructure PR-Workflow in Staging testen |

## Timeline-Schätzung

| Phase | Geschätzter Aufwand | Abhängigkeiten |
|-------|-------------------|----------------|
| Pre-Migration (Node/pnpm) | 2-4 Stunden | Alle Services testen |
| Testing Framework Migration | 4-8 Stunden | Falls Vitest gewählt |
| ESLint Migration | 2-3 Stunden | - |
| Git Subtree Merge | 1-2 Stunden | Backup erstellt |
| Package.json Anpassungen | 1-2 Stunden | Dependencies geklärt |
| GitHub Actions Integration | 3-5 Stunden | Workflow-Tests |
| Validierung & Testing | 4-6 Stunden | Alle Tests grün |
| Dokumentation | 2-3 Stunden | - |
| **GESAMT** | **19-33 Stunden** | **~3-5 Tage** |

## Empfohlene Reihenfolge

1. **Woche 1: Vorbereitung**
   - Node.js & pnpm Version angleichen
   - democracy-api auf grün bringen
   - ESLint auf v9 migrieren
   - Testing-Strategie entscheiden

2. **Woche 2: Migration**
   - Git Subtree Merge durchführen
   - Workspace Dependencies konfigurieren
   - Build-Prozess validieren
   - Initiale Tests

3. **Woche 3: CI/CD & Validation**
   - GitHub Actions integrieren
   - Docker Build testen
   - Integration Tests
   - Dokumentation

4. **Woche 4: Release & Monitoring**
   - Erster Release im Monorepo (dry-run)
   - Infrastructure PR testen
   - Produktions-Deployment überwachen
   - Lessons Learned dokumentieren

## Offene Fragen

1. ~~**Testing Framework**: Jest beibehalten oder zu Vitest migrieren?~~ **✅ ERLEDIGT** - Vitest Migration abgeschlossen (16. November 2025)
2. **Commitlint**: Monorepo-weit aktivieren oder nur für democracy-api?
3. **Docker Image Name**: `democracy-api` oder `democracy-server` beibehalten?
4. **ESLint Config**: Shared Config oder Service-spezifisch?
5. **Apollo Server**: Migration zu v4 im Rahmen der Monorepo-Migration oder später?
6. **Mongoose Version**: v5 in democracy-api vs. v6 im Rest des Monorepos - angleichen?
7. **Infrastructure Repository**: Workflow-Anpassungen für Monorepo-Tags?

## Nächste Schritte

1. **Team-Alignment**: Offene Fragen klären
2. ~~**Node.js 20 Migration**: Für gesamtes Monorepo durchführen~~ **✅ ERLEDIGT**
3. ~~**Testing-Strategie**: Jest vs. Vitest Entscheidung~~ **✅ ERLEDIGT** - Vitest gewählt und migriert
4. **Proof of Concept**: Kleine Test-Migration in separatem Branch
5. **Go/No-Go Decision**: Basierend auf PoC-Ergebnissen

## Kontakte & Verantwortlichkeiten

- **Migration Owner**: TBD
- **DevOps/CI/CD**: TBD
- **democracy-api Maintainer**: Manuel Ruck
- **Monorepo Maintainer**: TBD

## Referenzen

- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Turborepo Handbook](https://turbo.build/repo/docs/handbook)
- [Git Subtree](https://www.atlassian.com/git/tutorials/git-subtree)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Erstellt**: 16. November 2025  
**Version**: 1.0  
**Status**: Draft - Zur Diskussion
