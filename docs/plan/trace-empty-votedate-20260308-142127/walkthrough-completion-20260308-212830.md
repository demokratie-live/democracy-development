# Completion Walkthrough

## Overview
Investigated why `https://desktop.local.democracy-app.de/vergangen/` still shows no usable date after the voteDate reliability and Garden wiring changes.

## Tasks completed
- Verified the live page symptom and inspected the runtime GraphQL payload.
- Traced the data path from desktop to democracy-api and down to the underlying Mongo databases and sync jobs.
- Synthesized the first failing boundary and the next concrete operator action.

## Outcomes
- The live runtime still returns `voteDate: null` for affected past procedures, so the problem is not a new frontend-only rendering bug.
- `desktop.local` consumes `democracy-api`, which reads from the downstream `democracy` Mongo database.
- `import-conference-week-details` repairs voteDate in the upstream `bundestagio` database only.
- The most likely missing step is a manual downstream `sync-procedures` run after upstream voteDate repair.
- For older historical gaps, a bounded recovery replay may still be required before running the downstream sync.

## Next steps
- If the affected procedures are historical and outside the recent crawl window, run the bounded `import-conference-week-details` recovery replay first.
- Then run `garden run sync-procedures -e local` so repaired `voteDate` values reach the `democracy` database used by `democracy-api`.
- Recheck the affected procedure IDs (327964, 326707, 326750, 326706, 326823) in the runtime GraphQL response.
