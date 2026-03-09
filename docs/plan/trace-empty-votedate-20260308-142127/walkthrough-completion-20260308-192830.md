# Completion Walkthrough

## Overview
Wired the bounded voteDate recovery variables through the Garden run action for `import-conference-week-details` and documented the supported operator command.

## Tasks completed
- Exposed `VOTEDATE_RECOVERY_MODE`, `CONFERENCE_YEAR`, `CONFERENCE_WEEK`, and `CRAWL_MAX_REQUESTS_PER_CRAWL` on the Garden run pod env.
- Documented the exact `garden run import-conference-week-details -e local --var ...` recovery invocation in the service docs.
- Completed a focused review for config/doc parity, bounded replay semantics, and ownership preservation.

## Outcomes
- Operators can now trigger bounded historical voteDate recovery via Garden without editing the service code or using the direct pnpm command.
- The recovery window remains bounded by `CRAWL_MAX_REQUESTS_PER_CRAWL` and uses the existing app-level recovery behavior.
- `import-conference-week-details` remains the only owner of voteDate generation/backfill.

## Validation
- Local `garden validate` passed after the Garden wiring change.
- Final review reported no material issues.

## Next steps
- Run the documented Garden command in the intended local environment to repair the desired historical window.
