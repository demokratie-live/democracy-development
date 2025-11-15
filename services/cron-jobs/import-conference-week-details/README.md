# Import Conference Week Details

This package imports conference week details (Tagesordnung) from the Bundestag JSON API and stores them in MongoDB.

## Features

- **JSON API Integration:** Fetches conference week data from Bundestag's `conferenceWeekJSON` endpoint
- **Vote Detection:** Automatically identifies votes (2nd/3rd reading, recommendations, amendments) using text patterns
- **Procedure Linking:** Links agenda items with procedures from DIP API using document IDs (BT-Drucksachen)
- **VoteDate Update:** Automatically sets `voteDate` field in procedures based on session dates and vote detection
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

## Error Handling

The package handles various error scenarios:

- Network errors during JSON API requests
- Invalid JSON responses
- Missing or malformed data
- Database connection issues
- Procedure linking failures

All errors are properly logged with context for debugging using Crawlee's logging system.
