// Updated Cart Management System - cart.js
'use strict';

// Cart state
let currentShipping = 0;

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart page initializing...');
    displayCartItems();
    setupMobileMenu();
    setupSearch();
    updateCartCount();
});

// Cart utility functions
function getCart() {
    try {
        return JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
    } catch (e) {
        console.error('Cart parsing error:', e);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem('nourabelle_cart', JSON.stringify(cart));
        updateCartCount();
        document.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (e) {
        console.error('Cart save error:', e);
    }
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
}

// Display cart items
// Display cart items
function displayCartItems() {
    const cart = getCart();
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');
    const cartItemsList = document.getElementById('cartItemsList');

    if (!cart || cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContent) cartContent.style.display = 'grid';

    if (!cartItemsList) return;

    cartItemsList.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <button class="remove-btn" onclick="removeItem(${index})">&times;</button>

            <div class="item-image">
                <img src="${item.image || 'placeholder.jpg'}" alt="${item.name}">
            </div>
            
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>Size: ${item.size}</p>
                <p>Category: ${item.category || 'Product'}</p>
            </div>

            <div class="item-price">${item.price} EGP</div>

            <div class="quantity-controls">
                <button class="quantity-btn" onclick="changeQuantity(${index}, -1)">-</button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</button>
            </div>
        </div>
    `).join('');

    updateTotals();
}


// Change quantity
function changeQuantity(index, change) {
    const cart = getCart();
    if (!cart[index]) return;
    
    cart[index].quantity = Math.max(1, cart[index].quantity + change);
    saveCart(cart);
    displayCartItems();
}

// Remove item
function removeItem(index) {
    if (confirm('Remove this item from your cart?')) {
        const cart = getCart();
        cart.splice(index, 1);
        saveCart(cart);
        displayCartItems();
    }
}

// Update shipping cost
function updateShipping() {
    const select = document.getElementById('shippingSelect');
    if (!select) return;
    
    const shippingCosts = { 
        cairo: 50, 
        alexandria: 60, 
        giza: 55, 
        other: 80 
    };
    
    currentShipping = shippingCosts[select.value] || 0;
    updateTotals();
}

// Update totals
function updateTotals() {
    const subtotal = getCartTotal();
    const total = subtotal + currentShipping;

    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} EGP`;
    if (totalEl) totalEl.textContent = `${total.toFixed(2)} EGP`;
    
    if (checkoutBtn) {
        checkoutBtn.disabled = subtotal === 0 || currentShipping === 0;
    }
}

// Proceed to checkout
function proceedToCheckout() {
    const cart = getCart();
    const shippingSelect = document.getElementById('shippingSelect');
    
    if (cart.length === 0) {
        alert('Your cart is empty');
        return;
    }
    
    if (!shippingSelect || !shippingSelect.value) {
        alert('Please select shipping location');
        return;
    }

    // Save checkout data for checkout page
    const checkoutData = {
        items: cart,
        subtotal: getCartTotal(),
        shipping: currentShipping,
        total: getCartTotal() + currentShipping,
        shippingLocation: shippingSelect.value
    };
    localStorage.setItem('nourabelle_checkout', JSON.stringify(checkoutData));

    // Redirect to checkout page
    window.location.href = 'checkout.html';
}


// Update cart count in header
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    const cartCountEl = document.getElementById('cart-count');
    
    if (cartCountEl) {
        cartCountEl.textContent = count;
        if (count > 0) {
            cartCountEl.classList.add('visible');
            cartCountEl.style.display = 'flex';
        } else {
            cartCountEl.classList.remove('visible');
            cartCountEl.style.display = 'none';
        }
    }
}

// Mobile menu setup
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.add('open');
            document.body.classList.add('menu-open');
        });
    }
    
    if (mobileClose) {
        mobileClose.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
            document.body.classList.remove('menu-open');
        });
    }
    
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                mobileMenu.classList.remove('open');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

// Search functionality
function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');

    if (!searchBtn || !searchOverlay) return;

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchOverlay.classList.add('open');
            setTimeout(() => searchInput && searchInput.focus(), 100);
        });
    }

    if (searchClose) {
        searchClose.addEventListener('click', () => {
            searchOverlay.classList.remove('open');
            if (searchInput) searchInput.value = '';
        });
    }

    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('open');
                if (searchInput) searchInput.value = '';
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('open')) {
            searchOverlay.classList.remove('open');
            if (searchInput) searchInput.value = '';
        }
    });
}

// Listen for cart updates
document.addEventListener('cartUpdated', displayCartItems);

// Make functions globally available
window.changeQuantity = changeQuantity;
window.removeItem = removeItem;
window.updateShipping = updateShipping;
window.proceedToCheckout = proceedToCheckout;