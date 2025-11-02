# Democracy API Server

Democracy API is a Node.js TypeScript GraphQL API server that provides data for the DEMOCRACY mobile app. It connects to MongoDB for data storage and includes cron jobs for importing data from bundestag.io.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites and Setup
- Node.js 20+ is required (required by @typescript-eslint packages)
- MongoDB database is REQUIRED for development and integration testing
- pnpm package manager (v10.19.0)
- Docker (optional, for containerized MongoDB)

### Bootstrap and Build Process
- `cp .env.example .env` -- Create environment configuration
- `pnpm install` -- Install dependencies. Takes ~19 seconds. Uses `.npmrc` with `engine-strict=false` for compatibility with older dependencies (e.g., @apollo/federation)
- `pnpm build` -- Compile TypeScript. Takes 3-4 seconds. NEVER CANCEL
- `pnpm lint` -- Run all linting (ESLint + TypeScript + unused exports). Takes ~7 seconds. NEVER CANCEL  
- `pnpm test` -- Run unit tests. Takes 2-3 seconds. NEVER CANCEL

### Development Server
- **CRITICAL**: Development server requires MongoDB to start successfully
- `pnpm dev` -- Start development server on port 3000. Fails immediately without MongoDB connection
- Server starts at http://localhost:3000/ with GraphQL endpoint at root path
- **Apollo Prometheus metrics** server runs on port 3400
- Hot reloading enabled for src/graphql directory changes

### MongoDB Setup Options
**Option 1: Docker (Recommended)**
```bash
docker run -d --name mongo-dev -p 27017:27017 mongo:4.4
pnpm dev
```

**Option 2: Docker Compose (Advanced)**
```bash
docker network create democracy
# Requires external MongoDB container named "mongo" in "democracy" network
docker-compose up
```

### GraphQL Code Generation
- `pnpm generate` -- Generate GraphQL types from running server. Takes ~1 second. REQUIRES development server to be running on port 3000
- **ALWAYS start development server BEFORE running code generation**
- Generates files: `src/generated/graphql.ts` and `graphql.schema.json`

### Testing
- `pnpm test` -- Unit tests (3 suites, 8 tests). Takes 2-3 seconds. NEVER CANCEL
- `pnpm test:integration` -- Integration tests. Takes 3-18 seconds. REQUIRES MongoDB connection. Currently fails due to GraphQL endpoint issues and deprecated MongoDB methods
- **Integration tests are not reliable** -- focus on unit tests and manual testing

### Validation and Quality Assurance
- ALWAYS run `pnpm lint` before committing changes or CI will fail
- ALWAYS run `pnpm build` to verify TypeScript compilation
- **Manual Testing Scenarios**: 
  - Start development server with MongoDB
  - Test GraphQL endpoint: `curl -X POST -H "Content-Type: application/json" -d '{"query":"{ __typename }"}' http://localhost:3000/`
  - Expected response: `{"data":{"__typename":"Query"}}`
  - Verify server logs show: `🚀 Server ready at http://localhost:3000/`

### Docker Development
- `docker-compose.yaml` provides containerized development environment
- Requires external "democracy" Docker network
- Database URL: `mongodb://mongo/democracy`
- **Note**: Integration tests use Garden.io for Kubernetes testing in CI

## Common Tasks and Troubleshooting

### Node.js Version Issues
- **Node.js 20.9.0+ is required** -- @typescript-eslint packages require Node.js ^18.18.0 || ^20.9.0 || >=21.1.0
- **Uses `.npmrc` with `engine-strict=false`** -- This handles compatibility with older dependencies (e.g., @apollo/federation)
- pnpm version is pinned to 10.19.0 via `packageManager` field in package.json
- `engines` field in package.json specifies Node >=20.9.0

### Development Server Won't Start
- **Check MongoDB**: Server fails immediately with clear MongoDB connection error if database unavailable
- **Expected error**: `MongoNetworkError: failed to connect to server [localhost:27017]`
- **Solution**: Start MongoDB container or local MongoDB instance

### GraphQL Generation Fails
- **Cause**: Server not running on port 3000
- **Error**: `Failed to load schema from http://localhost:3000: ECONNREFUSED`
- **Solution**: Start development server first with `pnpm dev`, then run `pnpm generate`

### Integration Tests Failing
- **Known Issue**: Integration tests fail due to deprecated MongoDB methods and GraphQL endpoint configuration
- **Workaround**: Focus on unit tests and manual validation
- **Database**: Tests require MongoDB connection to `mongodb://localhost/democracy`

### Build Performance
- TypeScript compilation: ~3-4 seconds (very fast)
- Linting: ~7 seconds
- Unit tests: ~2-3 seconds
- Package installation: ~19 seconds with pnpm

## Repository Structure

### Key Directories
```
src/
├── config/           # Configuration files (JWT, SMS, cron jobs)
├── express/          # Express middleware and routes
├── generated/        # Generated GraphQL types (pnpm generate)
├── graphql/          # GraphQL schema and resolvers
├── services/         # Core services (MongoDB, logging, cron jobs)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### Configuration Files
- `.env` -- Environment variables (copy from .env.example)
- `.npmrc` -- pnpm configuration (engine-strict=false for Node.js compatibility)
- `package.json` -- Dependencies and scripts
- `tsconfig.json` -- TypeScript configuration
- `jest.unit.config.js` -- Unit test configuration
- `jest.integration.config.js` -- Integration test configuration
- `docker-compose.yaml` -- Docker development environment
- `garden.yaml` -- Kubernetes integration testing (Garden.io)

### GitHub Actions
- `.github/workflows/test.yaml` -- Main CI (lint, test, build)
- `.github/workflows/test-integration.yaml` -- Kubernetes integration tests with Garden.io
- **Node 20** specified in CI workflows

## External Dependencies

### Required Services
- **MongoDB**: Primary database, required for development
- **Elasticsearch**: Configured but not required for basic startup
- **bundestag.io**: External service for importing parliamentary data (optional for development)

### Key Features
- **GraphQL API**: Apollo Server with Express
- **Authentication**: JWT-based with SMS verification
- **Push Notifications**: Firebase Cloud Messaging and Apple Push Notifications
- **Cron Jobs**: Automated data import from bundestag.io
- **Monitoring**: Express status monitor and Prometheus metrics

## Development Workflow Best Practices
1. **Always check MongoDB is running** before starting development server
2. **Engine compatibility handled by `.npmrc`** -- No need for manual flags with pnpm install
3. **Run linting** before committing changes
4. **Test GraphQL endpoint** manually after server changes
5. **Generate GraphQL types** when schema changes (requires running server)
6. **Focus on unit tests** rather than integration tests for validation

## Commit Message Convention

This project uses **Conventional Commits** enforced by commitlint and husky hooks.

### Commit Message Format
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Required Types
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Examples
```bash
feat: add user authentication
fix: resolve GraphQL schema validation error
docs: update API documentation
chore: upgrade dependencies
ci: add integration tests workflow
```

### Validation
- **Automatic validation**: Husky pre-commit hook runs `commitlint` to validate commit messages
- **Configuration**: `.commitlintrc.json` extends `@commitlint/config-conventional`
- **Breaking changes**: Use `BREAKING CHANGE:` in footer or `!` after type (e.g., `feat!: remove deprecated API`)
- **Scope examples**: `feat(auth):`, `fix(graphql):`, `docs(readme):`

### Best Practices
- Use imperative mood: "add" not "added" or "adds"
- Keep description under 72 characters
- Don't capitalize first letter of description
- No period at the end of description
- Use body to explain what and why, not how