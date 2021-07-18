# Changelog

### 0.2.32

- [Fix] WOM Constituency fix sort procedures

### 0.2.31

- [Changed] add procedureId as id type for vote mutation

### 0.2.24

- [Fix] dataloader procedure id handling

### 0.2.22

- [Changed] add dataloader to graphql resolver procedures.voted

### 0.2.13

- [Changed] decouple cronjob push-send-queued

### 0.2.10 - 0.2.12

- [Changed] decouple cronjobs

### 0.2.9

- [Fix] use mongoose instance from democracy-common

### 0.2.8

- [Changed] start to decouple cronjobs

### 0.2.5 & 0.2.6 & 0.2.7

- [NoChange] Tried successless to fix 1.2.2 crash

### 0.2.4

- [Changed] Throw more clear errors on create new device error

### 0.2.3

- [Changed] remove unnecessary console logs

### 0.2.2

- [Changed] allow file path AND string for APN key

### 0.2.1

- [FIX] Auto reconnect mongo

### 0.2.0

- [Changed] Convert js to typescript

### 0.1.24

- [FIX] Push for vote results

### 0.1.23

- [FIX] Push queue memory issue

### 0.1.22

- [FIX] Push memory issue

### 0.1.21

- [ADD] conferenceWeek api endpoint

### 0.1.20

- [FIX] Named Polls import

### 0.1.19

- [FIX] Memory issue by disabling apollo query cache

### 0.1.18

- [Changed] Return new list Types for Procedures
- [FIX] Android: Fix Push notifications

### 0.1.17

- [Added] Query CommunityVotes for browser version

### 0.1.16

- [Fix] Named polls party names
- [Added] Queries for statistic

### 0.1.15

- [Changed] Filter performance for not-/voted
- [Removed] Deprecated graphql field goverment [#438](https://github.com/demokratie-live/democracy-client/issues/438)
- [Fixed] Search Button fix [#248](https://github.com/demokratie-live/democracy-client/issues/248)
- [Fix] Remove id from Procedure.voteResults.PartyVotes subobject to fix unnecessary Push notifications
- [Fix] more dynamic connection whitelisting
- [Added] Catch all errors and log them

### 0.1.14

- [Changed] JWT Header based authentification
- [Added] DEBUG environment variable
- [Added] Permissions for User-only and VerifiedUser-only requests
- [Added] IP-Whitelist controll for Bundestag.io hooks
- [Added] SMS Verification
- [Added] Logger
- [Added] FractionResults

### 0.1.13

- [Add] Sorting for Procedures
- [GraphQL] add Query: getProceduresById
- [Fixed] Start even if no valid APPLE_APN_KEY is present [#462](https://github.com/demokratie-live/democracy-client/issues/462)
- [Fixed] add internal lane topic for push notifications

### 0.1.12

- [Changed] scrape bt-agenda `Überwiesen` show time
- get estimated vote result from bundestagio
- fix sorting for list (voteDate)
- [Added] Add support for scraping currentState history
- [Search] Use elastic-search server [#248](https://github.com/demokratie-live/democracy-client/issues/248)

### 0.1.11

- handle removed vote results [#325](https://github.com/demokratie-live/democracy-client/issues/325)

### 0.1.10

- lock graphiql via config

### 0.1.9

- webhook
  - do a daily resync with the bundestag.io server
  - removed count as integrity measurement

### 0.1.8

- graphQL
  - also provide votedGoverment(votedGovernment) for backwards compatibility (client <= 0.7.5)

### 0.1.7

- graphQL
  - always import the correct voteDate for Anträge & Gesetze

### 0.1.6

- graphQL
  - Include "Abgelehnt" and "Angenommen" in Voting-List & unified procedureState definition [#306](https://github.com/demokratie-live/democracy-client/issues/306)
- Resync with bundestag.io on procedures gte 19
- Parameterized the period to be displayed/used

### 0.1.5

- pushNotifications
  - Disabled pushNotifications due to non-functionality

### 0.1.4

- graphQL
  - Procedure resolver: procedures
    - Fix order ( first votedate and add by last update ) [#280](https://github.com/demokratie-live/democracy-client/issues/280)
