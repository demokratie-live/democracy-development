# Import Conference Week Details

This package crawls and imports conference week details from the Bundestag website with support for both HTML and JSON data sources.

## Features

- **Dual Data Source Support**: Switch between HTML parsing and JSON API endpoints
- **A/B Testing Ready**: Configuration-driven data source selection
- **Functional programming approach** with pure functions and minimal state
- **Strong TypeScript typing** and error handling
- **Comprehensive test coverage** including unit, integration, and error handling tests
- **Uses shared configurations** from workspace packages

## Setup

```bash
pnpm install
```

## Configuration

The service supports two data sources that can be configured via environment variables:

### HTML Parsing (Default)
```bash
# Uses HTML parsing from conferenceweekDetail.form endpoint
DATA_SOURCE=html  # or omit (default)
```

### JSON API  
```bash
# Uses JSON API from conferenceWeekJSON endpoint
DATA_SOURCE=json
```

### Other Configuration Options
```bash
CONFERENCE_YEAR=2025    # Starting year
CONFERENCE_WEEK=39      # Starting week  
CONFERENCE_LIMIT=10     # Results per page (HTML only)
CRAWL_MAX_REQUESTS_PER_CRAWL=10  # Request limit per crawl
DB_URL=mongodb://localhost:27017/bundestagio  # Database connection
```

## Development

```bash
# Run in development mode with auto-reload
pnpm dev

# Build the package
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint
```

## Architecture

The package follows a functional programming approach with clear separation of concerns:

- `src/crawler.ts` - Core crawling logic
- `src/services/html-parser.ts` - HTML parsing functions
- `src/services/json-parser.ts` - JSON parsing functions
- `src/utils/url-builder.ts` - URL generation based on data source
- `src/utils/url.ts` - URL handling utilities
- `src/types.ts` - TypeScript type definitions
- `src/config.ts` - Configuration management
- `src/routes.ts` - Request routing and handler logic
- `src/index.ts` - Main entry point with error handling

## Data Sources

### HTML Endpoint (Default)
- URL: `https://www.bundestag.de/apps/plenar/plenar/conferenceweekDetail.form?year=X&week=Y&limit=Z`
- Uses HTML parsing with Cheerio
- Backward compatible with existing implementation

### JSON Endpoint (New)
- URL: `https://www.bundestag.de/apps/plenar/plenar/conferenceWeekJSON?year=X&week=Y`
- Uses native JSON parsing
- Provides structured data directly

Both data sources produce identical database properties for seamless A/B testing.

## Testing

Tests are colocated with their source files and include:

- **Unit tests** for individual functions
- **Integration tests** for complete workflow
- **Data source comparison tests** ensuring HTML and JSON produce identical results
- **Configuration tests** for environment variable handling
- **Error handling tests** for edge cases

### Test Coverage
- 32 new tests for JSON functionality
- 93 total tests passing
- Full data consistency validation between HTML and JSON sources

## Error Handling

The package handles various error scenarios:

- Network errors during crawling
- Malformed HTML/JSON responses  
- Invalid URL parameters
- Parse errors in conference week details
- Invalid configuration values

All errors are properly logged with context for debugging.

## A/B Testing

The service is ready for A/B testing between HTML and JSON data sources:

1. **Set `DATA_SOURCE=html`** to use HTML parsing (default, backward compatible)
2. **Set `DATA_SOURCE=json`** to use JSON API (new implementation)

Both configurations:
- Generate appropriate URLs automatically
- Use the same data structures
- Produce identical database properties
- Handle navigation and document extraction consistently

## Features Checklist

- [x] Crawls https://www.bundestag.de/tagesordnung to get the conference week details entry page
- [x] Extracts the conference week details "year" and "week" from the URL
- [x] Get the next conference week details page via .meta-slider and add them to the crawlee queue  
- [x] **NEW**: Configuration-driven data source selection (HTML vs JSON)
- [x] **NEW**: JSON endpoint support with identical data output
- [x] **NEW**: A/B testing capabilities
- [x] **NEW**: Comprehensive test coverage for both data sources
