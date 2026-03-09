# Completion Walkthrough

## Overview
Used Playwright and MongoDB to verify the current missing-date problem on `/vergangen` with runtime evidence and direct database comparisons.

## Tasks completed
- Verified the live page and captured affected runtime GraphQL payload items.
- Compared the same procedures between `bundestagio.procedures` and `democracy.procedures`.
- Synthesized a revised root-cause verdict based on direct runtime and MongoDB evidence.

## Outcomes
- The runtime API still returns `voteDate: null` for affected past procedures.
- The same procedures exist in both databases.
- `bundestagio.procedures` currently has no top-level `voteDate` field for the affected procedures and, by aggregation, none across the collection.
- `democracy.procedures` stores `voteDate: null`, so downstream is propagating an upstream missing field rather than dropping a populated value.
- This revises the earlier hypothesis: the first failing boundary is upstream source-side voteDate materialization/backfill, not merely a missing downstream sync.

## Next steps
- Fix or rerun the upstream voteDate derivation/backfill so `bundestagio.procedures.voteDate` is actually populated.
- After upstream data exists, rerun downstream sync so `democracy.procedures` and the desktop runtime receive non-null `voteDate`.
