# Import Conference Week Details

This package imports conference week details (Tagesordnung) from the Bundestag JSON API and stores them in MongoDB.

## Features

- **JSON API Integration:** Fetches conference week data from Bundestag's `conferenceWeekJSON` endpoint
- **Vote Detection:** Automatically identifies votes (2nd/3rd reading, recommendations, amendments) using text patterns
- **Procedure Linking:** Links agenda items with procedures from DIP API using document IDs (BT-Drucksachen)
- **VoteDate Update:** Automatically sets `voteDate` field in procedures based on session dates and vote detection
- **Bounded VoteDate Recovery Replay:** Can explicitly replay a historical week window to repair already-missing `voteDate` values
- **MongoDB Storage:** Saves conference week details to database with full session and agenda item structure
- **Navigation Support:** Follows previous/next week links to fetch multiple conference weeks

## Documentation

- 📊 [VoteDate Flow Documentation](./docs/votedate-flow.md) - Complete voteDate data flow with Mermaid diagrams

## Setup

```bash
pnpm install
```

## Development

```bash
# Run in development mode with auto-reload
pnpm dev

# Build the package
pnpm build

# Run production build
pnpm start

# Run tests
pnpm test

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix
```

## Architecture

The package follows a functional programming approach with clear separation of concerns:

### Core Files

- `src/index.ts` - Main entry point with MongoDB integration and error handling
- `src/main.ts` - Crawler orchestration and result caching
- `src/crawler.ts` - Core crawling logic using JSON API
- `src/config.ts` - Configuration management
- `src/routes.ts` - Request handler routing (legacy compatibility)

### Services

- `src/services/json-fetcher.ts` - Fetches data from Bundestag JSON API
- `src/services/json-to-session-mapper.ts` - Maps JSON API responses to database schema
- `src/services/html-parser.ts` - Legacy HTML parsing functions
- `src/services/parsers/` - Specialized parsers:
  - `html-detail-parser.ts` - Parses HTML detail strings from JSON
  - `topic-parser.ts` - Extracts topic information
  - `session-parser.ts` - Parses session data
  - `document-parser.ts` - Extracts document references (BT-Drucksachen)
  - `navigation-parser.ts` - Parses navigation links
  - `date-utils.ts` - Date parsing utilities

### Utilities

- `src/utils/vote-detection.ts` - Detects votes and links procedures using text patterns
- `src/utils/update-vote-dates.ts` - Updates procedure voteDates from conference weeks
- `src/utils/url.ts` - URL handling utilities

### Types

- `src/types.ts` - TypeScript type definitions for internal models
- `src/types-json.ts` - Type definitions for Bundestag JSON API responses

## Testing

Tests are colocated with their source files following the project's conventions:

- **Unit Tests:** Individual function tests (e.g., `src/crawler.test.ts`, `src/services/json-to-session-mapper.test.ts`)
- **Parser Tests:** Specialized tests in `src/services/parsers/__tests__/`
- **Integration Tests:** Full workflow tests in `tests/integration/`

Run tests with coverage:

```bash
pnpm test
```

## Data Flow

1. **Fetch:** Retrieve JSON data from `/apps/plenar/plenar/conferenceWeekJSON?year=YYYY&week=WW`
2. **Parse:** Extract sessions, agenda items (TOPs), topics, and documents from JSON
3. **Link:** Match documents (BT-Drucksachen) with procedures from DIP API
4. **Detect:** Identify votes using text patterns (2./3. Lesung, Beschlussempfehlung, etc.)
5. **Store:** Save to MongoDB via `ConferenceWeekDetailModel`
6. **Update:** Set `voteDate` in procedures based on detected votes and session dates

## VoteDate recovery replay

`import-conference-week-details` remains the owning service for `voteDate` generation and backfill. The regular run stays bounded to the latest `CRAWL_MAX_REQUESTS_PER_CRAWL` conference weeks. To repair already-missing `voteDate` values outside that default window, run an explicit bounded replay.

### Garden invocation

Use this exact Garden command for the supported local recovery run:

```bash
garden run import-conference-week-details -e local --var VOTEDATE_RECOVERY_MODE=1 --var CONFERENCE_YEAR=2025 --var CONFERENCE_WEEK=8 --var CRAWL_MAX_REQUESTS_PER_CRAWL=4
```

`services/cron-jobs/import-conference-week-details/garden.yml` passes these variables into the run pod so the Garden run and the local `pnpm run:dev` flow use the same application behavior.

### Direct local execution

If you are running the service directly instead of through Garden, the equivalent local command remains:

```bash
VOTEDATE_RECOVERY_MODE=1 \
CONFERENCE_YEAR=2025 \
CONFERENCE_WEEK=8 \
CRAWL_MAX_REQUESTS_PER_CRAWL=4 \
pnpm run:dev
```

### Variable meanings and bounded behavior

- `VOTEDATE_RECOVERY_MODE=1` switches the voteDate backfill from the default "latest stored weeks" mode to an explicit recovery replay window
- `CONFERENCE_YEAR=2025` sets the first conference year in that replay window
- `CONFERENCE_WEEK=8` sets the first conference week in that replay window
- `CRAWL_MAX_REQUESTS_PER_CRAWL=4` keeps both the crawl and the voteDate backfill bounded to exactly the same four-week window
- In recovery mode the backfill window starts at `2025/8`, ends at the fourth crawled week, and reads only that bounded range back from MongoDB
- Re-running the same window is idempotent: conference weeks are upserted and `voteDate` is written deterministically from the same session dates again
- If one `procedureId` is detected on multiple vote dates inside the processed window, the service applies the canonical conflict rule and stores the **latest detected session date** in both normal mode and recovery replay mode

## Error Handling

The package handles various error scenarios:

- Network errors during JSON API requests
- Invalid JSON responses
- Missing or malformed data
- Database connection issues
- Procedure linking failures

All errors are properly logged with context for debugging using Crawlee's logging system.
