/**
 * MCP Client module for zai-cli
 * Handles communication with Z.AI MCP servers
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { Config } from './config.js';
import { McpServerType } from '../types/index.js';
import type { McpTool, McpToolResult } from '../types/index.js';

/**
 * Timeout for MCP server connections (ms)
 * Prevents indefinite hangs when MCP server fails to start
 */
const MCP_CONNECTION_TIMEOUT = 30000; // 30 seconds

/**
 * Timeout for MCP tool calls (ms)
 */
const MCP_TOOL_TIMEOUT = 120000; // 2 minutes

/**
 * Wrap a promise with a timeout
 * @param promise - Promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param operation - Description of operation for error message
 * @returns Promise that rejects if timeout expires
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation '${operation}' timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * MCP Server configuration
 */
interface McpServerConfig {
  command: string;
  args: string[];
  env: Record<string, string>;
}

/**
 * Get the server config for a given server type
 * @param serverType - Type of MCP server to connect to
 * @param apiKey - Z.AI API key for authentication
 * @returns Server configuration with command, args, and environment
 * @throws Error if server type is HTTP-based (not stdio)
 */
function getServerConfig(serverType: McpServerType, apiKey: string): McpServerConfig {
  const baseEnv = {
    Z_AI_API_KEY: apiKey,
    Z_AI_MODE: 'ZAI',
  };

  switch (serverType) {
    case McpServerType.Vision:
    case McpServerType.Zread:
      // Both Vision and ZRead are available through the MCP server
      return {
        command: 'npx',
        args: ['-y', '@z_ai/mcp-server'],
        env: baseEnv,
      };
    case McpServerType.Search:
      // HTTP-based - handled differently
      throw new Error('Search is HTTP-based, not stdio');
    case McpServerType.Read:
      // HTTP-based - handled differently
      throw new Error('Read is HTTP-based, not stdio');
    default:
      throw new Error(`Unknown server type: ${serverType}`);
  }
}

/**
 * MCP Client wrapper class
 * Manages connection and communication with MCP servers via stdio
 */
export class McpClientWrapper {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private connected = false;

  /**
   * Connect to an MCP server via stdio
   * @param serverType - Type of MCP server to connect to
   * @param apiKey - Z.AI API key for authentication
   * @throws Error if server type is HTTP-based (not stdio)
   * @throws Error if connection times out
   */
  async connect(serverType: McpServerType, apiKey: string): Promise<void> {
    const config = getServerConfig(serverType, apiKey);

    this.client = new Client(
      {
        name: 'zai-cli',
        version: '0.1.0',
      },
      {
        capabilities: {},
      }
    );

    this.transport = new StdioClientTransport({
      command: config.command,
      args: config.args,
      env: config.env,
    });

    // Wrap connection with timeout to prevent indefinite hangs
    await withTimeout(
      this.client.connect(this.transport),
      MCP_CONNECTION_TIMEOUT,
      `MCP server connection (${serverType})`
    );

    this.connected = true;
  }

  /**
   * Check if currently connected to an MCP server
   * @returns true if connected, false otherwise
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * List available tools from the connected server
   * @returns Array of available tool descriptors
   * @throws Error if not connected to MCP server
   * @throws Error if operation times out
   */
  async listTools(): Promise<McpTool[]> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to MCP server');
    }

    const response = await withTimeout(
      this.client.listTools(),
      MCP_TOOL_TIMEOUT,
      'list tools'
    );

    return response.tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    }));
  }

  /**
   * Call a tool on the connected server
   * @param name - Name of the tool to call
   * @param args - Arguments to pass to the tool
   * @returns Tool call result with content and error status
   * @throws Error if not connected to MCP server
   * @throws Error if operation times out
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<McpToolResult> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to MCP server');
    }

    const response = await withTimeout(
      this.client.callTool({
        name,
        arguments: args,
      }),
      MCP_TOOL_TIMEOUT,
      `tool call: ${name}`
    );

    return {
      content: response.content,
      isError: response.isError as boolean | undefined,
    };
  }

  /**
   * Disconnect from the MCP server and clean up resources
   */
  async disconnect(): Promise<void> {
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
    this.client = null;
    this.connected = false;
  }
}

/**
 * Connect to an MCP server and return a client wrapper
 * @param serverType - Type of MCP server to connect to
 * @param apiKey - Z.AI API key for authentication
 * @returns Connected client wrapper ready for tool calls
 */
export async function connectToServer(
  serverType: McpServerType,
  apiKey: string
): Promise<McpClientWrapper> {
  const wrapper = new McpClientWrapper();
  await wrapper.connect(serverType, apiKey);
  return wrapper;
}

/**
 * HTTP-based MCP tool calls (for search/read/zread)
 */
interface HttpCallOptions {
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

/**
 * Make an HTTP request to an HTTP-based MCP server
 * Handles both plain JSON and Server-Sent Events (SSE) responses
 * NOTE: This is currently unused since we're using the main Z.AI API endpoints
 */
export async function callHttpTool(options: HttpCallOptions): Promise<unknown> {
  const bodyStr = options.body ? JSON.stringify(options.body) : undefined;

  const response = await fetch(options.url, {
    method: options.body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      ...options.headers,
    },
    body: bodyStr,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const text = await response.text();

  // Handle Server-Sent Events (SSE) format
  if (text.includes('event:') || text.includes('data:')) {
    // Parse SSE to extract the data field
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.startsWith('data:')) {
        const data = line.slice(5).trim();
        try {
          const json = JSON.parse(data);
          // JSON-RPC 2.0 responses have a 'result' field
          if (json && typeof json === 'object' && 'result' in json) {
            return json.result;
          }
          return json;
        } catch {
          // Not JSON, return as-is
          return data;
        }
      }
    }
    throw new Error('No data found in SSE response');
  }

  // Handle plain JSON response
  try {
    const json = JSON.parse(text);
    if (json && typeof json === 'object' && 'result' in json) {
      return json.result;
    }
    return json;
  } catch {
    return text;
  }
}

/**
 * Call web search via Z.AI API
 */
export async function callWebSearch(
  apiKey: string,
  query: string,
  options?: { count?: number; language?: string; timeRange?: string }
): Promise<unknown> {
  const url = new URL('https://api.z.ai/api/paas/v4/web_search');
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  // Map CLI options to API parameters
  const body = {
    search_engine: 'search-prime',
    search_query: query,
    count: options?.count ?? 10,
    // Map timeRange to search_recency_filter
    ...(options?.timeRange && { search_recency_filter: options.timeRange }),
  };

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText })) as { error?: { message?: string }; message?: string };
    throw new Error(`HTTP ${response.status}: ${error.error?.message || error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Call web reader via Z.AI API
 */
export async function callWebReader(
  apiKey: string,
  url: string,
  options?: { withImagesSummary?: boolean; noGfm?: boolean; retainImages?: boolean }
): Promise<unknown> {
  const apiUrl = new URL('https://api.z.ai/api/paas/v4/reader');
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  // Map CLI options to API parameters
  const body = {
    url,
    timeout: 30,
    return_format: 'markdown',
    retain_images: options?.retainImages ?? true,
    no_gfm: options?.noGfm ?? false,
    keep_img_data_url: options?.retainImages ?? false,
    with_images_summary: options?.withImagesSummary ?? false,
  };

  const response = await fetch(apiUrl.toString(), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText })) as { error?: { message?: string }; message?: string };
    throw new Error(`HTTP ${response.status}: ${error.error?.message || error.message || response.statusText}`);
  }

  return response.json();
}

/**
 * Call ZRead (GitHub repo search) via MCP server
 * Connects to the MCP server and calls the appropriate ZRead tool
 * @param apiKey - Z.AI API key for authentication
 * @param method - Either 'search_doc' or 'get_repo_structure'
 * @param args - Method-specific arguments
 * @returns Tool call result from ZRead
 */
export async function callZRead(
  apiKey: string,
  method: 'search_doc' | 'get_repo_structure',
  args: Record<string, unknown>
): Promise<unknown> {
  const client = await connectToServer(McpServerType.Zread, apiKey);

  const toolName = method === 'search_doc' ? 'zai.zread.search_doc' : 'zai.zread.get_repo_structure';

  const result = await client.callTool(toolName, args);

  await client.disconnect();

  if (result.isError) {
    throw new Error(`ZRead ${method} failed: ${JSON.stringify(result.content)}`);
  }

  return result.content;
}

/**
 * Retry logic for transient failures with exponential backoff
 * @param fn - Async function to retry
 * @param retryCount - Number of retries before failing (0 = no retry)
 * @returns Result of successful function call
 * @throws Last error if all retries are exhausted
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retryCount: number
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < retryCount) {
        // Exponential backoff
        const delay = Math.min(100 * Math.pow(2, attempt), 2000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
