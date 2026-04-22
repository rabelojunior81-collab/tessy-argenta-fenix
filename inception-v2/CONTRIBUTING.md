# Contributing to Inception Framework

Thank you for your interest in contributing to Inception Framework! This document provides guidelines and standards for contributing to ensure consistency, quality, and maintainability.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Coding Standards](#coding-standards)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Internationalization (i18n)](#internationalization-i18n)
- [Security](#security)

## 📜 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 22.0.0 (required — uses `node:sqlite` built-in, not available in Node 20/21)
- **pnpm**: >= 8.0.0
- **Git**: >= 2.30.0

### Development Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/inception.git
cd inception

# 2. Install dependencies
pnpm install

# 3. Build all packages
pnpm build

# 4. Run tests
pnpm test

# 5. Start development mode
pnpm dev
```

## 🔄 Contribution Workflow

### 1. Create an Issue

Before starting work, create an issue to discuss:

- Bug reports
- Feature requests
- Documentation improvements

Use the appropriate issue template.

### 2. Branch Naming

Follow conventional branch naming:

```
type/short-description

Examples:
feat/gemini-embedding-provider
fix/sqlite-connection-leak
docs/api-reference-pt
test/memory-integration-tests
refactor/channel-interface
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 3. Development

```bash
# Create feature branch
git checkout -b feat/my-feature

# Make changes following coding standards
# ... code ...

# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Format code
pnpm format
```

### 4. Commit

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

Examples:

```
feat(providers): add Gemini embedding provider

Implement Gemini embedding-2 API integration with batch support.
Includes rate limiting and error handling.

Closes #123
```

```
fix(memory): resolve SQLite connection leak

Ensure connections are properly closed on shutdown.
Adds connection pooling with max 10 connections.

Fixes #456
```

### 5. Pull Request

- Fill out the PR template completely
- Ensure CI checks pass
- Request review from at least 2 maintainers
- Respond to review feedback promptly

## 🎨 Coding Standards

### TypeScript

```typescript
// ✅ GOOD: Explicit return types, readonly, strict types
interface IUser {
  readonly id: UUID;
  readonly name: string;
}

export function getUser(id: UUID): Result<IUser, UserError> {
  // implementation
}

// ❌ BAD: Implicit types, mutable when possible
interface BadUser {
  id: string;
  name: any;
}

export function badGetUser(id) {
  // implementation
}
```

### Naming Conventions

| Element          | Convention                    | Example                                 |
| ---------------- | ----------------------------- | --------------------------------------- |
| Interfaces       | PascalCase with 'I' prefix    | `IProvider`, `IChannel`                 |
| Abstract Classes | PascalCase with 'Base' suffix | `BaseProvider`, `BaseChannel`           |
| Concrete Classes | PascalCase, descriptive       | `OpenAIProvider`, `TelegramChannel`     |
| Types            | PascalCase                    | `AgentConfig`, `ToolResult`             |
| Enums            | PascalCase, singular          | `AutonomyLevel`, `ChannelId`            |
| Constants        | UPPER_SNAKE_CASE              | `DEFAULT_PROVIDER`, `MAX_RETRIES`       |
| Functions        | camelCase, verb-first         | `initializeRuntime`, `executeTool`      |
| Files            | kebab-case.ts                 | `agent-context.ts`, `memory-backend.ts` |

### Documentation

````typescript
/**
 * Brief description of the function.
 *
 * Detailed explanation if needed. Can include:
 * - Usage examples
 * - Parameter details
 * - Return value description
 * - Edge cases
 *
 * @param id - Unique identifier for the user
 * @param options - Configuration options
 * @returns The user object if found, null otherwise
 * @throws {UserNotFoundError} When user doesn't exist
 *
 * @example
 * ```ts
 * const user = await getUser('123', { includeMetadata: true });
 * ```
 */
````

### Error Handling

```typescript
// ✅ GOOD: Custom errors with context
class InceptionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
  }
}

// Usage
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof InceptionError) {
    logger.error({ code: error.code }, error.message);
    throw error;
  }
  throw new ToolExecutionError('Unexpected failure', { original: error });
}
```

## 💬 Commit Message Convention

### Format

```
type(scope): subject

[body]

[footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or correcting tests
- `chore`: Build process or auxiliary tool changes

### Scopes

- `core`: Runtime engine
- `types`: Type definitions
- `providers/*`: LLM providers
- `channels/*`: Communication channels
- `memory`: Memory system
- `tools/*`: Tool implementations
- `security`: Security features
- `protocol`: IMP/IEP/ISP implementations
- `cli`: Command line interface
- `docs`: Documentation

### Examples

```
feat(providers/gemini): add embedding-2 support

Implement Google Gemini embedding-2 API with 768 dimensions.
Supports batch processing up to 100 texts per request.

Includes:
- Rate limiting (60 req/min)
- Retry logic with exponential backoff
- LRU cache for embeddings

Refs #234
```

```
fix(channels/telegram): handle webhook timeout

Increase timeout from 30s to 60s for large messages.
Add proper error logging for webhook failures.

Fixes #567
```

## 🔍 Pull Request Process

### Before Submitting

- [ ] All tests pass (`pnpm test`)
- [ ] Code is linted (`pnpm lint`)
- [ ] Types are checked (`pnpm typecheck`)
- [ ] Code is formatted (`pnpm format`)
- [ ] Documentation is updated
- [ ] CHANGELOG.md is updated (if applicable)

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Code follows style guidelines
- [ ] Self-review completed

## Related Issues

Fixes #(issue)
```

### Review Process

1. Automated checks must pass
2. At least 2 maintainer approvals required
3. All review comments resolved
4. Branch is up to date with main

## 🌍 Internationalization (i18n)

### Documentation

All documentation must be provided in at least 2 languages:

- **English** (primary)
- **Portuguese** (source, as Rabelus Lab is Brazilian)

Additional welcome:

- Spanish
- Chinese (Simplified)

Structure:

```
docs/
├── en/
│   ├── getting-started.md
│   └── ...
├── pt/
│   ├── getting-started.md
│   └── ...
└── es/
    ├── getting-started.md
    └── ...
```

### Code Comments

Use English for all code comments and documentation strings.

### Error Messages

Error messages should support i18n:

```typescript
const errors = {
  en: {
    FILE_NOT_FOUND: 'File not found: {path}',
  },
  pt: {
    FILE_NOT_FOUND: 'Arquivo não encontrado: {path}',
  },
};
```

## 🔒 Security

### Reporting Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead, email: security@rabeluslab.dev

Include:

- Description of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Best Practices

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all inputs
- Sanitize file paths
- Use parameterized queries
- Implement rate limiting

## 📞 Getting Help

- **Discord**: [Join our community](https://discord.gg/inception)
- **GitHub Discussions**: [Ask questions](https://github.com/rabeluslab/inception/discussions)
- **Email**: team@rabeluslab.dev

## 🙏 Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Added to our hall of fame

Thank you for making Inception Framework better!

---

_Last updated: 2026-03-12_
