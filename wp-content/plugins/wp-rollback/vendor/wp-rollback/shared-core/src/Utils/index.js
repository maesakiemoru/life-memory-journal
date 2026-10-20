/**
 * Utility Functions
 *
 * This file exports utility functions shared between the free and pro plugins.
 */

// General utility functions
export const formatVersion = version => {
    // Simple version formatter example
    return version ? `v${ version }` : '';
};

// API utility functions will be exported here
export const Utils = {
    formatVersion,
    // More utility functions will be defined here
};
