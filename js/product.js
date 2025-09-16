// js/product.js - FIXED Product JavaScript with no flash and flexible sizing
'use strict';

// Global state
var currentProduct = null;
var currentImageIndex = 0;
var productImages = [];
var cart = [];

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Product page initializing...');
    initializeProductPage();
});

async function initializeProductPage() {
    try {
        // Setup basic functionality first
        setupMobileMenu();
        setupSearch();
        loadCartFromStorage();
        updateCartCount();
        
        // Get product ID from URL
        const productId = getProductIdFromURL();
        console.log('1. Product ID from URL:', productId);
        
        if (!productId) {
            console.error('❌ NO PRODUCT ID FOUND');
            showError('No product specified. Please select a product.');
            return;
        }
        
        // Load product data from Supabase
        console.log('2. Loading product from database...');
        await loadProductFromDatabase(productId);
        
        console.log('✅ Product page initialization complete');
        
    } catch (error) {
        console.error('❌ Error initializing product page:', error);
        showError('Error loading product. Please try again.');
    }
}

// Get product ID from URL parameters
function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load specific product from Supabase database
async function loadProductFromDatabase(productId) {
    try {
        console.log(`🔍 Querying Supabase for product ID: ${productId}`);
        
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .eq('is_active', true)
            .single();
        
        console.log('📡 Supabase response:', { data, error });
        
        if (error) {
            console.error('❌ Supabase error:', error);
            if (error.code === 'PGRST116') {
                showError('Product not found.');
                return;
            }
            throw error;
        }
        
        if (!data) {
            console.error('❌ No product data returned');
            showError('Product not found.');
            return;
        }
        
        console.log(`✅ Product loaded: ${data.name}`);
        currentProduct = data;
        
        // Parse and display product
        parseAndDisplayProduct();
        
    } catch (error) {
        console.error('❌ Error loading product:', error);
        showError('Failed to load product details.');
    }
}

// Parse product data and display on page
function parseAndDisplayProduct() {
    if (!currentProduct) return;
    
    console.log('🎨 Parsing and displaying product...');
    
    // Check if product is out of stock first
    if (currentProduct.out_of_stock) {
        console.log('🚫 Product is marked as out of stock');
    }
    
    // Parse PostgreSQL arrays using config.js function
    productImages = parsePostgreSQLArray(currentProduct.images);
    const productFeatures = parsePostgreSQLArray(currentProduct.features);
    
    // Parse stock object for sizing - only if not out of stock
    let productStock = {};
    if (!currentProduct.out_of_stock) {
        try {
            if (typeof currentProduct.stock === 'string') {
                productStock = JSON.parse(currentProduct.stock);
            } else {
                productStock = currentProduct.stock || {};
            }
        } catch (e) {
            console.warn('Could not parse stock:', currentProduct.stock);
            productStock = {};
        }
    }
    
    console.log('📊 Parsed data:');
    console.log('- Images:', productImages);
    console.log('- Stock:', productStock);
    console.log('- Features:', productFeatures);
    console.log('- Out of Stock:', currentProduct.out_of_stock);
    
    // Update page title
    document.title = `${currentProduct.name} - Nourabelle`;
    
    // Show product layout and hide loading
    showProductContent();
    
    // Update all product elements
    updateProductInfo();
    updateProductImages();
    updateProductPricing();
    updateProductSizes(productStock); // This now handles out of stock
    updateProductFeatures(productFeatures);
    setupQuantityControls();
    
    console.log('✅ Product display complete');
}

// Show product content and hide loading
function showProductContent() {
    const loading = document.getElementById('productLoading');
    const layout = document.getElementById('productLayout');
    
    if (loading) loading.style.display = 'none';
    if (layout) layout.style.display = 'block';
}

// Update basic product information
function updateProductInfo() {
    updateElementText('product-category', currentProduct.category || 'Product');
    updateElementText('product-title', currentProduct.name);
    updateElementText('product-description', currentProduct.description || 'No description available');
}

// Update product images - FIXED to prevent flash
// UPDATED: Enhanced updateProductImages function with Out of Stock badge
function updateProductImages() {
    const mainImage = document.getElementById('product-image');
    const thumbnailContainer = document.getElementById('thumbnail-container');
    const productBadge = document.getElementById('product-badge');
    
    console.log('🖼️ Updating images. Found images:', productImages.length);
    
    if (productImages.length === 0) {
        console.warn('⚠️ No images found, using placeholder');
        if (mainImage) {
            mainImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
            mainImage.alt = currentProduct.name;
            mainImage.style.display = 'block';
        }
        if (thumbnailContainer) thumbnailContainer.style.display = 'none';
        return;
    }
    
    // Set main image to FIRST product image from database
    if (mainImage) {
        mainImage.src = productImages[0];
        mainImage.alt = currentProduct.name;
        mainImage.style.display = 'block';
        
        // Apply grayscale filter if out of stock
        if (currentProduct.out_of_stock) {
            mainImage.style.filter = 'grayscale(50%)';
        } else {
            mainImage.style.filter = 'none';
        }
        
        console.log('🖼️ Main image set to:', productImages[0]);
    }
    
    // Show appropriate badge
    if (productBadge) {
        if (currentProduct.out_of_stock) {
            productBadge.textContent = 'OUT OF STOCK';
            productBadge.style.display = 'block';
            productBadge.style.background = '#6c757d';
            productBadge.style.color = 'white';
        } else {
            const hasOriginalPrice = currentProduct.original_price && parseFloat(currentProduct.original_price) > parseFloat(currentProduct.price);
            if (hasOriginalPrice) {
                productBadge.textContent = 'SALE';
                productBadge.style.display = 'block';
                productBadge.style.background = '#e74c3c';
                productBadge.style.color = 'white';
            } else {
                productBadge.style.display = 'none';
            }
        }
    }
    
    // Setup thumbnails if multiple images
    if (productImages.length > 1 && thumbnailContainer) {
        const thumbnailsHtml = productImages.map((image, index) => 
            `<img src="${image}" alt="${currentProduct.name}" class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage(${index})" style="cursor: pointer; ${currentProduct.out_of_stock ? 'filter: grayscale(50%);' : ''}">`
        ).join('');
        
        thumbnailContainer.innerHTML = thumbnailsHtml;
        thumbnailContainer.style.display = 'flex';
        console.log(`🖼️ Created ${productImages.length} thumbnails`);
    } else if (thumbnailContainer) {
        thumbnailContainer.style.display = 'none';
    }
}



// Update product pricing
function updateProductPricing() {
    const priceElement = document.getElementById('product-price');
    const originalPriceElement = document.getElementById('original-price');
    
    const price = parseFloat(currentProduct.price) || 0;
    const originalPrice = currentProduct.original_price ? parseFloat(currentProduct.original_price) : null;
    const hasOriginalPrice = originalPrice && originalPrice > price;
    
    console.log('💰 Pricing - Current:', price, 'Original:', originalPrice, 'On Sale:', hasOriginalPrice);
    
    if (priceElement) {
        if (hasOriginalPrice) {
            priceElement.textContent = `${price} EGP`;
            priceElement.className = 'current-price on-sale';
        } else {
            priceElement.textContent = `${price} EGP`;
            priceElement.className = 'current-price';
        }
    }
    
    if (originalPriceElement) {
        if (hasOriginalPrice) {
            originalPriceElement.textContent = `${originalPrice} EGP`;
            originalPriceElement.style.display = 'inline';
        } else {
            originalPriceElement.style.display = 'none';
        }
    }
}
// Add this function to products.js
// In your js/products.js file, add this function after the existing functions

// Load categories from categories table for filter dropdown
async function loadCategoryFilters() {
    try {
        console.log('🔍 Loading categories from categories table...');
        
        const { data: categories, error } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('name');
        
        if (error) {
            console.error('❌ Error loading categories:', error);
            return;
        }
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter && categories) {
            // Clear and rebuild options
            categoryFilter.innerHTML = `
                <option value="all">All Categories</option>
                <option value="sale">Sale Items</option>
            `;
            
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.name.toLowerCase();
                option.textContent = cat.name.charAt(0).toUpperCase() + cat.name.slice(1);
                categoryFilter.appendChild(option);
            });
            
            console.log('✅ Loaded', categories.length, 'categories from categories table');
        }
        
    } catch (error) {
        console.error('❌ Error loading categories from categories table:', error);
        
        // Fallback to basic categories if database fails
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.innerHTML = `
                <option value="all">All Categories</option>
                <option value="sets">Sets</option>
                <option value="cardigans">Cardigans</option>
                <option value="sale">Sale Items</option>
            `;
        }
    }
}

// UPDATE your existing initializeProductsPage function - find this function and replace it:
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
        
        // Load products AND categories from Supabase
        console.log('1. Loading products and categories from database...');
        await Promise.all([
            loadAllProductsFromDatabase(),
            loadCategoryFilters()  // This loads from your categories table
        ]);
        
        // Hide loading state
        showLoadingState(false);
        
        console.log('✅ Products page initialization complete');
    } catch (error) {
        console.error('❌ Error initializing products page:', error);
        showLoadingState(false);
        showNoProducts('Error loading products. Please refresh the page.');
    }
}
// NEW: Handle Out of Stock toggle
function handleOutOfStockToggle() {
    const outOfStockCheckbox = document.getElementById('productOutOfStock');
    const sizeStockContainer = document.querySelector('.size-stock-container');
    const sizingSystemRadios = document.querySelectorAll('input[name="sizingSystem"]');
    
    if (!outOfStockCheckbox) return;
    
    const isOutOfStock = outOfStockCheckbox.checked;
    console.log('🚫 Out of Stock toggle:', isOutOfStock);
    
    if (isOutOfStock) {
        // Disable sizing system and stock inputs
        if (sizeStockContainer) {
            sizeStockContainer.classList.add('disabled');
        }
        
        // Disable sizing system radios
        sizingSystemRadios.forEach(radio => {
            radio.disabled = true;
        });
        
        // Clear all stock inputs
        clearAllSizeInputs();
        
        console.log('🚫 Product marked as out of stock - sizing disabled');
        
    } else {
        // Enable sizing system and stock inputs
        if (sizeStockContainer) {
            sizeStockContainer.classList.remove('disabled');
        }
        
        // Enable sizing system radios
        sizingSystemRadios.forEach(radio => {
            radio.disabled = false;
        });
        
        console.log('✅ Product unmarked as out of stock - sizing enabled');
    }
}
// FLEXIBLE SIZING SYSTEM - supports both S/M/L and S-M/L-XL
// In your product.js file, replace the updateProductSizes function with this:

// UPDATED: Enhanced updateProductSizes function with Free Size support
function updateProductSizes(stock) {
    const sizeSelect = document.getElementById('size');
    if (!sizeSelect) return;
    
    console.log('👗 Updating sizes with stock:', stock);
    
    // Check if product is out of stock
    if (currentProduct && currentProduct.out_of_stock) {
        sizeSelect.innerHTML = '<option value="">Out of Stock</option>';
        sizeSelect.disabled = true;
        
        const buyButton = document.getElementById('buy-button');
        if (buyButton) {
            buyButton.disabled = true;
            buyButton.textContent = 'Out of Stock';
            buyButton.style.background = '#6c757d';
            buyButton.style.cursor = 'not-allowed';
        }
        
        console.log('🚫 Product is out of stock - no size selection available');
        return;
    }
    
    // Get available sizes from stock keys
    const availableSizes = Object.keys(stock);
    
    // Check if this is Free Size system
    const hasFreeSize = availableSizes.some(size => 
        size === 'Free Size' || size === 'freesize' || size === 'FREESIZE'
    );
    
    if (hasFreeSize) {
        console.log('📏 Free Size system detected');
        handleFreeSizeSystem(stock);
        return;
    }
    
    // Handle regular sizing systems (Standard or Combined)
    handleRegularSizingSystem(stock, availableSizes);
}
function handleRegularSizingSystem(stock, availableSizes) {
    const sizeSelect = document.getElementById('size');
    
    // Define size order for proper sorting
    const sizeOrder = ['XS', 'S', 'S-M', 'M', 'L', 'L-XL', 'XL'];
    
    // Sort sizes according to the defined order
    const sortedSizes = availableSizes.sort((a, b) => {
        const indexA = sizeOrder.indexOf(a);
        const indexB = sizeOrder.indexOf(b);
        
        // If size not in predefined order, put it at the end
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
    });
    
    // Clear existing options
    sizeSelect.innerHTML = '';
    
    let hasStock = false;
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Size';
    sizeSelect.appendChild(defaultOption);
    
    sortedSizes.forEach(size => {
        const stockCount = stock[size] || 0;
        const option = document.createElement('option');
        option.value = size;
        option.textContent = stockCount > 0 ? 
            (stockCount < 2 ? `${size} (Low Stock)` : `${size}`) : 
            `${size} (Out of stock)`;
        option.disabled = stockCount === 0;
        
        if (stockCount > 0) hasStock = true;
        
        sizeSelect.appendChild(option);
    });
    
    // Update buy button based on stock
    const buyButton = document.getElementById('buy-button');
    if (buyButton) {
        buyButton.disabled = !hasStock;
        buyButton.textContent = hasStock ? 'Add to Cart' : 'Out of Stock';
        
        if (!hasStock) {
            buyButton.style.background = '#6c757d';
            buyButton.style.cursor = 'not-allowed';
        } else {
            buyButton.style.background = ''; // Reset to default
            buyButton.style.cursor = 'pointer';
        }
    }
    
    console.log('👗 Regular sizes updated in order:', sortedSizes, 'Has stock:', hasStock);
}

// NEW: Handle Free Size system
function handleFreeSizeSystem(stock) {
    const sizeSelect = document.getElementById('size');
    
    // Find the free size stock
    let freeSizeStock = 0;
    const freeSizeKeys = ['Free Size', 'freesize', 'FREESIZE'];
    
    for (const key of freeSizeKeys) {
        if (stock[key] !== undefined) {
            freeSizeStock = stock[key];
            break;
        }
    }
    
    // Clear existing options
    sizeSelect.innerHTML = '';
    
    // Add Free Size option
    const option = document.createElement('option');
    option.value = 'Free Size';
    
    if (freeSizeStock > 0) {
        option.textContent = freeSizeStock < 2 ? 'Free Size (Low Stock)' : 'Free Size';
        option.disabled = false;
    } else {
        option.textContent = 'Free Size (Out of stock)';
        option.disabled = true;
    }
    
    sizeSelect.appendChild(option);
    
    // Auto-select if in stock
    if (freeSizeStock > 0) {
        sizeSelect.value = 'Free Size';
    }
    
    // Update buy button
    const buyButton = document.getElementById('buy-button');
    if (buyButton) {
        buyButton.disabled = freeSizeStock === 0;
        buyButton.textContent = freeSizeStock > 0 ? 'Add to Cart' : 'Out of Stock';
        
        if (freeSizeStock === 0) {
            buyButton.style.background = '#6c757d';
            buyButton.style.cursor = 'not-allowed';
        } else {
            buyButton.style.background = ''; // Reset to default
            buyButton.style.cursor = 'pointer';
        }
    }
    
    console.log('📏 Free Size configured - Stock:', freeSizeStock);
}

// Update product features
function updateProductFeatures(features) {
    const featuresList = document.getElementById('features-list');
    if (!featuresList) return;
    
    console.log('⭐ Updating features:', features);
    
    if (!features || features.length === 0) {
        features = ['High-quality materials', 'Comfortable fit', 'Elegant design'];
    }
    
    const featuresHtml = features.map(feature => `<li>${feature}</li>`).join('');
    featuresList.innerHTML = featuresHtml;
}

// Change main image (for thumbnails)
window.changeMainImage = function(index) {
    if (!productImages[index]) return;
    
    const mainImage = document.getElementById('product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    if (mainImage) {
        mainImage.src = productImages[index];
        currentImageIndex = index;
        console.log('🖼️ Changed to image:', index);
    }
    
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
};

// Setup quantity controls
function setupQuantityControls() {
    const quantityInput = document.getElementById('quantity-input');
    if (quantityInput) {
        quantityInput.addEventListener('change', function() {
            const value = parseInt(this.value);
            if (value < 1) this.value = 1;
            if (value > 10) this.value = 10;
        });
    }
}

// Change quantity
window.changeQuantity = function(delta) {
    const quantityInput = document.getElementById('quantity-input');
    if (!quantityInput) return;
    
    const currentValue = parseInt(quantityInput.value) || 1;
    const newValue = Math.max(1, Math.min(10, currentValue + delta));
    quantityInput.value = newValue;
};

// Add to cart
window.addToCart = function() {
    if (!currentProduct) {
        alert('Product not loaded');
        return;
    }
    
    // Check if product is out of stock
    if (currentProduct.out_of_stock) {
        alert('This product is currently out of stock');
        return;
    }
    
    const sizeSelect = document.getElementById('size');
    const quantityInput = document.getElementById('quantity-input');
    
    const selectedSize = sizeSelect ? sizeSelect.value : '';
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    if (!selectedSize) {
        alert('Please select a size');
        return;
    }
    
    console.log('🛒 Adding to cart:', currentProduct.name, selectedSize, quantity);
    
    // Load existing cart
    loadCartFromStorage();
    
    const existingItemIndex = cart.findIndex(item => 
        item.id === currentProduct.id && item.size === selectedSize
    );
    
    const mainImage = productImages.length > 0 ? productImages[0] : '';
    
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: parseFloat(currentProduct.price),
            size: selectedSize,
            quantity: quantity,
            image: mainImage,
            category: currentProduct.category
        });
    }
    
    saveCartToStorage();
    updateCartCount();
    
    // Show success message
    showNotification(`${currentProduct.name} added to cart!`);
    console.log('✅ Added to cart successfully');
};

// Update element text content safely
function updateElementText(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = content;
    } else {
        console.warn(`Element with ID '${id}' not found`);
    }
}

// Show error message
function showError(message) {
    console.error('❌ Showing error:', message);
    const loading = document.getElementById('productLoading');
    const layout = document.getElementById('productLayout');
    
    if (loading) loading.style.display = 'none';
    if (layout) layout.style.display = 'none';
    
    const productDetail = document.querySelector('.product-detail');
    if (productDetail) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'text-align: center; padding: 4rem 2rem;';
        errorDiv.innerHTML = `
            <h2 style="color: #e74c3c; margin-bottom: 1rem;">Error</h2>
            <p style="color: #666; margin-bottom: 2rem;">${message}</p>
            <a href="products.html" style="display: inline-block; padding: 12px 30px; background: var(--btn); color: white; text-decoration: none; border-radius: 25px;">Browse Products</a>
        `;
        productDetail.appendChild(errorDiv);
    }
}

// Show notification
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

// Cart functions
function loadCartFromStorage() {
    try {
        const cartData = localStorage.getItem('nourabelle_cart');
        cart = cartData ? JSON.parse(cartData) : [];
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('nourabelle_cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.classList.toggle('visible', totalItems > 0);
}

// Mobile menu setup
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');
    
    if (!hamburger || !mobileMenu || !mobileClose) return;
    
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
}

function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            window.location.href = 'products.html';
        });
    }
}

// Add CSS animations
if (!document.getElementById('product-animations')) {
    const style = document.createElement('style');
    style.id = 'product-animations';
    style.textContent = `
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

console.log('✅ Product page script loaded');