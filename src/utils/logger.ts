// src/utils/logger.ts

/**
 * Production-ready logging utility
 * Provides conditional logging based on environment
 */

const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const LogLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

interface LogContext {
    component?: string;
    action?: string;
    metadata?: Record<string, any>;
}

class Logger {
    private shouldLog(level: LogLevel): boolean {
        // In production, only log warnings and errors
        if (isProduction) {
            return level === LogLevel.WARN || level === LogLevel.ERROR;
        }
        // In development, log everything
        return true;
    }

    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const contextStr = context
            ? ` [${context.component || 'App'}${context.action ? `::${context.action}` : ''}]`
            : '';
        return `[${timestamp}] ${level}${contextStr}: ${message}`;
    }

    debug(message: string, context?: LogContext): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.log(this.formatMessage(LogLevel.DEBUG, message, context), context?.metadata);
        }
    }

    info(message: string, context?: LogContext): void {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.formatMessage(LogLevel.INFO, message, context), context?.metadata);
        }
    }

    warn(message: string, context?: LogContext): void {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.formatMessage(LogLevel.WARN, message, context), context?.metadata);
        }
    }

    error(message: string, error?: Error | unknown, context?: LogContext): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const errorDetails = error instanceof Error
                ? { message: error.message, stack: error.stack }
                : error;
            console.error(
                this.formatMessage(LogLevel.ERROR, message, context),
                { error: errorDetails, ...context?.metadata }
            );
        }
    }

    /**
     * Performance timing utility
     */
    time(label: string): void {
        if (isDevelopment) {
            console.time(label);
        }
    }

    timeEnd(label: string): void {
        if (isDevelopment) {
            console.timeEnd(label);
        }
    }

    /**
     * Log performance metrics
     */
    perf(operation: string, durationMs: number, context?: LogContext): void {
        if (isDevelopment) {
            this.debug(`⚡ ${operation} completed in ${durationMs.toFixed(2)}ms`, context);
        }
    }

    /**
     * Log successful operations
     */
    success(message: string, context?: LogContext): void {
        if (isDevelopment) {
            console.log(`✅ ${message}`, context?.metadata);
        }
    }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
    debug: (msg: string, ctx?: LogContext) => logger.debug(msg, ctx),
    info: (msg: string, ctx?: LogContext) => logger.info(msg, ctx),
    warn: (msg: string, ctx?: LogContext) => logger.warn(msg, ctx),
    error: (msg: string, err?: Error | unknown, ctx?: LogContext) => logger.error(msg, err, ctx),
    success: (msg: string, ctx?: LogContext) => logger.success(msg, ctx),
    perf: (op: string, ms: number, ctx?: LogContext) => logger.perf(op, ms, ctx),
    time: (label: string) => logger.time(label),
    timeEnd: (label: string) => logger.timeEnd(label),
};
