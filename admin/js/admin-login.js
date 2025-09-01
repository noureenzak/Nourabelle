// admin-login.js - Clean Login Script

'use strict';

// Supabase Configuration
const SUPABASE_URL = 'https://ebiwoiaduskjodegnhvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaXdvaWFkdXNram9kZWduaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQ5OTEsImV4cCI6MjA3MjE3MDk5MX0.tuWREO0QuDKfgJQ6fbVpi4UI9ckKUYlqoCy3g2_cJW8';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
let loginForm, emailInput, passwordInput, loginBtn, btnText, loadingSpinner, messageEl, togglePasswordBtn;

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page initializing...');
    
    // Clear any existing auth tokens
    localStorage.clear();
    
    // Get DOM elements
    loginForm = document.getElementById('loginForm');
    emailInput = document.getElementById('email');
    passwordInput = document.getElementById('password');
    loginBtn = document.getElementById('loginBtn');
    btnText = document.getElementById('btnText');
    loadingSpinner = document.getElementById('loadingSpinner');
    messageEl = document.getElementById('message');
    togglePasswordBtn = document.getElementById('togglePassword');
    
    // Setup event listeners
    loginForm.addEventListener('submit', handleLogin);
    togglePasswordBtn.addEventListener('click', togglePassword);
    
    // Clear messages on input
    emailInput.addEventListener('input', clearMessage);
    passwordInput.addEventListener('input', clearMessage);
    
    console.log('Login page ready');
});

// Handle form submission
async function handleLogin(event) {
    event.preventDefault();
    
    console.log('Login attempt started');
    
    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    
    // Basic validation
    if (!email) {
        showMessage('Please enter your email address', 'error');
        return;
    }
    
    if (!password) {
        showMessage('Please enter your password', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        showMessage('Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    clearMessage();
    
    try {
        console.log('Authenticating with Supabase...');
        
        // Attempt login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) {
            console.error('Authentication error:', error);
            throw error;
        }
        
        if (!data.user || !data.session) {
            throw new Error('No user or session returned from authentication');
        }
        
        console.log('Authentication successful');
        
        // Try to get admin user data (optional)
        let adminData = null;
        try {
            const { data: admin } = await supabase
                .from('admin_users')
                .select('*')
                .eq('email', email)
                .eq('is_active', true)
                .single();
            
            adminData = admin;
        } catch (adminError) {
            console.log('No admin record found, proceeding with basic user');
        }
        
        // Store authentication data
        const userData = {
            id: data.user.id,
            email: data.user.email,
            name: adminData?.name || data.user.email.split('@')[0]
        };
        
        localStorage.setItem('nourabelle_admin_token', data.session.access_token);
        localStorage.setItem('nourabelle_admin_user', JSON.stringify(userData));
        
        // Show success message
        showMessage('Login successful! Redirecting...', 'success');
        
        // Redirect to admin dashboard
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login failed:', error);
        setLoadingState(false);
        
        // Show appropriate error message
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password.';
        } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please confirm your email address.';
        } else if (error.message.includes('Too many requests')) {
            errorMessage = 'Too many attempts. Please wait and try again.';
        }
        
        showMessage(errorMessage, 'error');
    }
}

// Toggle password visibility
function togglePassword() {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
}

// Set loading state
function setLoadingState(loading) {
    loginBtn.disabled = loading;
    
    if (loading) {
        loadingSpinner.classList.add('show');
        btnText.textContent = 'Signing In...';
    } else {
        loadingSpinner.classList.remove('show');
        btnText.textContent = 'Sign In';
    }
}

// Show message
function showMessage(text, type = 'error') {
    messageEl.textContent = text;
    messageEl.className = `message ${type} show`;
}

// Clear message
function clearMessage() {
    messageEl.classList.remove('show');
}

console.log('Admin login script loaded');