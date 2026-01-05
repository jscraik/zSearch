#!/bin/bash
# Basic zai-cli Usage Examples
#
# This script demonstrates common usage patterns for zai-cli.
# Make sure to set your Z_AI_API_KEY environment variable before running.
#
# Setup:
#   export Z_AI_API_KEY="your-api-key-here"
#   chmod +x examples/basic-usage.sh
#   ./examples/basic-usage.sh

set -e  # Exit on error

echo "=== Z.AI CLI - Basic Usage Examples ==="
echo ""

# Check if API key is set
if [ -z "$Z_AI_API_KEY" ]; then
  echo "❌ Error: Z_AI_API_KEY environment variable is not set."
  echo "   Set it with: export Z_AI_API_KEY=\"your-api-key-here\""
  exit 1
fi

echo "✅ API key is configured"
echo ""

# =============================================
# 1. Web Search
# =============================================
echo "1. Web Search"
echo "   Searching for 'TypeScript best practices'..."
zai-cli search "TypeScript best practices" --count 3
echo ""

# =============================================
# 2. Web Reader
# =============================================
echo "2. Web Reader"
echo "   Reading https://example.com..."
zai-cli read https://example.com
echo ""

# =============================================
# 3. GitHub Repo Exploration
# =============================================
echo "3. GitHub Repo Tree"
echo "   Exploring facebook/react structure (depth 2)..."
zai-cli repo tree facebook/react --depth 2
echo ""

# =============================================
# 4. MCP Tools Discovery
# =============================================
echo "4. MCP Tools Discovery"
echo "   Listing available vision tools..."
zai-cli tools --filter vision
echo ""

# =============================================
# 5. Tool Details
# =============================================
echo "5. Tool Details"
echo "   Getting details for web_search_prime tool..."
zai-cli tool web_search_prime
echo ""

# =============================================
# 6. Doctor Health Check
# =============================================
echo "6. Doctor Health Check"
echo "   Running diagnostics..."
zai-cli doctor
echo ""

# =============================================
# 7. JSON Output Mode
# =============================================
echo "7. JSON Output Mode"
echo "   Search with JSON wrapper..."
zai-cli search "cli tools" --count 1 --json
echo ""

# =============================================
# 8. Custom Timeout
# =============================================
echo "8. Custom Timeout"
echo "   Search with 60 second timeout..."
zai-cli --timeout 60000 search "async programming"
echo ""

echo "=== Examples Complete ==="
echo ""
echo "For more information, see:"
echo "  - README.md: Full command reference"
echo "  - CONTRIBUTING.md: Development guide"
echo "  - Run 'zai-cli --help' for command help"
echo "  - Run 'zai-cli <command> --help' for command-specific help"
