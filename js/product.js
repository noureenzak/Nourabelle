// Updated Product Page JavaScript with Cart Integration
'use strict';

// Supabase Configuration
const SUPABASE_URL = 'https://ebiwoiaduskjodegnhvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaXdvaWFkdXNram9kZWduaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQ5OTEsImV4cCI6MjA3MjE3MDk5MX0.tuWREO0QuDKfgJQ6fbVpi4UI9ckKUYlqoCy3g2_cJW8';

// Initialize Supabase
let supabase = null;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase client created');
    } else {
        console.error('Supabase library not found');
    }
} catch (error) {
    console.error('Supabase initialization failed:', error);
}

// State management
let currentProduct = null;
let selectedSize = 'S-M';
let quantity = 1;

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

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Product page initializing...');
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    
    if (!productId) {
        console.error('No product ID found in URL');
        showErrorMessage('No product ID found. Redirecting to products page.');
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 2000);
        return;
    }
    
    loadProductFromDatabase(productId);
    setupEventListeners();
    updateCartCount();
});

async function loadProductFromDatabase(productId) {
    console.log('Loading product:', productId);
    
    try {
        showLoadingMessage('Loading product details...');
        
        if (!supabase) {
            throw new Error('Database connection failed');
        }
        
        // Fetch product from Supabase
        const { data: product, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .eq('is_active', true)
            .single();
        
        if (error) {
            console.error('Database error:', error);
            if (error.code === 'PGRST116') {
                throw new Error('Product not found');
            } else {
                throw new Error('Database error: ' + error.message);
            }
        }
        
        if (!product) {
            throw new Error('Product not found');
        }

        console.log('Product found:', product);
        
        // Convert and store product
        currentProduct = {
            id: product.id,
            name: product.name || 'Untitled Product',
            price: product.price || 0,
            originalPrice: product.original_price || null,
            image: (product.images && product.images.length > 0) ? product.images[0] : null,
            images: product.images || [],
            category: product.category || 'uncategorized',
            badge: getBadge(product),
            description: product.description || 'No description available',
            features: [
                'High-quality materials',
                'Comfortable fit',
                'Elegant design',
                'Perfect for daily wear',
                'Easy care instructions'
            ],
            stock: product.stock || { 'S-M': 0, 'M-L': 0 }
        };
        
        renderProduct();
        
    } catch (error) {
        console.error('Error loading product:', error);
        showErrorMessage(error.message);
    }
}

function showLoadingMessage(message) {
    const productLayout = document.querySelector('.product-layout');
    if (productLayout) {
        productLayout.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: #666; font-family: var(--font);">
                <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid var(--btn); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
                <p>${message}</p>
            </div>
        `;
    }
}

function showErrorMessage(message) {
    const productLayout = document.querySelector('.product-layout');
    if (productLayout) {
        productLayout.innerHTML = `
            <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; font-family: var(--font);">
                <h1 style="font-size: 2rem; color: #e74c3c; margin-bottom: 1rem;">Error</h1>
                <p style="color: #666; margin-bottom: 2rem; font-size: 1.1rem;">${message}</p>
                <a href="products.html" style="background: var(--btn); color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Back to Products</a>
            </div>
        `;
    }
}

function getBadge(product) {
    if (product.featured) {
        return 'featured';
    } else if (product.original_price && product.price < product.original_price) {
        return 'sale';
    }
    return null;
}

function renderProduct() {
    console.log('Rendering product:', currentProduct.name);
    
    if (!currentProduct) {
        console.error('No current product to render');
        return;
    }

    // Update page title
    document.title = `${currentProduct.name} - Nourabelle`;

    // Reset product layout if it was showing loading/error
    const productLayout = document.querySelector('.product-layout');
    if (productLayout && (productLayout.innerHTML.includes('Loading') || productLayout.innerHTML.includes('Error'))) {
        productLayout.innerHTML = `
            <div class="product-image-section">
                <div class="main-image-container">
                    <img id="product-image" src="" alt="Product Image" />
                    <span id="product-badge" class="product-badge" style="display: none;"></span>
                </div>
                <div class="thumbnail-container" id="thumbnail-container" style="display: none;"></div>
            </div>
            <div class="product-info">
                <div class="product-category" id="product-category">Category</div>
                <h2 id="product-title">Product Name</h2>
                <div class="product-price-section">
                    <span id="product-price" class="current-price">Price</span>
                    <span id="original-price" class="original-price" style="display: none;"></span>
                </div>
                <p id="product-description" class="product-description">Description</p>
                <div class="size-section">
                    <label for="size">Size:</label>
                    <select id="size" class="size-select">
                        <option value="S-M">S-M</option>
                        <option value="M-L">M-L</option>
                    </select>
                </div>
                <div class="quantity-section">
                    <label for="quantity">Quantity:</label>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                        <input type="number" id="quantity-input" class="quantity-input" value="1" min="1" max="10">
                        <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
                    </div>
                </div>
                <button class="buy-button" id="buy-button" onclick="addToCart()">Add to Cart</button>
                <div class="product-features">
                    <h3 class="features-title">Product Features</h3>
                    <ul class="features-list" id="features-list"></ul>
                </div>
            </div>
        `;
    }

    // Update product info
    updateElement('product-category', currentProduct.category.charAt(0).toUpperCase() + currentProduct.category.slice(1));
    updateElement('product-title', currentProduct.name);
    updateElement('product-description', currentProduct.description);
    updateElement('product-price', `${currentProduct.price} EGP`);

    // Update original price
    const originalPrice = document.getElementById('original-price');
    if (currentProduct.originalPrice && originalPrice) {
        originalPrice.textContent = `${currentProduct.originalPrice} EGP`;
        originalPrice.style.display = 'inline';
    } else if (originalPrice) {
        originalPrice.style.display = 'none';
    }

    // Update badge
    const badge = document.getElementById('product-badge');
    if (badge) {
        if (currentProduct.badge) {
            badge.textContent = currentProduct.badge.toUpperCase();
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }

    // Update main image
    const mainImage = document.getElementById('product-image');
    if (mainImage) {
        if (currentProduct.images && currentProduct.images.length > 0) {
            mainImage.src = currentProduct.images[0];
            mainImage.alt = currentProduct.name;
            
            mainImage.onerror = function() {
                this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
            };
        }
    }

    // Update features
    const featuresList = document.getElementById('features-list');
    if (featuresList && currentProduct.features) {
        featuresList.innerHTML = currentProduct.features.map(feature => `<li>${feature}</li>`).join('');
    }

    // Update size selector with S-M and M-L
    const sizeSelect = document.getElementById('size');
    if (sizeSelect) {
        sizeSelect.innerHTML = `
            <option value="S-M">S-M</option>
            <option value="M-L">M-L</option>
        `;
        sizeSelect.addEventListener('change', (e) => {
            selectedSize = e.target.value;
        });
    }

    console.log('Product rendering complete');
}

function updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    }
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
        if (count > 0) {
            cartCountEl.style.display = 'flex';
        } else {
            cartCountEl.style.display = 'none';
        }
    }
}

// Quantity controls
function changeQuantity(change) {
    const input = document.getElementById('quantity-input');
    quantity = Math.max(1, Math.min(10, quantity + change));
    if (input) input.value = quantity;
}

// Add to cart function
function addToCart() {
    console.log('Add to cart clicked');
    
    if (!currentProduct) {
        console.error('No product to add');
        return;
    }
    
    // Get current selections
    const sizeSelect = document.getElementById('size');
    const quantityInput = document.getElementById('quantity-input');
    
    const selectedSize = sizeSelect ? sizeSelect.value : 'S-M';
    const selectedQuantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    // Create cart item
    const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.image,
        size: selectedSize,
        quantity: selectedQuantity,
        category: currentProduct.category,
        addedAt: Date.now()
    };
    
    // Get existing cart
    const cart = getCart();
    
    // Check if item with same ID and size already exists
    const existingIndex = cart.findIndex(item => 
        item.id === cartItem.id && item.size === cartItem.size
    );
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += selectedQuantity;
    } else {
        cart.push(cartItem);
    }
    
    // Save cart
    saveCart(cart);
    
    // Show success message and redirect to cart
    showNotification(`${currentProduct.name} (${selectedSize}) added to cart!`);
    
    // Redirect to cart page after a short delay
    setTimeout(() => {
        window.location.href = 'cart.html';
    }, 1500);
}

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
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-family: var(--font);
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Global functions for onclick
window.changeQuantity = changeQuantity;
window.addToCart = addToCart;

// Add loading animation CSS
if (!document.getElementById('product-animations')) {
    const style = document.createElement('style');
    style.id = 'product-animations';
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

console.log('Product page script loaded successfully');