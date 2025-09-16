// js/script.js - FIXED Homepage JavaScript using config.js
'use strict';

// ===============================================================================
// HOMEPAGE JAVASCRIPT - Uses shared config.js for Supabase & utilities
// ===============================================================================

// Global state
let PRODUCTS = [];
let cart = [];
let currentSlide = 0;

// ===============================================================================
// DATABASE FUNCTIONS
// ===============================================================================

// Load products from Supabase database
async function loadProducts() {
    try {
        console.log('🔄 Loading products from database...');
        
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.warn('⚠️ No products found in database');
            PRODUCTS = [];
            updateHomepageProducts();
            return;
        }

        // Parse products using config.js utility
        PRODUCTS = data.map(product => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            original_price: product.original_price ? parseFloat(product.original_price) : null,
            category: product.category || 'uncategorized',
            description: product.description || '',
            featured: product.featured || false,
            is_active: product.is_active,
            // Parse PostgreSQL arrays using config.js function
            images: parsePostgreSQLArray(product.images),
            features: parsePostgreSQLArray(product.features),
            sizes: parsePostgreSQLArray(product.sizes),
            stock: product.stock || {}
        }));

        console.log(`✅ Loaded ${PRODUCTS.length} products from database`);
        console.log('📦 Sample product:', PRODUCTS[0]);

        // Update homepage display
        updateHomepageProducts();

    } catch (error) {
        console.error('❌ Error loading products:', error);
        PRODUCTS = [];
        updateHomepageProducts();
    }
}

// Update homepage products display
function updateHomepageProducts() {
    const productContainer = document.getElementById('product-scroll');
    
    if (!productContainer) {
        console.error('❌ Product container #product-scroll not found');
        // Try to find or create container
        const bestsellers = document.getElementById('products');
        if (bestsellers) {
            const scrollWrapper = bestsellers.querySelector('.scroll-wrapper');
            if (scrollWrapper) {
                const newContainer = document.createElement('div');
                newContainer.id = 'product-scroll';
                newContainer.className = 'product-scroll';
                scrollWrapper.appendChild(newContainer);
                console.log('✅ Created product container');
            }
        }
        return;
    }

    if (PRODUCTS.length === 0) {
        productContainer.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">No products available</div>';
        return;
    }

    // Get featured products, fallback to first 8
const featuredProducts = PRODUCTS.filter(p => p.featured === true && p.is_active === true).slice(0, 8);
    const displayProducts = featuredProducts.length > 0 ? featuredProducts : PRODUCTS.slice(0, 8);

    console.log(`🎨 Displaying ${displayProducts.length} products on homepage`);

    // Create product cards
    productContainer.innerHTML = displayProducts.map(product => {
        const mainImage = product.images.length > 0 ? product.images[0] : 'assets/images/placeholder.jpg';
        const secondImage = product.images.length > 1 ? product.images[1] : null;
        
        // Handle pricing
        const hasOriginalPrice = product.original_price && product.original_price > product.price;
        
        let priceHtml;
        if (hasOriginalPrice) {
            priceHtml = `
                <div class="price-container">
                    <p class="original-price">${product.original_price} EGP</p>
                    <p class="price" style="color: #e74c3c; font-weight: 600;">${product.price} EGP</p>
                </div>
            `;
        } else {
            priceHtml = `<p class="price">${product.price} EGP</p>`;
        }

        return `
            <div class="product" onclick="goToProduct(${product.id})" data-product-id="${product.id}" style="cursor: pointer;">
                <div class="product-image-container" style="position: relative;">
                    <img id="product-${product.id}" src="${mainImage}" alt="${product.name}" 
                         class="main-image" style="width: 100%; height: auto; display: block;"
                         onerror="this.src='assets/images/placeholder.jpg'">
                    ${secondImage ? `<img src="${secondImage}" alt="${product.name}" class="hover-image" style="position: absolute; top: 0; left: 0; width: 100%; height: auto; opacity: 0; transition: opacity 0.3s ease;">` : ''}
                    ${hasOriginalPrice ? '<span class="sale-badge" style="position: absolute; top: 10px; left: 10px; background: #e74c3c; color: white; padding: 4px 8px; font-size: 0.75rem; font-weight: 600; border-radius: 4px;">SALE</span>' : ''}
                </div>
                <p style="margin-top: 0.5rem; font-weight: 600; text-align: center;">${product.name}</p>
                ${priceHtml}
            </div>
        `;
    }).join('');

    // Setup hover effects
    setupProductHoverEffects();
    
    console.log('✅ Homepage products updated successfully');
}

// Setup product hover effects
function setupProductHoverEffects() {
    const productCards = document.querySelectorAll('.product[data-product-id]');
    
    productCards.forEach(card => {
        const mainImage = card.querySelector('.main-image');
        const hoverImage = card.querySelector('.hover-image');
        
        if (hoverImage && mainImage) {
            card.addEventListener('mouseenter', () => {
                hoverImage.style.opacity = '1';
                mainImage.style.opacity = '0';
            });
            
            card.addEventListener('mouseleave', () => {
                hoverImage.style.opacity = '0';
                mainImage.style.opacity = '1';
            });
        }
    });
}

// ===============================================================================
// NAVIGATION FUNCTIONS  
// ===============================================================================

// FIXED: Navigate to product page with correct URL format
window.goToProduct = function(productId) {
    if (!productId) {
        console.error('❌ No product ID provided');
        return;
    }
    
    console.log(`🔗 Navigating to product: ${productId}`);
    
    // Store product data for product page
    const product = PRODUCTS.find(p => p.id == productId);
    if (product) {
        console.log(`✅ Found product: ${product.name}`);
        sessionStorage.setItem('nourabelle_current_product', JSON.stringify(product));
    }
    
    // Navigate with CORRECT URL format: pages/product.html?id=X
    const targetUrl = `pages/product.html?id=${productId}`;
    console.log(`🔗 Navigating to: ${targetUrl}`);
    window.location.href = targetUrl;
};

// ===============================================================================
// MOBILE MENU
// ===============================================================================

function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');

    if (!hamburger || !mobileMenu || !mobileClose) {
        console.log('Mobile menu elements not found');
        return;
    }

    let isMenuOpen = false;

    function openMenu() {
        isMenuOpen = true;
        hamburger.classList.add('active');
        mobileMenu.classList.add('open');
        document.body.classList.add('menu-open');
    }

    function closeMenu() {
        isMenuOpen = false;
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
    }

    hamburger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (isMenuOpen) closeMenu();
        else openMenu();
    });

    mobileClose.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
    });

    const menuLinks = mobileMenu.querySelectorAll('.mobile-menu-content a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) closeMenu();
    });

    console.log('✅ Mobile menu initialized');
}

// ===============================================================================
// SEARCH FUNCTIONALITY
// ===============================================================================

function initSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (!searchBtn || !searchOverlay) {
        console.log('Search elements not found');
        return;
    }

    function openSearch() {
        searchOverlay.classList.add('open');
        if (searchInput) searchInput.focus();
    }

    function closeSearch() {
        searchOverlay.classList.remove('open');
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.innerHTML = '';
    }

    function performSearch() {
        if (!searchInput || !searchResults) return;
        
        const query = searchInput.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        const results = PRODUCTS.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        );

        if (results.length === 0) {
            searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No products found</div>';
            return;
        }

        searchResults.innerHTML = results.slice(0, 6).map(product => {
            const image = product.images.length > 0 ? product.images[0] : 'assets/images/placeholder.jpg';
            
            return `
                <div style="display: flex; align-items: center; padding: 1rem; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s ease;"
                     onclick="goToProduct(${product.id}); document.getElementById('searchOverlay').classList.remove('open');"
                     onmouseover="this.style.background='#f5f5f5';"
                     onmouseout="this.style.background='white';">
                    <img src="${image}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; margin-right: 1rem;">
                    <div>
                        <h4 style="margin: 0 0 0.25rem 0; color: var(--text);">${product.name}</h4>
                        <p style="margin: 0; color: #666; font-size: 0.9rem;">${product.price} EGP</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    searchBtn.addEventListener('click', openSearch);
    
    if (searchClose) {
        searchClose.addEventListener('click', closeSearch);
    }

    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(performSearch, 300);
        });
    }

    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) closeSearch();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
            closeSearch();
        }
    });

    console.log('✅ Search initialized');
}

// ===============================================================================
// HERO SLIDER
// ===============================================================================

function initHeroSlider() {
    const slides = document.querySelectorAll('.slide-img');
    
    if (slides.length <= 1) {
        console.log('Hero slider: Not enough slides');
        return;
    }

    function nextSlide() {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    setInterval(nextSlide, 4000);
    console.log(`✅ Hero slider initialized with ${slides.length} slides`);
}

// ===============================================================================
// CART MANAGEMENT
// ===============================================================================

function initCartSystem() {
    loadCartFromStorage();
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
}

function loadCartFromStorage() {
    try {
        const cartData = localStorage.getItem('nourabelle_cart');
        cart = cartData ? JSON.parse(cartData) : [];
        console.log(`🛒 Loaded cart with ${cart.length} items`);
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('nourabelle_cart', JSON.stringify(cart));
        updateCartCount();
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;
    
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    cartCount.textContent = totalItems;
    cartCount.classList.toggle('visible', totalItems > 0);
    
    if (totalItems > 0) {
        cartCount.style.display = 'flex';
    } else {
        cartCount.style.display = 'none';
    }
}

// Global cart functions
window.addToCart = function(productId, size, quantity = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return false;
    }
    
    const existingItemIndex = cart.findIndex(item => 
        item.id === productId && item.size === size
    );
    
    const mainImage = product.images.length > 0 ? product.images[0] : 'assets/images/placeholder.jpg';
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            size: size,
            quantity: quantity,
            image: mainImage
        });
    }
    
    saveCartToStorage();
    showNotification(`${product.name} added to cart!`);
    
    console.log(`🛒 Added to cart: ${product.name} (${size}) x${quantity}`);
    return true;
};

function showNotification(message) {
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
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===============================================================================
// UTILITY FUNCTIONS
// ===============================================================================

function scrollToProducts() {
    const productsSection = document.getElementById("products");
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
    }
}

// Make functions globally available
window.scrollToProducts = scrollToProducts;
window.PRODUCTS = PRODUCTS;

// ===============================================================================
// DEBUG FUNCTIONS
// ===============================================================================

window.debugProducts = function() {
    console.log('=== HOMEPAGE DEBUG ===');
    console.log('Products loaded:', PRODUCTS.length);
    console.log('Products:', PRODUCTS);
    console.log('Container:', document.getElementById('product-scroll'));
    console.log('Bestsellers section:', document.getElementById('products'));
    
    if (PRODUCTS.length > 0) {
        console.log('Sample product images:', PRODUCTS[0].images);
    }
    
    return {
        products: PRODUCTS,
        container: document.getElementById('product-scroll'),
        section: document.getElementById('products')
    };
};

// ===============================================================================
// INITIALIZATION
// ===============================================================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Homepage initializing...');
    
    // Load products from database first
    await loadProducts();
    
    // Initialize all modules
    initMobileMenu();
    initSearch();
    initHeroSlider();
    initCartSystem();

    // Add CSS animations
    if (!document.getElementById('nourabelle-animations')) {
        const style = document.createElement('style');
        style.id = 'nourabelle-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            .original-price {
                text-decoration: line-through;
                color: #999;
                font-size: 0.85rem;
                margin: 0;
            }
            .price-container {
                display: flex;
                flex-direction: column;
                gap: 2px;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    console.log('✅ Nourabelle homepage initialized successfully');
});