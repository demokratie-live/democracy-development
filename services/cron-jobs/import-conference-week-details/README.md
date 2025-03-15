# Import Conference Week Details

This package crawls and imports conference week details from the Bundestag website.

## Features

- Functional programming approach with pure functions and minimal state
- Strong TypeScript typing and error handling
- Comprehensive test coverage including unit, integration, and error handling tests
- Uses shared configurations from workspace packages

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

# Run tests
pnpm test

# Run linting
pnpm lint
```

## Architecture

The package follows a functional programming approach with clear separation of concerns:

- `src/crawler.ts` - Core crawling logic
- `src/services/html-parser.ts` - HTML parsing functions
- `src/utils/url.ts` - URL handling utilities
- `src/types.ts` - TypeScript type definitions
- `src/index.ts` - Main entry point with error handling

## Testing

Tests are colocated with their source files:

- Unit tests for individual functions
- Integration tests for complete workflow
- Error handling tests for edge cases

## Error Handling

The package handles various error scenarios:

- Network errors during crawling
- Malformed HTML responses
- Invalid URL parameters
- Parse errors in conference week details

All errors are properly logged with context for debugging.

## Features

- [x] Crawls https://www.bundestag.de/tagesordnung to get the conference week details entry page
- [x] Extracts the conference week details "year" and "week" from the URL
- [x] Get the next conference week details page via .meta-slider `data-previousyear="2025" data-previousweeknumber="7" data-nextyear="" data-nextweeknumber=""` and add them to the crawlee queue
- [ ]
