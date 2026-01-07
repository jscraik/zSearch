# Contributing to @brainwav/zsearch

Thank you for your interest in contributing! This document provides guidelines for contributing to the zsearch project (Z.AI CLI and MCP server).

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Development Setup

### Prerequisites

- **Node.js:** >=22.0.0
- **npm:** Comes with Node.js
- **git:** For version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/zSearch.git
cd zSearch
```

3. Add the original repository as upstream:

```bash
git remote add upstream https://github.com/jscraik/zSearch.git
```

### Install Dependencies

```bash
npm install
```

### Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Development Mode

Run the CLI directly from source using tsx for faster iteration:

```bash
# Run vision command
npm run dev -- vision analyze test.png "What do you see?"

# Run search command
npm run dev -- search "TypeScript best practices"

# Run doctor command
npm run dev -- doctor
```

## Project Structure

```
zSearch/
├── bin/              # Executable entry point
├── src/
│   ├── commands/     # CLI command implementations
│   ├── lib/          # Shared utilities (config, output, cache, MCP client/server)
│   ├── types/        # TypeScript type definitions
│   ├── cli.ts        # Main CLI entry point
│   └── index.ts      # Package entry point (public API)
├── schemas/          # JSON output schemas
├── examples/         # Usage examples
├── dist/             # Compiled JavaScript (generated)
├── brand/            # Brand assets (logo, guidelines)
└── package.json      # Project metadata
```

### Command Structure

Each command in `src/commands/` follows this pattern:

```typescript
import { Command } from 'commander';
import { loadConfig } from '../lib/config.js';
import { output } from '../lib/output.js';

export function myCommand(): Command {
  const cmd = new Command('my-command')
    .description('Command description')
    .argument('<input>', 'Input argument')
    .option('--option <value>', 'Option description')
    .action(async (input, options) => {
      // Load config
      const config = await loadConfig();

      // Command logic
      const result = await doSomething(input, options);

      // Output result
      output(result, 'my-command', getSchemaForCommand('my-command'), outputOptions);
    });

  return cmd;
}
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:ci
```

### Watch Mode

```bash
npm test -- --watch
```

## Code Style

### TypeScript Guidelines

- **One concept per file:** Keep files focused and under 300 LOC
- **Functions under 30 LOC:** Split complex functions into smaller helpers
- **JSDoc comments:** Document all public exports with `@param`, `@returns`, `@throws`

```typescript
/**
 * Load configuration from environment and config files
 * @returns Merged configuration object
 * @throws {Error} If config file is invalid JSON
 */
export async function loadConfig(): Promise<Config> {
  // implementation
}
```

### Type Definitions

- Use interfaces for public API contracts
- Document all type definitions with JSDoc comments
- Export types from `src/types/index.ts`

```typescript
/**
 * Configuration loaded from environment and config files
 */
export interface Config {
  apiKey?: string;
  mode: string;
  timeout: number;
  // ...
}
```

### Error Handling

- Use defined error codes from `ErrorCode` enum
- Provide helpful error messages with hints
- Exit with appropriate exit codes

```typescript
if (!config.apiKey) {
  output(
    null,
    'command',
    schema,
    outputOptions,
    [{
      code: ErrorCode.E_AUTH,
      message: 'Z_AI_API_KEY is required',
      hint: 'Set it with: export Z_AI_API_KEY="your-key"'
    }]
  );
  process.exit(ExitCode.AuthFailure);
}
```

## Linting

### Check Code Style

```bash
npm run lint
```

### Auto-fix Issues

```bash
npm run lint -- --fix
```

## Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **style:** Code style changes (formatting, etc.)
- **refactor:** Code refactoring
- **test:** Adding or updating tests
- **chore:** Build process or auxiliary tool changes

### Examples

```
feat(vision): add video analysis support

Implement video analysis command using Z.AI vision API.
Accepts mp4, mov, and avi formats up to 100MB.

Closes #123
```

```
fix(config): handle missing XDG_CONFIG_HOME gracefully

Previously assumed XDG_CONFIG_HOME was always set.
Now falls back to ~/.config/zsearch on Linux.
```

```
docs(readme): add troubleshooting section

Added common issues and solutions for API key,
Node.js version, and timeout errors.
```

## Pull Request Process

### Before Submitting

1. **Update tests** - Add tests for new functionality
2. **Update docs** - Update README if user-facing changes
3. **Run linting** - Ensure code passes lint checks
4. **Run tests** - All tests must pass

### Submitting a PR

1. Create a feature branch from `main`:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

2. Make your changes and commit

3. Push to your fork:

```bash
git push origin feature/your-feature-name
```

4. Open a Pull Request on GitHub

### PR Checklist

- [ ] Tests pass locally
- [ ] Linting passes
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow conventional format
- [ ] PR description describes the change clearly

### PR Review Process

1. Automated checks must pass (CI)
2. Code review by maintainers
3. Address review feedback
4. Once approved, maintainers will merge

## Release Process

Maintainers follow this process for releases:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes: `chore(release): bump version to X.Y.Z`
4. Create git tag: `git tag vX.Y.Z`
5. Push tag: `git push upstream vX.Y.Z`
6. Publish to npm: `npm publish`

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR:** Breaking changes
- **MINOR:** New features (backwards compatible)
- **PATCH:** Bug fixes (backwards compatible)

## Questions?

- Open an issue for bugs or feature requests
- Start a discussion for questions or ideas
- Check existing issues and discussions first

---

Thank you for contributing to zsearch!
