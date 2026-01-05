/**
 * Structured logging module for zai-cli
 * Provides leveled logging with structured JSON output for debugging
 */

import type { OutputOptions } from '../types/index.js';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Structured log entry
 */
interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  context?: string;
  requestId?: string;
  data?: unknown;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

/**
 * Generate a unique request ID for tracing
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Format error for logging
 */
function formatError(error: unknown): LogEntry['error'] {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error as any).code && { code: (error as any).code },
    };
  }
  return {
    name: 'UnknownError',
    message: String(error),
  };
}

/**
 * Logger class for structured logging
 */
export class Logger {
  private requestId: string;
  private context?: string;

  constructor(requestId?: string, context?: string) {
    this.requestId = requestId || generateRequestId();
    this.context = context;
  }

  /**
   * Create a child logger with additional context
   */
  withContext(context: string): Logger {
    return new Logger(this.requestId, context);
  }

  /**
   * Create a child logger with a different request ID
   */
  withRequestId(requestId: string): Logger {
    return new Logger(requestId, this.context);
  }

  /**
   * Log a debug message
   */
  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log an info message
   */
  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: unknown, data?: unknown): void {
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      timestamp: new Date().toISOString(),
      message,
      context: this.context,
      requestId: this.requestId,
      data,
    };

    if (error) {
      entry.error = formatError(error);
    }

    this.write(entry);
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry: LogEntry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      context: this.context,
      requestId: this.requestId,
      data,
    };

    this.write(entry);
  }

  /**
   * Write log entry to stderr
   */
  private write(entry: LogEntry): void {
    // Always use stderr for logs to avoid interfering with stdout data
    process.stderr.write(JSON.stringify(entry) + '\n');
  }

  /**
   * Get the current request ID
   */
  getRequestId(): string {
    return this.requestId;
  }
}

/**
 * Create a logger instance
 */
export function createLogger(context?: string, requestId?: string): Logger {
  return new Logger(requestId, context);
}

/**
 * Check if logging should be enabled based on output options
 */
export function shouldLog(options: OutputOptions, level: LogLevel): boolean {
  // Debug messages only in debug mode
  if (level === LogLevel.DEBUG) {
    return options.debug === true;
  }

  // Info messages in verbose or debug mode
  if (level === LogLevel.INFO) {
    return options.verbose === true || options.debug === true;
  }

  // Warn and error always show
  return true;
}

/**
 * Simplified logging functions that respect output options
 * These use the existing diagnostic/debug output from output.ts
 */
export function logDiagnostic(message: string, options: OutputOptions, data?: unknown): void {
  if (options.verbose || options.debug) {
    const entry: LogEntry = {
      level: LogLevel.INFO,
      timestamp: new Date().toISOString(),
      message,
      data,
    };
    process.stderr.write(JSON.stringify(entry) + '\n');
  }
}

export function logDebug(message: string, options: OutputOptions, data?: unknown): void {
  if (options.debug) {
    const entry: LogEntry = {
      level: LogLevel.DEBUG,
      timestamp: new Date().toISOString(),
      message,
      data,
    };
    process.stderr.write(JSON.stringify(entry) + '\n');
  }
}

export function logWarn(message: string, data?: unknown): void {
  const entry: LogEntry = {
    level: LogLevel.WARN,
    timestamp: new Date().toISOString(),
    message,
    data,
  };
  process.stderr.write(JSON.stringify(entry) + '\n');
}

export function logError(message: string, error?: unknown, data?: unknown): void {
  const entry: LogEntry = {
    level: LogLevel.ERROR,
    timestamp: new Date().toISOString(),
    message,
    data,
  };

  if (error) {
    entry.error = formatError(error);
  }

  process.stderr.write(JSON.stringify(entry) + '\n');
}
