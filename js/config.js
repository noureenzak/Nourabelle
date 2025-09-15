'use strict';

// =================================================================================
// SHARED CONFIGURATION & UTILITIES
// This file should be loaded FIRST on every page that needs database access.
// =================================================================================

// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = 'https://ebiwoiaduskjodegnhvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaXdvaWFkdXNram9kZWduaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQ5OTEsImV4cCI6MjA3MjE3MDk5MX0.tuWREO0QuDKfgJQ6fbVpi4UI9ckKUYlqoCy3g2_cJW8';

let supabase = null;
try {
  // The Supabase client is attached to the global 'window' object
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Supabase client initialized successfully from config.js');
} catch (error) {
  console.error('Supabase initialization failed in config.js:', error);
}


// 2. SHARED UTILITY FUNCTION: Parse PostgreSQL Array
/**
 * Parses a PostgreSQL array string (e.g., '{"item1","item2"}') into a JavaScript array.
 * This handles the exact format from your Supabase database.
 * @param {string|string[]} pgArray The string from PostgreSQL or an already parsed array.
 * @returns {string[]} A JavaScript array of strings.
 */
function parsePostgreSQLArray(pgArray) {
    if (!pgArray) return [];
    if (Array.isArray(pgArray)) return pgArray; // It's already a JS array

    if (typeof pgArray === 'string') {
        // This handles formats like {"url1","url2"} or {"feat1","feat2"}
        if (pgArray.startsWith('{') && pgArray.endsWith('}')) {
             return pgArray
                .slice(1, -1) // Remove the outer {}
                .split(',')
                .map(item => item.replace(/"/g, '').trim()) // Remove quotes and trim whitespace
                .filter(item => item); // Filter out any empty strings
        }
        // This handles JSON array format like ["url1", "url2"]
        try {
            const parsed = JSON.parse(pgArray);
            if(Array.isArray(parsed)) return parsed;
        } catch(e) {
            // It's just a single string, return it in an array
            return [pgArray];
        }
    }
    return []; // Return empty array for unknown types
}

console.log('config.js loaded.');