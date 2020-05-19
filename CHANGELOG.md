# Changelog

### 0.1.20

- [Fix] Upgrade named poll scraper

### 0.1.19

- [Add] start procedure scraper mutation

### 0.1.18

- [Fix] fix named polls matching

### 0.1.17

- [Fix] Upgrade @democracy-deutschland/bundestag.io-definitions to fix toggle named poll

### 0.1.16

- [Fix] saving not named voteResults

### 0.1.15

- [Fix] improve performance for procedureUpdates

### 0.1.14

- [Fix] add base url for dip21 scraper + use html version

### 0.1.13

- [Fix] update dip21 scraper to handle different base urls

### 0.1.12

- [Fix] Toggle vote results for recomended decision

### 0.1.11

- [Fix] call Dip21-Scraper with correct html option

### 0.1.10

- [Fix] Dip21-Scraper (update)

### 0.1.9

- [Added] env settings for cronjobs

### 0.1.8

- [Changed] better manage possible votes in admin area

### 0.1.7

- [Fix] Update Scraper (offset fix)

### 0.1.6

- [Fix] Add more missing finished voteResults for admin area

### 0.1.5

- [Fix] Add missing finished voteResults for admin area

### 0.1.4

- [Fix] Do not save procedure id in History subobject
- [Fix] more dynamic connection whitelisting
- [Added] Catch all errors and log them

### 0.1.3

- [Changed] Seperate Procedure.bioUpdatedAt in field-resolver
- [Add] Logger

### 0.1.2

- [Fix] Edit Vote Results

### 0.1.1

- [Changed] scrape bt-agenda `Überwiesen` status
- [Added] scrape bt-agenda
- [Added] Add support for scraping currentState history
- [Search] Use elastic-search server [#248](https://github.com/demokratie-live/democracy-client/issues/248)

### 0.1.0

- lock graphiql via config
- admin
  - show all procedures including Anträge which are voted on by parliament
  - show and link important documents including document number
  - show history of procedures
  - show findspot for Anträge
