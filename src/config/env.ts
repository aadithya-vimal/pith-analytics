// src/config/env.ts

/**
 * Environment configuration
 * Centralized environment detection and configuration
 */

export const ENV = {
    // Environment detection
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    mode: import.meta.env.MODE,

    // Build info
    buildTime: new Date().toISOString(),
    version: '1.0.0',

    // Feature flags
    features: {
        enableAI: true,
        enableVisualization: true,
        enableSQLConsole: true,
    },

    // Performance settings
    performance: {
        enableLogging: import.meta.env.DEV,
        enablePerformanceMonitoring: import.meta.env.PROD,
    },
} as const;

export type Environment = typeof ENV;
