# GitHub Copilot Custom Agents

This directory contains custom agent configurations for GitHub Copilot. These agents are specialized AI assistants that help with specific aspects of development in this project.

## Available Agents

### 1. Test Agent (`test-agent.yml`)
**Purpose**: Specialized in generating and maintaining test code

**Use this agent for**:
- Writing unit tests with vitest
- Creating integration tests
- Testing React components with @testing-library/react
- Testing NestJS backend services
- Setting up test mocks and fixtures
- Improving test coverage

**Expertise**:
- Vitest framework
- React Testing Library
- NestJS testing utilities
- Test-Driven Development (TDD)
- Mocking strategies

### 2. Code Review Agent (`code-review-agent.yml`)
**Purpose**: Conducting thorough code reviews

**Use this agent for**:
- Reviewing pull requests
- Identifying code quality issues
- Checking for security vulnerabilities
- Ensuring architecture compliance
- Performance optimization suggestions
- Accessibility checks

**Review areas**:
- Code style and consistency
- Security and performance
- Architecture and design patterns
- Testing coverage
- Documentation completeness

### 3. Documentation Agent (`documentation-agent.yml`)
**Purpose**: Creating and maintaining documentation

**Use this agent for**:
- Writing API documentation
- Creating README files
- Adding JSDoc/TSDoc comments
- Writing user guides
- Architecture documentation
- Updating existing docs

**Documentation types**:
- Code documentation (JSDoc)
- README files
- API documentation (REST/GraphQL)
- Architecture diagrams
- Developer guides

### 4. Frontend Agent (`frontend-agent.yml`)
**Purpose**: Next.js and React development

**Use this agent for**:
- Building React components
- Next.js page development
- Implementing responsive layouts
- State management
- Performance optimization
- Accessibility improvements

**Expertise**:
- Next.js (App Router & Pages Router)
- React functional components
- React hooks
- TypeScript
- Functional programming
- Web performance

### 5. Backend Agent (`backend-agent.yml`)
**Purpose**: NestJS backend development

**Use this agent for**:
- Creating NestJS modules and services
- GraphQL resolver development
- Database schema design
- API authentication and authorization
- Error handling
- Performance optimization

**Expertise**:
- NestJS framework
- GraphQL API design
- TypeORM
- Authentication (JWT, OAuth)
- Database optimization
- Microservices patterns

## How to Use Custom Agents

### With GitHub Copilot Chat
When using GitHub Copilot in your IDE, you can reference these agents in your prompts:

```
@workspace Use the test-agent to create unit tests for the UserService
```

```
@workspace Ask the frontend-agent to review this React component for performance issues
```

### Best Practices

1. **Choose the Right Agent**: Select the agent that matches your task domain
2. **Be Specific**: Provide clear context and requirements in your prompts
3. **Iterate**: Agents can refine their responses based on feedback
4. **Combine Agents**: Use multiple agents for complex tasks (e.g., code-review-agent + test-agent)

## Agent Configuration

Each agent is configured with:
- **Name**: Unique identifier for the agent
- **Description**: Brief summary of the agent's purpose
- **Instructions**: Detailed guidelines, patterns, and best practices

## Maintaining Agents

### Adding New Agents
1. Create a new `.yml` file in this directory
2. Follow the structure of existing agents
3. Include comprehensive instructions and examples
4. Update this README with the new agent information

### Updating Existing Agents
- Keep instructions aligned with project evolution
- Add new patterns and best practices as they emerge
- Include real examples from the codebase
- Update based on team feedback

## Integration with Project

These agents are designed to work with:
- **Package Manager**: pnpm
- **Build Tool**: TurboRepo
- **Frontend**: Next.js, React
- **Backend**: NestJS, GraphQL
- **Testing**: Vitest, React Testing Library
- **Environment**: Devbox

## Related Files

- `.github/copilot-instructions.md` - General Copilot instructions
- `.github/test-generation-instructions.md` - Test generation guidelines
- `.github/code-generation-instructions.md` - Code generation rules
- `.github/commit-message-instructions.md` - Commit message standards
- `.github/pr-description-instructions.md` - PR description format
- `.github/review-selection-instructions.md` - Code review guidelines

## Feedback

If you find ways to improve these agents or have suggestions for new agents, please:
1. Open an issue describing the improvement
2. Discuss with the team
3. Submit a PR with your changes

---

For more information about GitHub Copilot and custom agents, see the [GitHub Copilot documentation](https://docs.github.com/copilot).
