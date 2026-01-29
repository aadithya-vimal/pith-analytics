// src/config/constants.ts

/**
 * Application constants
 * Centralized configuration for limits, timeouts, and other constants
 */

export const CONSTANTS = {
    // File upload limits
    files: {
        maxSizeMB: 500, // Maximum file size in MB
        supportedFormats: ['.csv', '.json', '.parquet'],
    },

    // Database settings
    database: {
        defaultQueryLimit: 1000,
        maxQueryTimeout: 30000, // 30 seconds
    },

    // AI settings
    ai: {
        modelName: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
        maxTokens: 2048,
        temperature: 0.7,
        initTimeout: 60000, // 60 seconds
    },

    // Visualization settings
    visualization: {
        defaultChartHeight: 400,
        defaultChartWidth: 600,
        maxDataPoints: 10000,
    },

    // UI settings
    ui: {
        toastDuration: 3000, // 3 seconds
        debounceDelay: 300, // 300ms
    },
} as const;

export type Constants = typeof CONSTANTS;
