# zai-cli Examples

This directory contains usage examples for the zai-cli tool.

## Available Examples

### [basic-usage.sh](./basic-usage.sh)

Demonstrates core zai-cli functionality:

- Web search with result limiting
- Web page reading and parsing
- GitHub repository exploration
- MCP tools discovery
- Tool details inspection
- Doctor health check
- JSON output mode
- Custom timeout configuration

**Usage:**

```bash
# Set your API key
export Z_AI_API_KEY="your-api-key-here"

# Make the script executable
chmod +x examples/basic-usage.sh

# Run the examples
./examples/basic-usage.sh
```

## Creating Your Own Examples

When adding new examples:

1. **Name descriptively:** Use kebab-case filenames that describe the example
2. **Add comments:** Explain what each command does
3. **Check for API key:** Always verify `Z_AI_API_KEY` is set
4. **Handle errors:** Use `set -e` for bash scripts to exit on errors
5. **Document here:** Add a brief description to this README

## Example Templates

### Bash Script Template

```bash
#!/bin/bash
# Example: Your example title
# Description: What this example demonstrates

set -e  # Exit on error

# Check API key
if [ -z "$Z_AI_API_KEY" ]; then
  echo "Error: Z_AI_API_KEY not set"
  exit 1
fi

# Your example commands here
zai-cli search "example query"
```

### TypeScript Example (for code mode)

```typescript
// example.ts - Example TypeScript chain for zai-cli code mode

// This example demonstrates...
const searchResults = await search("TypeScript patterns", { count: 5 });
console.log(`Found ${searchResults.length} results`);

// Process results...
```

## Need Help?

- See [README.md](../README.md) for full command reference
- See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guide
- Run `zai-cli --help` for command help
- Run `zai-cli <command> --help` for command-specific options
