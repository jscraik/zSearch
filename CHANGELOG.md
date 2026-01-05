# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive README with Prerequisites and Troubleshooting sections
- Contributing guidelines for developers
- API key acquisition documentation
- Examples directory structure

### Changed
- Moved Requirements section to Prerequisites (before Quick Start)
- Enhanced README with detailed troubleshooting guide

## [0.1.0] - 2025-01-05

### Added
- Initial release of zai-cli
- **Vision commands:**
  - `vision analyze` - General image analysis
  - `vision ocr` - Text extraction from images
  - `vision ui-diff` - UI screenshot comparison
  - `vision video` - Video content analysis
- **Search command** with domain filtering and result count control
- **Read command** for fetching and parsing web pages to markdown
- **Repo commands:**
  - `repo tree` - GitHub repository file tree exploration
  - `repo search` - Search code within repositories
- **MCP tool commands:**
  - `tools` - List available MCP tools
  - `tool` - Show details for a specific tool
  - `call` - Call MCP tools with arguments
- **Code mode** for TypeScript chain execution
- **Doctor command** for health checks and diagnostics
- JSON output mode with schema validation
- Configurable timeout, caching, and retry behavior
- Environment variable configuration
- Multiple output modes (default, json, plain, quiet, verbose, debug)
- Stable exit codes for programmatic use

### Documentation
- README with installation, quick start, and command reference
- Environment variables reference
- Output modes documentation
- Exit codes reference
- MIT License

[Unreleased]: https://github.com/jscraik/zai-cli/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/jscraik/zai-cli/releases/tag/v0.1.0
