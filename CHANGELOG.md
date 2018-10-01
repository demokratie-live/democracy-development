# Changelog

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
