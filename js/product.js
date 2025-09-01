// Debug Product Detail Page JavaScript - Lots of Console Logging

'use strict';

console.log('🚀 PRODUCT PAGE SCRIPT STARTED');

// Supabase Configuration
const SUPABASE_URL = 'https://ebiwoiaduskjodegnhvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaXdvaWFkdXNram9kZWduaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQ5OTEsImV4cCI6MjA3MjE3MDk5MX0.tuWREO0QuDKfgJQ6fbVpi4UI9ckKUYlqoCy3g2_cJW8';

console.log('🔧 Initializing Supabase...');

// Initialize Supabase
let supabase = null;
try {
  if (window.supabase) {
    console.log('✅ Supabase library found');
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client created');
  } else {
    console.error('❌ Supabase library not found - check if script is loaded');
  }
} catch (error) {
  console.error('❌ Supabase initialization failed:', error);
}

// State management
let currentProduct = null;
let selectedSize = 'Medium';
let quantity = 1;
let activeImageIndex = 0;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  console.log('📄 DOM LOADED - Starting product page initialization');
  console.log('🌐 Current URL:', window.location.href);
  console.log('📋 URL Search Params:', window.location.search);
  
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product');
  console.log('🆔 Product ID from URL:', productId);
  
  if (!productId) {
    console.error('❌ NO PRODUCT ID FOUND IN URL');
    alert('No product ID found. Redirecting to products page.');
    window.location.href = 'products.html';
    return;
  }
  
  loadProductFromDatabase(productId);
  setupEventListeners();
  updateCartCount();
});

async function loadProductFromDatabase(productId) {
  console.log('🔍 LOADING PRODUCT:', productId);
  
  try {
    // Show loading message immediately
    showLoadingMessage('Loading product details...');
    
    if (!supabase) {
      console.error('❌ Supabase not initialized');
      showErrorMessage('Database connection failed');
      return;
    }
    
    console.log('📡 Fetching from database...');
    
    // Fetch product from Supabase
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();
    
    console.log('📦 Database response:', { data: product, error: error });
    
    if (error) {
      console.error('❌ Database error:', error);
      if (error.code === 'PGRST116') {
        showErrorMessage('Product not found');
      } else {
        showErrorMessage('Database error: ' + error.message);
      }
      return;
    }
    
    if (!product) {
      console.error('❌ No product returned from database');
      showErrorMessage('Product not found');
      return;
    }

    console.log('✅ Product found in database:', product);
    
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
      stock: product.stock || {}
    };
    
    console.log('✅ Product converted:', currentProduct);
    
    // Render the product
    renderProduct();
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    showErrorMessage('Unexpected error: ' + error.message);
  }
}

function showLoadingMessage(message) {
  console.log('⏳ Showing loading:', message);
  const productLayout = document.querySelector('.product-layout');
  if (productLayout) {
    productLayout.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: #666; font-family: var(--font);">
        <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid var(--btn); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem;"></div>
        <p>${message}</p>
      </div>
    `;
    console.log('✅ Loading message displayed');
  } else {
    console.error('❌ Could not find .product-layout element');
  }
}

function showErrorMessage(message) {
  console.log('⚠️ Showing error:', message);
  const productLayout = document.querySelector('.product-layout');
  if (productLayout) {
    productLayout.innerHTML = `
      <div style="grid-column: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 4rem 2rem; font-family: var(--font);">
        <h1 style="font-size: 2rem; color: #e74c3c; margin-bottom: 1rem;">Error</h1>
        <p style="color: #666; margin-bottom: 2rem; font-size: 1.1rem;">${message}</p>
        <a href="products.html" style="background: var(--btn); color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Back to Products</a>
      </div>
    `;
    console.log('✅ Error message displayed');
  } else {
    console.error('❌ Could not find .product-layout element');
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
  console.log('🎨 RENDERING PRODUCT:', currentProduct.name);
  
  if (!currentProduct) {
    console.error('❌ No current product to render');
    return;
  }

  // Update page title
  document.title = `${currentProduct.name} - Nourabelle`;
  console.log('📄 Page title updated');

  // Clear any loading/error messages first
  const productLayout = document.querySelector('.product-layout');
  if (productLayout && productLayout.innerHTML.includes('Loading') || productLayout.innerHTML.includes('Error')) {
    console.log('🧹 Clearing loading/error message');
    // Reset to original structure - you may need to adjust this based on your HTML
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
            <option value="Small">Small</option>
            <option value="Medium" selected>Medium</option>
            <option value="Large">Large</option>
          </select>
        </div>
        <div class="quantity-section">
          <label for="quantity">Quantity:</label>
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="changeQuantity(-1)">−</button>
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
  const categoryEl = document.getElementById('product-category');
  const titleEl = document.getElementById('product-title');
  const descriptionEl = document.getElementById('product-description');
  
  if (categoryEl) {
    categoryEl.textContent = currentProduct.category.charAt(0).toUpperCase() + currentProduct.category.slice(1);
    console.log('✅ Category updated:', categoryEl.textContent);
  } else {
    console.warn('⚠️ Category element not found');
  }
  
  if (titleEl) {
    titleEl.textContent = currentProduct.name;
    console.log('✅ Title updated:', titleEl.textContent);
  } else {
    console.warn('⚠️ Title element not found');
  }
  
  if (descriptionEl) {
    descriptionEl.textContent = currentProduct.description;
    console.log('✅ Description updated');
  } else {
    console.warn('⚠️ Description element not found');
  }

  // Update price
  const priceEl = document.getElementById('product-price');
  if (priceEl) {
    priceEl.textContent = `${currentProduct.price} EGP`;
    console.log('✅ Price updated:', priceEl.textContent);
  } else {
    console.warn('⚠️ Price element not found');
  }
  
  const originalPrice = document.getElementById('original-price');
  if (currentProduct.originalPrice && originalPrice) {
    originalPrice.textContent = `${currentProduct.originalPrice} EGP`;
    originalPrice.style.display = 'inline';
    console.log('✅ Original price shown');
  } else if (originalPrice) {
    originalPrice.style.display = 'none';
  }

  // Update badge
  const badge = document.getElementById('product-badge');
  if (badge) {
    if (currentProduct.badge) {
      badge.textContent = currentProduct.badge.toUpperCase();
      badge.style.display = 'block';
      console.log('✅ Badge shown:', currentProduct.badge);
    } else {
      badge.style.display = 'none';
    }
  }

  // Update main image
  const mainImage = document.getElementById('product-image');
  if (mainImage) {
    if (currentProduct.images && currentProduct.images.length > 0) {
      console.log('🖼️ Setting main image:', currentProduct.images[0]);
      mainImage.src = currentProduct.images[0];
      mainImage.alt = currentProduct.name;
      
      mainImage.onload = function() {
        console.log('✅ Main image loaded successfully');
      };
      
      mainImage.onerror = function() {
        console.warn('⚠️ Main image failed to load, using placeholder');
        this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
      };
    } else {
      console.warn('⚠️ No images available, using placeholder');
      mainImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE2Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    }
  } else {
    console.error('❌ Main image element not found');
  }

  // Update features
  const featuresList = document.getElementById('features-list');
  if (featuresList && currentProduct.features) {
    featuresList.innerHTML = currentProduct.features.map(feature => `<li>${feature}</li>`).join('');
    console.log('✅ Features updated');
  } else {
    console.warn('⚠️ Features list element not found');
  }

  console.log('🎉 PRODUCT RENDERING COMPLETE');
}

// Basic functions
function setupEventListeners() {
  console.log('🎧 Setting up event listeners...');
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
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
  console.log('🛒 Cart count updated:', count);
}

// Quantity controls
function changeQuantity(change) {
  const input = document.getElementById('quantity-input');
  quantity = Math.max(1, Math.min(10, quantity + change));
  if (input) input.value = quantity;
  console.log('🔢 Quantity changed to:', quantity);
}

// Add to cart function  
function addToCart() {
  console.log('🛒 Add to cart clicked');
  if (!currentProduct) {
    console.error('❌ No product to add');
    return;
  }
  
  alert(`Added ${currentProduct.name} to cart!`);
}

// Global functions for onclick
window.changeQuantity = changeQuantity;
window.addToCart = addToCart;

// Add loading animation CSS
if (!document.getElementById('debug-animations')) {
  const style = document.createElement('style');
  style.id = 'debug-animations';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

console.log('🏁 PRODUCT PAGE SCRIPT LOADED SUCCESSFULLY');