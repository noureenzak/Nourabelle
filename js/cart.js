// Updated Cart Management System - cart.js - FIXED ALL ISSUES
'use strict';

// Cart state
let currentShipping = 0;

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Cart page initializing...');
    
    // Clean up any existing cart with undefined values
    cleanUpCart();
    
    displayCartItems();
    setupMobileMenu();
    setupSearch();
    updateCartCount();
});

// Clean up cart function
function cleanUpCart() {
    const cart = getCart();
    if (cart.length > 0) {
        // Save will automatically clean the data
        saveCart(cart);
        console.log('Cart cleaned up');
    }
}

// Cart utility functions
function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
        // Clean up any undefined values in existing cart items
        return cart.map(item => ({
            id: item.id || Math.random().toString(),
            name: item.name || 'Product',
            price: item.price || 0,
            image: item.image || '../assets/images/placeholder.jpg',
            size: item.size || 'S-M',
            quantity: item.quantity || 1,
            category: item.category || 'Product',
            addedAt: item.addedAt || Date.now()
        }));
    } catch (e) {
        console.error('Cart parsing error:', e);
        return [];
    }
}

function saveCart(cart) {
    try {
        // Clean cart data before saving
        const cleanCart = cart.map(item => ({
            id: item.id || Math.random().toString(),
            name: item.name || 'Product',
            price: item.price || 0,
            image: item.image || '../assets/images/placeholder.jpg',
            size: item.size || 'S-M',
            quantity: item.quantity || 1,
            category: item.category || 'Product',
            addedAt: item.addedAt || Date.now()
        }));
        
        localStorage.setItem('nourabelle_cart', JSON.stringify(cleanCart));
        updateCartCount();
        document.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (e) {
        console.error('Cart save error:', e);
    }
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 1;
        return total + (price * quantity);
    }, 0);
}

// Display cart items - FIXED to handle undefined values
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

    cartItemsList.innerHTML = cart.map((item, index) => {
        // Clean up undefined values
        const cleanItem = {
            name: item.name || 'Product',
            price: item.price || 0,
            size: item.size || 'S-M',
            quantity: item.quantity || 1,
            category: item.category || 'Product',
            image: item.image || '../assets/images/placeholder.jpg'
        };

        return `
            <div class="cart-item">
                <button class="remove-btn" onclick="removeItem(${index})" aria-label="Remove item">&times;</button>

                <div class="item-image">
                    <img src="${cleanItem.image}" alt="${cleanItem.name}" 
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSIxMiI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'">
                </div>
                
                <div class="item-info">
                    <h3>${cleanItem.name}</h3>
                    <p>Size: ${cleanItem.size}</p>
                    <p>Category: ${cleanItem.category}</p>
                    <div class="item-price">${cleanItem.price} EGP</div>
                </div>

                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="changeQuantity(${index}, -1)" aria-label="Decrease quantity">-</button>
                        <span class="quantity-display">${cleanItem.quantity}</span>
                        <button class="quantity-btn" onclick="changeQuantity(${index}, 1)" aria-label="Increase quantity">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    updateTotals();
}

// Change quantity
function changeQuantity(index, change) {
    const cart = getCart();
    if (!cart[index]) return;
    
    const newQuantity = cart[index].quantity + change;
    if (newQuantity <= 0) {
        removeItem(index);
        return;
    }
    
    cart[index].quantity = newQuantity;
    saveCart(cart);
    displayCartItems();
}

// Remove item - FIXED
function removeItem(index) {
    if (confirm('Remove this item from your cart?')) {
        const cart = getCart();
        if (cart[index]) {
            cart.splice(index, 1);
            saveCart(cart);
            displayCartItems();
            
            // Show notification
            showNotification('Item removed from cart');
        }
    }
}

// Update shipping cost
function updateShipping() {
    const select = document.getElementById('shippingSelect');
    if (!select) return;
    
    const shippingCosts = {
        'cairo-giza': 85,
        'alexandria': 65,
        'delta': 85,
        'canal': 85,
        'beheira': 95,
        'upper1': 95,
        'upper2': 125,
        'upper3': 135,
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
        
        // Update button text based on state
        if (subtotal === 0) {
            checkoutBtn.textContent = 'Cart is Empty';
        } else if (currentShipping === 0) {
            checkoutBtn.textContent = 'Select Shipping Location';
        } else {
            checkoutBtn.textContent = 'Proceed to Checkout';
        }
    }
}

// Proceed to checkout - FIXED to go to checkout.html
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

    // Get shipping location details
    const shippingLocationText = shippingSelect.options[shippingSelect.selectedIndex].text;
    
    // Save checkout data for checkout page
    const checkoutData = {
        items: cart,
        subtotal: getCartTotal(),
        shipping: currentShipping,
        total: getCartTotal() + currentShipping,
        shippingLocation: shippingSelect.value,
        shippingLocationText: shippingLocationText
    };
    
    try {
        localStorage.setItem('nourabelle_checkout', JSON.stringify(checkoutData));
        console.log('Checkout data saved:', checkoutData);
        
        // Redirect to checkout page
        window.location.href = 'checkout.html';
    } catch (error) {
        console.error('Error saving checkout data:', error);
        alert('Error proceeding to checkout. Please try again.');
    }
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

// Show notification
function showNotification(message) {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--btn);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: var(--font);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// FIXED: Mobile menu setup
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');
    
    console.log('Setting up mobile menu...', { hamburger, mobileMenu, mobileClose });
    
    if (!hamburger || !mobileMenu || !mobileClose) {
        console.error('Mobile menu elements not found');
        return;
    }

    let isMenuOpen = false;

    function openMenu() {
        console.log('Opening menu');
        isMenuOpen = true;
        hamburger.classList.add('active');
        mobileMenu.classList.add('open');
        document.body.classList.add('menu-open');
    }

    function closeMenu() {
        console.log('Closing menu');
        isMenuOpen = false;
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
    }

    function toggleMenu() {
        console.log('Toggle menu - current state:', isMenuOpen);
        if (isMenuOpen) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    // Hamburger click event
    hamburger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Hamburger clicked');
        toggleMenu();
    });

    // Close button click event
    mobileClose.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Close button clicked');
        closeMenu();
    });

    // Close menu when clicking on menu links
    const menuLinks = mobileMenu.querySelectorAll('.mobile-menu-content a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            console.log('Menu link clicked, closing menu');
            closeMenu();
        });
    });

    // Close menu on outside click
    mobileMenu.addEventListener('click', function(e) {
        if (e.target === mobileMenu) {
            console.log('Outside click, closing menu');
            closeMenu();
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            console.log('Escape pressed, closing menu');
            closeMenu();
        }
    });

    console.log('Mobile menu setup complete');
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

// Add CSS animations for notifications
if (!document.getElementById('cart-animations')) {
    const style = document.createElement('style');
    style.id = 'cart-animations';
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

// Listen for cart updates
document.addEventListener('cartUpdated', displayCartItems);

// Make functions globally available
window.changeQuantity = changeQuantity;
window.removeItem = removeItem;
window.updateShipping = updateShipping;
window.proceedToCheckout = proceedToCheckout;