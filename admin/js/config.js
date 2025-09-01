// config.js - Secure configuration for Nourabelle Admin
// This file should be loaded before other scripts and keys should come from server-side

'use strict';

// Configuration object - populate from server-side environment variables
window.SUPABASE_CONFIG = {
    url: '', // Set from server
    anonKey: '' // Set from server
};

// Function to initialize configuration from server
async function initializeConfig() {
    try {
        // In production, fetch config from your secure backend endpoint
        const response = await fetch('/api/config', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (response.ok) {
            const config = await response.json();
            window.SUPABASE_CONFIG = {
                url: config.supabaseUrl,
                anonKey: config.supabaseAnonKey
            };
        } else {
            throw new Error('Failed to load configuration');
        }
    } catch (error) {
        console.error('Configuration error:', error);
        
        // Fallback for development only - REMOVE IN PRODUCTION
        if (window.location.hostname === 'localhost') {
            window.SUPABASE_CONFIG = {
                url: 'https://ebiwoiaduskjodegnhvq.supabase.co',
                anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaXdvaWFkdXNram9kZWduaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQ5OTEsImV4cCI6MjA3MjE3MDk5MX0.tuWREO0QuDKfgJQ6fbVpi4UI9ckKUYlqoCy3g2_cJW8'
            };
            console.warn('Using development configuration - DO NOT USE IN PRODUCTION');
        }
    }
}

// Rate limiting for security
const rateLimiter = {
    attempts: new Map(),
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    
    isAllowed(identifier = 'global') {
        const now = Date.now();
        const attempts = this.attempts.get(identifier) || [];
        
        // Clean old attempts
        const recentAttempts = attempts.filter(time => now - time < this.windowMs);
        
        if (recentAttempts.length >= this.maxAttempts) {
            return false;
        }
        
        recentAttempts.push(now);
        this.attempts.set(identifier, recentAttempts);
        return true;
    },
    
    getRemainingTime(identifier = 'global') {
        const now = Date.now();
        const attempts = this.attempts.get(identifier) || [];
        const oldestAttempt = Math.min(...attempts);
        return Math.max(0, this.windowMs - (now - oldestAttempt));
    }
};

window.rateLimiter = rateLimiter;

// Initialize configuration when script loads
initializeConfig();

// Security headers check
function checkSecurityHeaders() {
    const requiredHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection'
    ];
    
    // This would typically be checked server-side
    console.log('Security headers should be implemented server-side');
}

// Content Security Policy helper
function applyCSP() {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://ebiwoiaduskjodegnhvq.supabase.co;";
    document.head.appendChild(meta);
}

// Apply security measures
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        checkSecurityHeaders();
        applyCSP();
    });
} else {
    checkSecurityHeaders();
    applyCSP();
}

console.log('Nourabelle configuration loaded');