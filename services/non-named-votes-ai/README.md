# Non-Named Votes AI

This service extracts text sections from German Bundestag plenary protocols that contain non-named votes. It uses OpenAI to locate and extract the exact wording of voting sections from PDF documents.

## Purpose

The Non-Named Votes AI service processes plenary protocols to find sections where non-named votes occur. It returns the exact text of the voting section, preserving the original wording from the protocol document.

## Features

- PDF protocol processing using OpenAI assistants and vector stores
- Extraction of voting sections from plenary protocols
- Database caching of processed documents and AI resources
- REST API for querying voting text
- Secure authentication for API access

## Architecture

This service follows a functional programming approach with clear separation of concerns:

- Core business logic is kept separate from infrastructure code
- External API calls (OpenAI) are abstracted away from the main workflow
- Database operations are isolated from the main application logic

## Setup

### Prerequisites

- Node.js (version as specified in project)
- PNPM package manager
- MongoDB database
- OpenAI API key

### Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then configure:

```
OPENAI_API_KEY=your_openai_api_key
NON_NAMED_VOTES_AI_SECRET=your_service_auth_token
PORT=3005
DB_URL=mongodb://localhost:27017/bundestagio
PINO_LOG_LEVEL=info
ALLOWED_DOMAINS=https://dserver.bundestag.de
```

### Installation

```bash
# Install dependencies
pnpm install

# Development with hot reload
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start
```

## API Reference

### Get Beschlusstext (Voting Text)

```
GET /beschlusstext
```

**Authentication:**

- Bearer token authentication required
- Token must match `NON_NAMED_VOTES_AI_SECRET`

**Parameters:**

- `pdfUrl`: URL to the plenary protocol PDF (must be from an allowed domain)
- `title`: Title of the legislation or motion
- `drucksachen`: (optional) Document numbers related to the vote

**Response:**

```json
{
  "pdfUrl": "https://dserver.bundestag.de/example.pdf",
  "text": "Wir kommen zur Abstimmung über die Beschlussempfehlung des..."
}
```

### Delete All Resources

```
DELETE /all
```

**Authentication:**

- Bearer token authentication required
- Token must match `NON_NAMED_VOTES_AI_SECRET`

**Response:**

```json
{
  "message": "deleted all"
}
```

## Flow

See [FLOW.md](./FLOW.md) for detailed flow diagrams explaining the service operation.

## License

Apache-2.0
