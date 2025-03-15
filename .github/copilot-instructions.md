# GitHub Copilot Instructions

When generating or modifying code in this repository, please adhere to the following guidelines to ensure consistency, maintainability, and high quality.

## Package Management & Build

- **Package Manager:** Use `pnpm` for all package management tasks.
- **Configuration Reuse:** For new packages, always import or extend the shared configurations:
  - `packages/tsconfig`
  - `packages/tsup-config`

## Programming Paradigm

- **Functional Programming:**
  - Prefer a functional approach over object‑oriented patterns.
  - Write pure, deterministic functions that are easy to test.
  - Avoid unnecessary stateful objects.

## Testing Guidelines

- **TDD Approach:** Write tests first before implementing functionality.
- **Testing Frameworks:**
  - Use **vitest** for unit and integration tests.
  - Use **react-testing-library** for testing React components.
- **Test Types:**
  - Create **unit tests** to verify individual functions and core logic.
  - Create **integration tests** to ensure modules and components work together as expected.
  - Create **end-to-end tests** for complete workflow scenarios.
- **Continuous Testing:** Always run tests after changes to catch regressions immediately.
- **Separation of Testing Logic:** Testing and mocking logic must not be integrated into production (implementation) code.

## Design Principles & Patterns

- **Loose Coupling:**
  - Separate modules and external dependencies to minimize the impact of changes.
  - Use abstraction and dependency injection (or function parameters) to isolate external calls (e.g., HTTP requests, file I/O) from your core logic.
- **High Cohesion:**
  - Ensure each module or function has a single, well-defined responsibility.
  - Group related functionality together.
- **Separation of Concerns:**
  - Divide application logic into distinct layers (e.g., presentation, business logic, data access).
  - Decouple data processing from external operations (like network requests or DOM manipulation) so that implementations can be easily swapped.
- **Modularity & Replaceability:**
  - Design and implement interfaces or abstractions that allow you to swap implementations without affecting core logic.
  - Keep core functions pure and free of side effects to enhance testability and maintainability.

## File Structure & Project Organization Best Practices

- **Modular Directory Structure:**
  - Organize your source code (`src/`) by feature or domain rather than by file type. For example:
    - `src/components` for UI components.
    - `src/services` for business logic and API interactions.
    - `src/utils` for helper functions.
- **Test File Organization:**
  - **Colocated Unit Tests:** Place unit test files directly alongside their corresponding source files. For example, if you have `src/crawler.ts`, its unit test should be named `src/crawler.test.ts` (do not use a separate folder like `src/__tests__/` for these tests).
  - **Separate Folders for Integration & E2E Tests:** For tests spanning multiple modules or full system workflows (integration and end-to-end tests), use dedicated directories (e.g., `tests/integration` or `tests/e2e`).
- **Separation of Infrastructure and Logic:**
  - Separate core business logic from infrastructure code (e.g., network or file I/O) into distinct modules to allow for easier swapping or mocking.
- **Naming Conventions:**
  - Use clear, descriptive names for files and directories that accurately reflect their purpose.
  - Keep folder structures as flat as possible while maintaining clarity.
- **Shared Configurations:**
  - Centralize shared configuration files (e.g., TypeScript settings, bundler configurations) in a common directory (like `packages/`) and reference them in individual packages.
- **Documentation & Readability:**
  - Include README files in key directories to explain their purpose and structure.
  - Follow consistent coding and folder organization standards across the repository.

## Code Quality & Issue Resolution

- **ESLint:** Run ESLint after every change. Fix issues by running `pnpm lint --fix` in the affected package.
- **TypeScript Checks:** Always run TypeScript checks after changes to ensure there are no type errors.
- **General:** Resolve all code quality issues before committing changes.

**Additional Note:**

- Testing and mocking logic must be kept exclusively within test files; it should not be mixed into production (implementation) code.
- For unit tests, prefer colocating test files with their source files (e.g., `src/utils.ts` and `src/utils.test.ts`), while integration and end-to-end tests should reside in dedicated directories.

When generating new code or suggesting improvements, ensure that:

- The code adheres to these guidelines.
- It follows best practices for file structure, design patterns, and testing.
- ESLint and TypeScript checks pass, and tests run successfully after each change.
