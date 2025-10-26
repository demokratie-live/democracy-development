# VoteDate Investigation Summary

## Problem

No procedures are being displayed in the current session weeks (Sitzungswochen). The frontend sorts by `voteDate`, but this field appears to be missing or not populated.

## How voteDate is populated

The `voteDate` field is **NOT** scraped directly from bundestag.de. Instead, it's populated through a multi-step process:

### Step 1: DIP API Crawler (`services/cron-jobs/crawler`)

- Imports procedures from the DIP (Dokumentations- und Informationssystem) API
- **Does NOT set voteDate** during initial import
- File: `services/cron-jobs/crawler/src/import-procedures/import-procedures.ts`

### Step 2: Conference Week Details Scraper (`services/cron-jobs/import-conference-week-details`)

- Scrapes conference week schedules from bundestag.de
- Extracts session dates and agendaitems (TOPs)
- **Links procedures to sessions** via `procedureIds` array
- Uses document URL matching to find associated procedures
- File: `services/cron-jobs/import-conference-week-details/src/index.ts`
- Function: `getProcedureIds()` - matches documents to procedures

### Step 3: Sync Procedures (`services/cron-jobs/sync-procedures`)

- Runs after the other crawlers
- **Sets voteDate** based on either:
  1. `bIoProcedure.voteDate` if it exists from conference week sessions
  2. Derives from `voteWeek` and `voteYear` if available
- File: `services/cron-jobs/sync-procedures/src/index.ts` (lines 176-186)

```typescript
// Extract Session info
if (bIoProcedure.sessions) {
  // This assumes that the last entry will always be the vote
  const lastSession = bIoProcedure.sessions.pop();
  if (lastSession && lastSession.session?.top?.topic?.isVote) {
    importProcedure.voteWeek = lastSession.thisWeek;
    importProcedure.voteYear = lastSession.thisYear;
    importProcedure.sessionTOPHeading = nullToUndefined(lastSession.session.top.heading);
  }
}
// Set CalendarWeek & Year even if no sessions where found
// Always override Week & Year by voteDate since we sort by this and the session match is not too accurate
if (bIoProcedure.voteDate) {
  importProcedure.voteWeek = parseInt(moment(bIoProcedure.voteDate).format('W'));
  importProcedure.voteYear = moment(bIoProcedure.voteDate).year();
}
```

## Root Cause Analysis

The issue is likely one of the following:

1. **Conference week scraper not running** - ConferenceWeekDetailModel not populated
2. **Document matching failing** - `getProcedureIds()` cannot match documents between conference weeks and procedures
3. **Session dates missing** - Conference week sessions don't have proper dates
4. **voteDate not being derived** - sync-procedures not correctly setting voteDate from sessions

## Database Models

### Procedure Model

- Field: `voteDate` (Date, optional)
- Field: `voteWeek` (Number)
- Field: `voteYear` (Number)
- Field: `importantDocuments` (Array of documents with URLs)

### ConferenceWeekDetail Model

- Field: `sessions` (Array)
  - `sessions[].date` (Date)
  - `sessions[].tops` (Array of agenda items)
    - `tops[].topic` (Array)
      - `topic[].isVote` (Boolean)
      - `topic[].procedureIds` (Array of procedure IDs)
      - `topic[].documents` (Array of document URLs)

## Frontend Impact

File: `democracy/desktop/src/components/templates/FilteredPage.tsx`

- Sorts procedures by `voteDate` (line 55)
- If `voteDate` is null/undefined, procedures may be sorted incorrectly or filtered out

## Diagnostic Steps

1. Run the diagnostic script:

   ```bash
   cd scripts
   tsx diagnose-votedate.ts
   ```

2. Check cron job logs:

   - Conference week details import
   - Sync procedures

3. Query database directly:

   ```javascript
   // Check procedures without voteDate
   db.procedures.find({ period: 21, voteDate: { $exists: false } }).count();

   // Check recent conference weeks
   db.conferenceweekdetails.find().sort({ thisYear: -1, thisWeek: -1 }).limit(5);

   // Check procedure linking
   db.conferenceweekdetails.find({ 'sessions.tops.topic.procedureIds': { $exists: true, $ne: [] } });
   ```

## Next Steps

1. **Verify cron jobs are running**

   - Check that import-conference-week-details is scheduled and executing
   - Check that sync-procedures runs after conference week import

2. **Inspect document matching logic**

   - Review `getProcedureIds()` in import-conference-week-details
   - Ensure document URL patterns still match between bundestag.de and DIP API

3. **Check data consistency**

   - Verify conference week sessions have valid dates
   - Ensure `isVote` flag is correctly set on relevant TOPs

4. **Manual fix (if needed)**
   - Run conference week import manually
   - Run sync-procedures manually to update voteDate fields
