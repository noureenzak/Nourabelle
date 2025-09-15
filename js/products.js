// js/products.js - FIXED Products Page JavaScript using config.js
'use strict';

// ===============================================================================
// PRODUCTS PAGE JAVASCRIPT - Uses shared config.js for Supabase & utilities
// ===============================================================================

// Global state
let allProducts = [];
let filteredProducts = [];
let cart = [];

// ===============================================================================
// INITIALIZATION
// ===============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Products page initializing...');
    initializeProductsPage();
});

async function initializeProductsPage() {
    console.log('=== PRODUCTS PAGE INITIALIZATION ===');
    
    try {
        // Setup functionality first
        setupMobileMenu();
        setupSearch();
        setupFilters();
        loadCartFromStorage();
        updateCartCount();
        
        // Show loading state
        showLoadingState(true);
        
        // Load products from Supabase
        console.log('1. Loading products from database...');
        await loadAllProductsFromDatabase();
        
        // Hide loading state
        showLoadingState(false);
        
        console.log('✅ Products page initialization complete');
    } catch (error) {
        console.error('❌ Error initializing products page:', error);
        showLoadingState(false);
        showNoProducts('Error loading products. Please refresh the page.');
    }
}

// ===============================================================================
// DATABASE FUNCTIONS
// ===============================================================================

// Load all products from Supabase database
async function loadAllProductsFromDatabase() {
    try {
        console.log('🔍 Querying Supabase for all products...');
        
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        console.log('📡 Supabase response:', { data, error });
        
        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        
        if (!data || data.length === 0) {
            console.warn('⚠️ No products found in database');
            allProducts = [];
            filteredProducts = [];
            showNoProducts('No products available at the moment.');
            return;
        }
        
        // Parse products using config.js utility
        allProducts = data.map(product => ({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            original_price: product.original_price ? parseFloat(product.original_price) : null,
            category: product.category || 'uncategorized',
            description: product.description || '',
            featured: product.featured || false,
            is_active: product.is_active,
            created_at: product.created_at,
            // Parse PostgreSQL arrays using config.js function
            images: parsePostgreSQLArray(product.images),
            features: parsePostgreSQLArray(product.features),
            sizes: parsePostgreSQLArray(product.sizes),
            stock: product.stock || {}
        }));
        
        filteredProducts = [...allProducts];
        
        console.log(`✅ Loaded ${allProducts.length} products from database`);
        
        // Log sample product for debugging
        if (allProducts.length > 0) {
            console.log('📦 Sample product:', allProducts[0]);
            console.log('🖼️ Sample images:', allProducts[0].images);
        }
        
        // Apply initial filters and render
        applyFilters();
        
    } catch (error) {
        console.error('❌ Error loading products:', error);
        showNoProducts('Failed to load products. Please check your connection.');
        throw error;
    }
}

// ===============================================================================
// UI STATE FUNCTIONS
// ===============================================================================

// Show/hide loading state
function showLoadingState(show) {
    const loadingState = document.getElementById('loadingState');
    const productsGrid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    
    console.log('🔄 Loading state:', show);
    
    if (loadingState) {
        loadingState.style.display = show ? 'block' : 'none';
    }
    
    if (productsGrid) {
        productsGrid.style.display = show ? 'none' : 'grid';
    }
    
    if (noProducts) {
        noProducts.style.display = 'none';
    }
}

// Show no products message
function showNoProducts(message = 'No products found') {
    const loadingState = document.getElementById('loadingState');
    const productsGrid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    
    console.log('📭 Showing no products message:', message);
    
    if (loadingState) loadingState.style.display = 'none';
    if (productsGrid) productsGrid.style.display = 'none';
    
    if (noProducts) {
        noProducts.style.display = 'block';
        const messageElement = noProducts.querySelector('p');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
}

// ===============================================================================
// FILTERING & SORTING
// ===============================================================================

// Setup filters
function setupFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }
    
    console.log('🔧 Filters setup complete');
}

// Apply filters and sorting
function applyFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const selectedSort = sortFilter ? sortFilter.value : 'newest';
    
    console.log(`🔍 Applying filters - Category: ${selectedCategory}, Sort: ${selectedSort}`);
    
    // Filter by category
    filteredProducts = allProducts.filter(product => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'sale') {
            return product.original_price && product.original_price > product.price;
        }
        return product.category && product.category.toLowerCase() === selectedCategory.toLowerCase();
    });
    
    // Sort products
    filteredProducts.sort((a, b) => {
        switch (selectedSort) {
            case 'newest':
                return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            case 'oldest':
                return new Date(a.created_at || 0) - new Date(b.created_at || 0);
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'sale':
                const aOnSale = a.original_price && a.original_price > a.price;
                const bOnSale = b.original_price && b.original_price > b.price;
                if (aOnSale && !bOnSale) return -1;
                if (!aOnSale && bOnSale) return 1;
                return 0;
            default:
                return 0;
        }
    });
    
    console.log(`📊 Filtered to ${filteredProducts.length} products`);
    
    // Render products
    renderProducts();
}

// ===============================================================================
// PRODUCT RENDERING
// ===============================================================================

// Render products grid
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) {
        console.error('❌ Products grid element not found');
        return;
    }
    
    if (filteredProducts.length === 0) {
        showNoProducts('No products match your current filters.');
        return;
    }
    
    console.log(`🎨 Rendering ${filteredProducts.length} products`);
    
    const productsHtml = filteredProducts.map(product => createProductCard(product)).join('');
    productsGrid.innerHTML = productsHtml;
    productsGrid.style.display = 'grid';
    
    // Setup hover effects for multiple images
    setupProductHoverEffects();
    
    console.log(`✅ Rendered ${filteredProducts.length} products successfully`);
}

// Create product card HTML
function createProductCard(product) {
    // Get images using parsed array
    const mainImage = product.images.length > 0 ? product.images[0] : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    const secondImage = product.images.length > 1 ? product.images[1] : null;
    
    // Handle pricing
    const hasOriginalPrice = product.original_price && product.original_price > product.price;
    
    let priceHtml;
    if (hasOriginalPrice) {
        priceHtml = `
            <div class="price-sale">
                <span class="current-price">${product.price} EGP</span>
                <span class="original-price">${product.original_price} EGP</span>
            </div>
        `;
    } else {
        priceHtml = `<div class="price">${product.price} EGP</div>`;
    }
    
    return `
        <div class="product-item" onclick="goToProduct(${product.id})" data-product-id="${product.id}" style="cursor: pointer;">
            <div class="product-image-container" style="position: relative;">
                <img src="${mainImage}" alt="${product.name}" class="main-image" style="width: 100%; height: auto; display: block; transition: opacity 0.3s ease;">
                ${secondImage ? `<img src="${secondImage}" alt="${product.name}" class="hover-image" style="position: absolute; top: 0; left: 0; width: 100%; height: auto; opacity: 0; transition: opacity 0.3s ease;">` : ''}
                ${hasOriginalPrice ? '<span class="sale-badge" style="position: absolute; top: 10px; left: 10px; background: #e74c3c; color: white; padding: 4px 8px; font-size: 0.75rem; font-weight: 600; border-radius: 4px; z-index: 1;">SALE</span>' : ''}
            </div>
            <p style="margin-top: 0.75rem; font-weight: 600; color: var(--text); text-align: center;">${product.name}</p>
            <div class="product-price" style="text-align: center; margin: 0.5rem 0;">
                ${priceHtml}
            </div>
        </div>
    `;
}

// Setup product hover effects
function setupProductHoverEffects() {
    const productItems = document.querySelectorAll('.product-item[data-product-id]');
    console.log(`🖱️ Setting up hover effects for ${productItems.length} products`);
    
    productItems.forEach(item => {
        const mainImage = item.querySelector('.main-image');
        const hoverImage = item.querySelector('.hover-image');
        
        if (hoverImage && mainImage) {
            item.addEventListener('mouseenter', () => {
                hoverImage.style.opacity = '1';
                mainImage.style.opacity = '0';
            });
            
            item.addEventListener('mouseleave', () => {
                hoverImage.style.opacity = '0';
                mainImage.style.opacity = '1';
            });
        }
    });
}

// ===============================================================================
// NAVIGATION
// ===============================================================================

// FIXED: Navigate to product page with correct URL format
window.goToProduct = function(productId) {
    if (!productId) {
        console.error('❌ No product ID provided');
        return;
    }
    
    console.log(`🔗 Navigating to product: ${productId}`);
    
    // Find and store the product data
    const product = allProducts.find(p => p.id == productId);
    if (product) {
        console.log(`✅ Found product: ${product.name}`);
        sessionStorage.setItem('nourabelle_current_product', JSON.stringify(product));
    } else {
        console.error(`❌ Product not found with ID: ${productId}`);
    }
    
    // Navigate to product page with CORRECT URL format
    const targetUrl = `product.html?id=${productId}`;
    console.log(`🔗 Navigating to: ${targetUrl}`);
    window.location.href = targetUrl;
};

// ===============================================================================
// SEARCH FUNCTIONALITY
// ===============================================================================

function setupSearch() {
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

        const results = allProducts.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        );

        if (results.length === 0) {
            searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No products found</div>';
            return;
        }

        searchResults.innerHTML = results.slice(0, 6).map(product => {
            const image = product.images.length > 0 ? product.images[0] : '../assets/images/placeholder.jpg';
            
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

    console.log('✅ Search setup complete');
}

// ===============================================================================
// MOBILE MENU
// ===============================================================================

function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');
    
    if (!hamburger || !mobileMenu || !mobileClose) {
        console.log('Mobile menu elements not found');
        return;
    }
    
    let isMenuOpen = false;
    
    hamburger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
        hamburger.classList.toggle('active', isMenuOpen);
        mobileMenu.classList.toggle('open', isMenuOpen);
        document.body.classList.toggle('menu-open', isMenuOpen);
    });
    
    mobileClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isMenuOpen = false;
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
    });
    
    const menuLinks = mobileMenu.querySelectorAll('.mobile-menu-content a');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            isMenuOpen = false;
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('open');
            document.body.classList.remove('menu-open');
        });
    });
    
    console.log('✅ Mobile menu setup complete');
}

// ===============================================================================
// CART FUNCTIONS
// ===============================================================================

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

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.classList.toggle('visible', totalItems > 0);
}

// ===============================================================================
// DEBUG FUNCTIONS
// ===============================================================================

window.debugProducts = function() {
    console.log('=== PRODUCTS PAGE DEBUG ===');
    console.log('All products:', allProducts);
    console.log('Filtered products:', filteredProducts);
    console.log('Products grid element:', document.getElementById('productsGrid'));
    console.log('Loading state element:', document.getElementById('loadingState'));
    
    // Test database connection
    console.log('Testing database connection...');
    supabase.from('products').select('count').then(result => {
        console.log('Database connection test:', result);
    });
    
    // Test navigation
    if (allProducts.length > 0) {
        console.log('Testing navigation with first product:', allProducts[0]);
        console.log('Sample parsed images:', allProducts[0].images);
    }
    
    return {
        products: allProducts,
        filtered: filteredProducts,
        grid: document.getElementById('productsGrid'),
        loading: document.getElementById('loadingState')
    };
};

console.log('✅ Products page script loaded');