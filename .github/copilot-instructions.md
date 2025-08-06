# Democracy API Server

Democracy API is a Node.js TypeScript GraphQL API server that provides data for the DEMOCRACY mobile app. It connects to MongoDB for data storage and includes cron jobs for importing data from bundestag.io.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites and Setup
- Node.js 16+ is required (GitHub Actions use Node 16, but Node 20+ works with workarounds)
- MongoDB database is REQUIRED for development and integration testing
- Yarn package manager
- Docker (optional, for containerized MongoDB)

### Bootstrap and Build Process
- `cp .env.example .env` -- Create environment configuration
- `yarn install --ignore-engines` -- Install dependencies. Takes ~19 seconds. ALWAYS use --ignore-engines flag due to Node.js version incompatibilities with @apollo/federation package
- `yarn build` -- Compile TypeScript. Takes 3-4 seconds. NEVER CANCEL
- `yarn lint` -- Run all linting (ESLint + TypeScript + unused exports). Takes ~7 seconds. NEVER CANCEL  
- `yarn test` -- Run unit tests. Takes 2-3 seconds. NEVER CANCEL

### Development Server
- **CRITICAL**: Development server requires MongoDB to start successfully
- `yarn dev` -- Start development server on port 3000. Fails immediately without MongoDB connection
- Server starts at http://localhost:3000/ with GraphQL endpoint at root path
- **Apollo Prometheus metrics** server runs on port 3400
- Hot reloading enabled for src/graphql directory changes

### MongoDB Setup Options
**Option 1: Docker (Recommended)**
```bash
docker run -d --name mongo-dev -p 27017:27017 mongo:4.4
yarn dev
```

**Option 2: Docker Compose (Advanced)**
```bash
docker network create democracy
# Requires external MongoDB container named "mongo" in "democracy" network
docker-compose up
```

### GraphQL Code Generation
- `yarn generate` -- Generate GraphQL types from running server. Takes ~1 second. REQUIRES development server to be running on port 3000
- **ALWAYS start development server BEFORE running code generation**
- Generates files: `src/generated/graphql.ts` and `graphql.schema.json`

### Testing
- `yarn test` -- Unit tests (3 suites, 8 tests). Takes 2-3 seconds. NEVER CANCEL
- `yarn test:integration` -- Integration tests. Takes 3-18 seconds. REQUIRES MongoDB connection. Currently fails due to GraphQL endpoint issues and deprecated MongoDB methods
- **Integration tests are not reliable** -- focus on unit tests and manual testing

### Validation and Quality Assurance
- ALWAYS run `yarn lint` before committing changes or CI will fail
- ALWAYS run `yarn build` to verify TypeScript compilation
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
- **ALWAYS use `yarn install --ignore-engines`** -- Standard `yarn install` fails due to @apollo/federation requiring Node <17
- Current Node 20+ works fine for development despite package warnings

### Development Server Won't Start
- **Check MongoDB**: Server fails immediately with clear MongoDB connection error if database unavailable
- **Expected error**: `MongoNetworkError: failed to connect to server [localhost:27017]`
- **Solution**: Start MongoDB container or local MongoDB instance

### GraphQL Generation Fails
- **Cause**: Server not running on port 3000
- **Error**: `Failed to load schema from http://localhost:3000: ECONNREFUSED`
- **Solution**: Start development server first with `yarn dev`, then run `yarn generate`

### Integration Tests Failing
- **Known Issue**: Integration tests fail due to deprecated MongoDB methods and GraphQL endpoint configuration
- **Workaround**: Focus on unit tests and manual validation
- **Database**: Tests require MongoDB connection to `mongodb://localhost/democracy`

### Build Performance
- TypeScript compilation: ~3-4 seconds (very fast)
- Linting: ~7 seconds
- Unit tests: ~2-3 seconds
- Package installation: ~19 seconds with --ignore-engines

## Repository Structure

### Key Directories
```
src/
├── config/           # Configuration files (JWT, SMS, cron jobs)
├── express/          # Express middleware and routes
├── generated/        # Generated GraphQL types (yarn generate)
├── graphql/          # GraphQL schema and resolvers
├── services/         # Core services (MongoDB, logging, cron jobs)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### Configuration Files
- `.env` -- Environment variables (copy from .env.example)
- `package.json` -- Dependencies and scripts
- `tsconfig.json` -- TypeScript configuration
- `jest.unit.config.js` -- Unit test configuration
- `jest.integration.config.js` -- Integration test configuration
- `docker-compose.yaml` -- Docker development environment
- `garden.yaml` -- Kubernetes integration testing (Garden.io)

### GitHub Actions
- `.github/workflows/test.yaml` -- Main CI (lint, test, build)
- `.github/workflows/test-integration.yaml` -- Kubernetes integration tests with Garden.io
- **Node 16** specified in CI workflows

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
2. **Use --ignore-engines flag** for yarn install
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