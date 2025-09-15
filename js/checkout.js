// Complete Checkout System - checkout.js

'use strict';

// Supabase Configuration
const SUPABASE_URL = 'https://ebiwoiaduskjodegnhvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaXdvaWFkdXNram9kZWduaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQ5OTEsImV4cCI6MjA3MjE3MDk5MX0.tuWREO0QuDKfgJQ6fbVpi4UI9ckKUYlqoCy3g2_cJW8';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State management
let checkoutData = {};
let selectedPayment = 'cod';

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout page initializing...');
    loadCheckoutData();
    setupMobileMenu();
    updatePaymentSelection();
    updateCartCount();
});

// Load checkout data from localStorage
function loadCheckoutData() {
    const data = localStorage.getItem('nourabelle_checkout');
    if (!data) {
        showError('No checkout data found. Redirecting to cart...');
        setTimeout(() => window.location.href = 'cart.html', 2000);
        return;
    }

    try {
        checkoutData = JSON.parse(data);
        console.log('Checkout data loaded:', checkoutData);
        displayOrderSummary();
    } catch (e) {
        console.error('Error parsing checkout data:', e);
        showError('Invalid checkout data. Redirecting to cart...');
        setTimeout(() => window.location.href = 'cart.html', 2000);
    }
}

// Display order summary
function displayOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryShipping = document.getElementById('summaryShipping');
    const summaryTotal = document.getElementById('summaryTotal');

    if (!orderItems) {
        console.error('Order items container not found');
        return;
    }

    // Display items
    orderItems.innerHTML = checkoutData.items.map(item => `
        <div class="order-item">
            <img src="${item.image || '../assets/images/placeholder.jpg'}" alt="${item.name}" class="item-image" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSIzMCIgeT0iMzAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtc2l6ZT0iOCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'">
            <div class="item-details">
                <h4>${item.name || 'Product'}</h4>
                <p>Size: ${item.size || 'S-M'} | Qty: ${item.quantity || 1}</p>
            </div>
            <div class="item-price">${((item.price || 0) * (item.quantity || 1)).toFixed(2)} EGP</div>
        </div>
    `).join('');

    // Display totals
    if (summarySubtotal) summarySubtotal.textContent = `${(checkoutData.subtotal || 0).toFixed(2)} EGP`;
    if (summaryShipping) summaryShipping.textContent = `${(checkoutData.shipping || 0).toFixed(2)} EGP`;
    if (summaryTotal) summaryTotal.textContent = `${(checkoutData.total || 0).toFixed(2)} EGP`;
}

// Select payment method
function selectPayment(method) {
    selectedPayment = method;
    const radio = document.getElementById(method);
    if (radio) radio.checked = true;
    updatePaymentSelection();
}

// Update payment selection UI
function updatePaymentSelection() {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`input[name="payment"]:checked`)?.closest('.payment-option');
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
}

// Generate order number
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `NB${year}${month}${day}${random}`;
}

// Place order - MAIN FUNCTION
async function placeOrder() {
    console.log('=== PLACING ORDER ===');
    
    const form = document.getElementById('checkoutForm');
    if (!form?.checkValidity()) {
        form?.reportValidity();
        return;
    }

    const btn = document.getElementById('placeOrderBtn');
    if (!btn) {
        console.error('Place order button not found');
        return;
    }

    try {
        // Disable button and show loading
        btn.disabled = true;
        btn.textContent = 'Processing Order...';

        const formData = new FormData(form);
        const orderNumber = generateOrderNumber();
        
        // Prepare order data for database
        const orderData = {
            order_number: orderNumber,
            customer_name: `${formData.get('firstName')} ${formData.get('lastName')}`,
            customer_email: formData.get('email'),
            customer_phone: formData.get('phone'),
            shipping_address: formData.get('address'),
            shipping_city: formData.get('city'),
            postal_code: formData.get('postalCode'),
            payment_method: selectedPayment,
            order_notes: formData.get('orderNotes') || null,
            items: checkoutData.items,
            subtotal_amount: checkoutData.subtotal || 0,
            shipping_amount: checkoutData.shipping || 0,
            total_amount: checkoutData.total || 0,
            status: 'pending',
            created_at: new Date().toISOString()
        };

        console.log('Order data prepared:', orderData);

        // Insert order into Supabase
        const { data: insertedOrder, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            throw new Error(`Database error: ${error.message}`);
        }

        console.log('Order inserted successfully:', insertedOrder);

        // Send confirmation email (optional)
        try {
            await sendOrderConfirmationEmail(orderData);
        } catch (emailError) {
            console.warn('Email sending failed, but order was created:', emailError);
        }

        // Show success message
        showSuccessMessage(orderNumber);

        // Clear cart and checkout data
        localStorage.removeItem('nourabelle_cart');
        localStorage.removeItem('nourabelle_checkout');

        console.log('=== ORDER COMPLETED SUCCESSFULLY ===');

    } catch (error) {
        console.error('Error placing order:', error);
        showError(`Error placing order: ${error.message}`);
        
        // Re-enable button
        btn.disabled = false;
        btn.textContent = 'Place Order';
    }
}

// Send order confirmation email (using Supabase Edge Functions or external service)
async function sendOrderConfirmationEmail(orderData) {
    // Option 1: Use Supabase Edge Functions (recommended)
    try {
        const { data, error } = await supabase.functions.invoke('send-order-email', {
            body: {
                to: orderData.customer_email,
                orderNumber: orderData.order_number,
                customerName: orderData.customer_name,
                items: orderData.items,
                total: orderData.total_amount
            }
        });

        if (error) throw error;
        console.log('Confirmation email sent:', data);
    } catch (error) {
        console.warn('Email service not configured:', error);
        // Continue without email - don't fail the order
    }
}

// Show success message
function showSuccessMessage(orderNumber) {
    const checkoutContent = document.getElementById('checkoutContent');
    const successMessage = document.getElementById('successMessage');
    const orderNumberEl = document.getElementById('orderNumber');

    if (checkoutContent) checkoutContent.style.display = 'none';
    if (successMessage) successMessage.classList.add('show');
    if (orderNumberEl) orderNumberEl.textContent = `Order #${orderNumber}`;
}

// Show error message
function showError(message) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
        font-family: var(--font);
        max-width: 400px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Update cart count
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
        const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
            cartCountEl.textContent = count;
            cartCountEl.style.display = count > 0 ? 'flex' : 'none';
        }
    } catch (e) {
        console.error('Error updating cart count:', e);
    }
}

// Mobile menu setup
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');
    
    if (!hamburger || !mobileMenu || !mobileClose) return;

    hamburger.addEventListener('click', () => {
        mobileMenu.classList.add('open');
        document.body.classList.add('menu-open');
    });
    
    mobileClose.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
    });
    
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('open');
            document.body.classList.remove('menu-open');
        }
    });
}

// Listen for payment method changes
document.addEventListener('change', function(e) {
    if (e.target.name === 'payment') {
        selectedPayment = e.target.value;
        updatePaymentSelection();
    }
});

// Add required CSS animations
if (!document.getElementById('checkout-animations')) {
    const style = document.createElement('style');
    style.id = 'checkout-animations';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Make functions globally available
window.selectPayment = selectPayment;
window.placeOrder = placeOrder;

console.log('Checkout system loaded successfully');