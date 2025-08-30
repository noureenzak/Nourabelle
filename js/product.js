// Product Detail Page JavaScript - WITH DEBUG LOGS

'use strict';

// Product data with CORRECT image paths for pages directory
const PRODUCTS = [
  {
    id: 'whiteset',
    name: 'Elegant White Set',
    price: 1500,
    originalPrice: null,
    image: '../assets/images/whiteset1.jpg',
    images: ['../assets/images/whiteset1.jpg', '../assets/images/whiteset2.jpg', '../assets/images/whiteset3.jpg'],
    category: 'sets',
    badge: 'new',
    description: 'Elegant and modest white two-piece set. Soft fabric, breathable design, perfect for daily wear.',
    features: [
      'Soft, breathable cotton blend fabric',
      'Modest and elegant design',
      'Perfect for daily wear',
      'Relaxed fit for all body types',
      'Easy care - machine washable'
    ]
  },
  {
    id: 'blackset',
    name: 'Classic Black Set',
    price: 1500,
    originalPrice: null,
    image: '../assets/images/blackset1.jpg',
    images: ['../assets/images/blackset1.jpg', '../assets/images/blackset2.jpg'],
    category: 'sets',
    badge: null,
    description: 'Classic black set with a sleek and minimal cut, ideal for any occasion.',
    features: [
      'Classic timeless design',
      'Versatile styling options',
      'Premium quality fabric',
      'Comfortable all-day wear',
      'Professional appearance'
    ]
  },
  {
    id: 'browncardigan',
    name: 'Cozy Brown Cardigan',
    price: 1275,
    originalPrice: 1500,
    image: '../assets/images/browncardigan1.jpg',
    images: ['../assets/images/browncardigan1.jpg', '../assets/images/browncardigan2.jpg'],
    category: 'cardigans',
    badge: 'sale',
    description: 'Cozy brown cardigan with flowy fit. Perfect as a layering piece in all seasons.',
    features: [
      'Flowy, flattering silhouette',
      'Perfect for layering',
      'All-season versatility',
      'Cozy, soft material',
      'Earth-tone color palette'
    ]
  },
  {
    id: 'blackcardigan',
    name: 'Timeless Black Cardigan',
    price: 1500,
    originalPrice: null,
    image: '../assets/images/blackcardigan1.jpg',
    images: ['../assets/images/blackcardigan1.jpg', '../assets/images/blackcardigan2.jpg'],
    category: 'cardigans',
    badge: null,
    description: 'Timeless black cardigan with soft material and flattering shape.',
    features: [
      'Timeless, versatile design',
      'Soft, premium material',
      'Flattering silhouette',
      'Professional appearance',
      'Easy to style'
    ]
  },
  {
    id: 'beigeset',
    name: 'Soft Beige Set',
    price: 1500,
    originalPrice: null,
    image: '../assets/images/beigeset1.jpg',
    images: ['../assets/images/beigeset1.jpg', '../assets/images/beigeset2.jpg'],
    category: 'sets',
    badge: null,
    description: 'Soft beige two-piece set with relaxed fit and modern modest cut.',
    features: [
      'Relaxed, comfortable fit',
      'Modern modest styling',
      'Soft, breathable fabric',
      'Neutral, versatile color',
      'Contemporary design'
    ]
  },
  {
    id: 'blueset',
    name: 'Fresh Blue Set',
    price: 1500,
    originalPrice: null,
    image: '../assets/images/blueset1.jpg',
    images: ['../assets/images/blueset1.jpg', '../assets/images/blueset2.jpg'],
    category: 'sets',
    badge: null,
    description: 'Calm and fresh blue set, light and breathable — perfect for summer days.',
    features: [
      'Light and breathable fabric',
      'Perfect for summer wear',
      'Fresh, calming color',
      'Comfortable design',
      'Moisture-wicking properties'
    ]
  }
];

// State management
let currentProduct = null;
let selectedSize = 'Medium';
let quantity = 1;
let activeImageIndex = 0;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  console.log('=== PRODUCT PAGE DEBUG START ===');
  console.log('Current URL:', window.location.href);
  console.log('URL Search Params:', window.location.search);
  
  loadProductFromURL();
  setupEventListeners();
  updateCartCount();
});

function loadProductFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product');
  
  console.log('🔍 Loading product ID:', productId);
  console.log('🔍 Available products:', PRODUCTS.map(p => p.id));
  
  if (!productId) {
    console.error('❌ No product ID in URL');
    window.location.href = 'products.html';
    return;
  }

  currentProduct = PRODUCTS.find(p => p.id === productId);
  
  if (!currentProduct) {
    console.error('❌ Product not found:', productId);
    showProductNotFound();
    return;
  }

  console.log('✅ Product found:', currentProduct);
  renderProduct();
}

function renderProduct() {
  if (!currentProduct) {
    console.error('❌ No current product to render');
    return;
  }

  console.log('🎨 Rendering product:', currentProduct.name);

  // Update page title
  document.title = `${currentProduct.name} - Nourabelle`;

  // Update product info
  const categoryEl = document.getElementById('product-category');
  const titleEl = document.getElementById('product-title');
  const descriptionEl = document.getElementById('product-description');
  
  console.log('📝 Updating text elements...');
  if (categoryEl) {
    categoryEl.textContent = currentProduct.category.charAt(0).toUpperCase() + currentProduct.category.slice(1);
    console.log('✅ Category updated');
  }
  if (titleEl) {
    titleEl.textContent = currentProduct.name;
    console.log('✅ Title updated');
  }
  if (descriptionEl) {
    descriptionEl.textContent = currentProduct.description;
    console.log('✅ Description updated');
  }

  // Update price
  const priceEl = document.getElementById('product-price');
  if (priceEl) {
    priceEl.textContent = `${currentProduct.price} EGP`;
    console.log('✅ Price updated');
  }
  
  const originalPrice = document.getElementById('original-price');
  if (currentProduct.originalPrice) {
    if (originalPrice) {
      originalPrice.textContent = `${currentProduct.originalPrice} EGP`;
      originalPrice.style.display = 'inline';
      console.log('✅ Original price shown');
    }
  } else {
    if (originalPrice) originalPrice.style.display = 'none';
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

  // Update main image with EXTENSIVE debugging
  const mainImage = document.getElementById('product-image');
  if (mainImage && currentProduct.images && currentProduct.images.length > 0) {
    const imagePath = currentProduct.images[0];
    console.log('🖼️ Setting main image...');
    console.log('Image path:', imagePath);
    console.log('Current page location:', window.location.pathname);
    console.log('Expected full path:', window.location.origin + window.location.pathname.replace('product.html', '') + imagePath);
    
    // Test if image exists before setting
    const testImg = new Image();
    testImg.onload = function() {
      console.log('✅ Image loaded successfully:', imagePath);
      mainImage.src = imagePath;
    };
    testImg.onerror = function() {
      console.error('❌ Image failed to load:', imagePath);
      // Try alternative paths
      const altPaths = [
        imagePath.replace('../assets/', 'assets/'),
        imagePath.replace('../assets/', '../assets/'),
        imagePath.replace('../', '')
      ];
      
      console.log('🔄 Trying alternative paths:', altPaths);
      tryAlternativePaths(mainImage, altPaths, 0);
    };
    testImg.src = imagePath;
    
    mainImage.alt = currentProduct.name;
  } else {
    console.error('❌ Main image element not found or no images in product');
  }

  // Render thumbnails
  renderThumbnails();

  // Update features
  renderFeatures();
}

function tryAlternativePaths(imgElement, paths, index) {
  if (index >= paths.length) {
    console.error('❌ All image paths failed');
    imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjVmNWY1Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LXNpemU9IjE2Ij5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+Cjwvc3ZnPg==';
    return;
  }

  const testImg = new Image();
  testImg.onload = function() {
    console.log('✅ Alternative path worked:', paths[index]);
    imgElement.src = paths[index];
  };
  testImg.onerror = function() {
    console.log('❌ Alternative path failed:', paths[index]);
    tryAlternativePaths(imgElement, paths, index + 1);
  };
  testImg.src = paths[index];
}

function renderThumbnails() {
  const container = document.getElementById('thumbnail-container');
  if (!container || !currentProduct.images || currentProduct.images.length <= 1) {
    if (container) container.style.display = 'none';
    console.log('📸 No thumbnails to show');
    return;
  }

  console.log('📸 Rendering thumbnails...');
  container.style.display = 'flex';
  container.innerHTML = currentProduct.images.map((image, index) => {
    console.log(`Thumbnail ${index}:`, image);
    return `
      <img src="${image}" 
           alt="${currentProduct.name} ${index + 1}" 
           class="thumbnail ${index === activeImageIndex ? 'active' : ''}"
           onclick="selectImage(${index})"
           onerror="console.error('Thumbnail failed:', this.src); this.style.display='none';">
    `;
  }).join('');
}

function renderFeatures() {
  const featuresList = document.getElementById('features-list');
  if (featuresList && currentProduct.features) {
    featuresList.innerHTML = currentProduct.features.map(feature => `<li>${feature}</li>`).join('');
    console.log('✅ Features updated');
  }
}

function setupEventListeners() {
  console.log('🎯 Setting up event listeners...');
  
  // Size selection
  const sizeSelect = document.getElementById('size');
  if (sizeSelect) {
    sizeSelect.addEventListener('change', (e) => {
      selectedSize = e.target.value;
      console.log('📏 Size selected:', selectedSize);
    });
  }

  // Quantity controls
  const quantityInput = document.getElementById('quantity-input');
  if (quantityInput) {
    quantityInput.addEventListener('change', (e) => {
      quantity = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
      quantityInput.value = quantity;
      console.log('🔢 Quantity changed:', quantity);
    });
  }

  // Mobile menu
  setupMobileMenu();
  
  // Search functionality
  setupSearch();
}

// Image selection
function selectImage(index) {
  if (!currentProduct || !currentProduct.images) return;
  
  console.log('🖼️ Selecting image index:', index);
  activeImageIndex = index;
  const mainImage = document.getElementById('product-image');
  if (mainImage) {
    console.log('Setting image to:', currentProduct.images[index]);
    mainImage.src = currentProduct.images[index];
  }
  
  // Update thumbnail active state
  document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

// Quantity controls
function changeQuantity(change) {
  const input = document.getElementById('quantity-input');
  const newQuantity = Math.max(1, Math.min(10, quantity + change));
  quantity = newQuantity;
  if (input) input.value = newQuantity;
  console.log('🔢 Quantity changed to:', quantity);
}

// Add to cart function
function addToCart() {
  if (!currentProduct) {
    console.error('❌ No product to add to cart');
    return;
  }

  console.log('🛒 Adding to cart:', currentProduct.name, 'Size:', selectedSize, 'Qty:', quantity);

  const cartItem = {
    id: currentProduct.id,
    name: currentProduct.name,
    price: currentProduct.price,
    image: currentProduct.image,
    size: selectedSize,
    quantity: quantity,
    category: currentProduct.category
  };

  // Add to cart
  let cart = JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
  
  // Check if item already exists with same size
  const existingIndex = cart.findIndex(item => 
    item.id === cartItem.id && item.size === cartItem.size
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += cartItem.quantity;
    console.log('📦 Updated existing cart item');
  } else {
    cart.push(cartItem);
    console.log('📦 Added new cart item');
  }

  localStorage.setItem('nourabelle_cart', JSON.stringify(cart));
  console.log('💾 Cart saved:', cart);

  // Visual feedback
  const button = document.getElementById('buy-button');
  if (button) {
    const originalText = button.innerHTML;
    
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      Added to Cart!
    `;
    button.style.background = '#27ae60';
    
    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.background = 'var(--btn)';
    }, 2000);
  }

  // Update cart count
  updateCartCount();

  // Show notification
  showNotification(`${currentProduct.name} added to cart!`);
}

// Utility functions
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  
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
  console.log('🛒 Cart count updated:', count);
}

function showNotification(message) {
  console.log('🔔 Showing notification:', message);
  
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notif => notif.remove());

  const notification = document.createElement('div');
  notification.className = 'notification';
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
    animation: slideInRight 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 300px;
    font-family: var(--font);
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

function showProductNotFound() {
  console.log('❌ Showing product not found page');
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem; font-family: var(--font);">
      <h1 style="font-size: 2rem; color: var(--btn); margin-bottom: 1rem;">Product Not Found</h1>
      <p style="color: #666; margin-bottom: 2rem;">The product you're looking for doesn't exist or has been removed.</p>
      <a href="products.html" style="background: var(--btn); color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Browse Products</a>
    </div>
  `;
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
  const searchResults = document.getElementById('searchResults');

  if (!searchBtn || !searchOverlay) return;

  function openSearch() {
    searchOverlay.classList.add('open');
    setTimeout(() => searchInput && searchInput.focus(), 100);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
  }

  function performSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (query.length < 2) {
      searchResults.innerHTML = '';
      return;
    }

    const results = PRODUCTS.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );

    displaySearchResults(results);
  }

  function displaySearchResults(results) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No products found</div>';
      return;
    }

    searchResults.innerHTML = results.map(product => `
      <div class="search-result" onclick="window.location.href='product.html?product=${product.id}'" style="
        display: flex;
        align-items: center;
        padding: 15px 20px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        transition: background 0.3s;
      " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background=''">
        <img src="${product.image}" alt="${product.name}" style="
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
          margin-right: 15px;
        ">
        <div>
          <div style="font-weight: 500; margin-bottom: 4px;">${product.name}</div>
          <div style="color: var(--btn); font-weight: 600;">${product.price} EGP</div>
        </div>
      </div>
    `).join('');
  }

  if (searchBtn) searchBtn.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchInput) {
    searchInput.addEventListener('input', debounce(performSearch, 300));
  }

  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('open')) {
      closeSearch();
    }
  });
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add CSS animations
if (!document.getElementById('product-animations')) {
  const style = document.createElement('style');
  style.id = 'product-animations';
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

// Global functions for HTML onclick events
window.selectImage = selectImage;
window.changeQuantity = changeQuantity;
window.addToCart = addToCart;

console.log('=== PRODUCT JS LOADED ===');