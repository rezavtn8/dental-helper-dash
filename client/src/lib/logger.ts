import { config } from '@/config/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private shouldLog(level: LogLevel): boolean {
    if (config.app.isDevelopment) return true;
    return level >= LogLevel.WARN;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    let message = `[${timestamp}] ${levelName}: ${entry.message}`;
    
    if (entry.context) {
      message += ` | Context: ${JSON.stringify(entry.context)}`;
    }
    
    if (entry.error) {
      message += ` | Error: ${entry.error.message}`;
      if (entry.error.stack && config.app.isDevelopment) {
        message += `\nStack: ${entry.error.stack}`;
      }
    }
    
    return message;
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: LogLevel.DEBUG,
      message,
      timestamp: new Date(),
      context,
    };

    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(entry));
    }
  }

  info(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: LogLevel.INFO,
      message,
      timestamp: new Date(),
      context,
    };

    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(entry));
    }
  }

  warn(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: LogLevel.WARN,
      message,
      timestamp: new Date(),
      context,
    };

    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(entry));
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      timestamp: new Date(),
      context,
      error,
    };

    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(entry));
    }

    // In production, you might want to send errors to a service like Sentry
    if (config.features.enableErrorReporting && config.app.isProduction) {
      this.reportError(entry);
    }
  }

  private reportError(entry: LogEntry) {
    // Placeholder for error reporting service integration
    // e.g., Sentry, LogRocket, etc.
    console.log('Would report error to service:', entry);
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return this.logs.map(entry => this.formatMessage(entry)).join('\n');
  }
}

export const logger = new Logger();
export default logger;
