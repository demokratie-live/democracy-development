# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [0.1.61](https://github.com/demokratie-live/democracy-development/compare/bundestag.io@v0.1.60...bundestag.io@v0.1.61) (2024-05-09)


* enable garden sync mode for bio-admin ([498d39b](https://github.com/demokratie-live/democracy-development/commit/498d39be4a85d0de5b641d3fd7a6a1fed8314eb2))

## [0.1.60](https://github.com/demokratie-live/democracy-development/compare/bundestag.io@v0.1.59...bundestag.io@v0.1.60) (2024-05-08)


* add garden.io ([bc0553d](https://github.com/demokratie-live/democracy-development/commit/bc0553d2dbae414c2d9f418dc06530bcc2ea82e7))

## [0.1.59](https://github.com/demokratie-live/democracy-development/compare/bundestag.io@v0.1.58...bundestag.io@v0.1.59) (2024-04-07)


### 🚀 Feature

* imporve docker compose usage ([df12f75](https://github.com/demokratie-live/democracy-development/commit/df12f751199dc85ac0ca7d9425d09faf3af836ea))

## [0.1.58](https://github.com/demokratie-live/democracy-development/compare/bundestag.io@v0.1.57...bundestag.io@v0.1.58) (2023-11-01)


* ⬆️ upgrade axios ([c20e506](https://github.com/demokratie-live/democracy-development/commit/c20e5065941172d6b4876b3927167d35d58ba38d))

## [0.1.57](https://github.com/demokratie-live/democracy-development/compare/bundestag.io@v0.1.56...bundestag.io@v0.1.57) (2023-11-01)

## [0.1.56](https://github.com/demokratie-live/democracy-development/compare/bundestag.io@v0.1.55...bundestag.io@v0.1.56) (2023-11-01)


* 🐛 add health endpoint ([d157922](https://github.com/demokratie-live/democracy-development/commit/d157922dcd7dcfd524a0ae4e17100cd679be3f06))

## [0.1.55](https://github.com/demokratie-live/democracy-development/compare/bundestag.io@v0.1.54...bundestag.io@v0.1.55) (2023-11-01)


* ✨ use pull request build action for bundestag api ([cd5c542](https://github.com/demokratie-live/democracy-development/commit/cd5c5423886f75cfa41c66a529d94803855c0652))
* 📦️ upgrade packages ([e154803](https://github.com/demokratie-live/democracy-development/commit/e1548036686fee8c53e47e0ba85337e249e54ff5))
* 📦️ upgrade packages ([38e9700](https://github.com/demokratie-live/democracy-development/commit/38e9700c661d5d893837164133427345d8350d4d))

### 0.1.40

- [Fix] Vote Result helper

### 0.1.39

- [Fix] Decouple import confernece week details

### 0.1.24

- [Change] Decouple import confernece week details

### 0.1.23

- [Change] Decouple models & import procedures

### 0.1.23

- [Fix] Use token for bio-admin instead of whitelist ip

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
