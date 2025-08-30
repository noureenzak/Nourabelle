// Products Page JavaScript - Fixed Navigation and Consistent with Index

'use strict';

// Product data with correct image paths and dates for sorting
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
    dateAdded: '2024-01-20'
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
    dateAdded: '2024-01-15'
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
    dateAdded: '2024-01-10'
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
    dateAdded: '2024-01-12'
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
    dateAdded: '2024-01-08'
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
    dateAdded: '2024-01-18'
  }
];

// State management
let currentProducts = [...PRODUCTS];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  renderProducts();
  updateCartCount();
});


function setupEventListeners() {
  // Category filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', handleFilters);
  }

  // Sort filter
  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) {
    sortFilter.addEventListener('change', handleFilters);
  }

  // Mobile menu
  setupMobileMenu();
  
  // Search functionality
  setupSearch();
}

function handleFilters() {
  const categoryFilter = document.getElementById('categoryFilter');
  const sortFilter = document.getElementById('sortFilter');
  
  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  const selectedSort = sortFilter ? sortFilter.value : 'newest';
  
  // Filter products
  if (selectedCategory === 'all') {
    currentProducts = [...PRODUCTS];
  } else if (selectedCategory === 'sale') {
    currentProducts = PRODUCTS.filter(p => p.badge === 'sale' || p.originalPrice);
  } else {
    currentProducts = PRODUCTS.filter(p => p.category === selectedCategory);
  }
  
  // Sort products
  currentProducts.sort((a, b) => {
    switch (selectedSort) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'oldest':
        return new Date(a.dateAdded) - new Date(b.dateAdded);
      case 'sale':
        // Sale items first, then by date
        if (a.originalPrice && !b.originalPrice) return -1;
        if (!a.originalPrice && b.originalPrice) return 1;
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      case 'newest':
      default:
        return new Date(b.dateAdded) - new Date(a.dateAdded);
    }
  });
  
  renderProducts();
}

function renderProducts() {
  const productsGrid = document.getElementById('productsGrid');
  const noProducts = document.getElementById('noProducts');
  
  if (currentProducts.length === 0) {
    productsGrid.style.display = 'none';
    noProducts.style.display = 'block';
    return;
  }

  noProducts.style.display = 'none';
  productsGrid.style.display = 'grid';
  
  productsGrid.innerHTML = currentProducts.map(product => createProductCard(product)).join('');
  
  // Setup product interactions
  setupProductInteractions();
}

function createProductCard(product) {
  let priceHTML;
  if (product.originalPrice) {
    priceHTML = `
      <p class="price-sale">
        <span class="current-price">${product.price} EGP</span>
        <span class="original-price">${product.originalPrice} EGP</span>
      </p>
    `;
  } else {
    priceHTML = `<p class="price">${product.price} EGP</p>`;
  }

  return `
    <div class="product-item" onclick="goToProduct('${product.id}')">
      <img src="${product.image}" alt="${product.name}">
      <p>${product.name}</p>
      ${priceHTML}
    </div>
  `;
}

function setupProductInteractions() {
  // Setup image hover effects
  document.querySelectorAll('.product-item').forEach(item => {
    const img = item.querySelector('img');
    const productId = item.getAttribute('onclick').match(/'([^']+)'/)[1];
    const product = PRODUCTS.find(p => p.id === productId);
    
    if (product && product.images.length > 1) {
      let currentImageIndex = 0;
      let hoverInterval;
      
      item.addEventListener('mouseenter', () => {
        hoverInterval = setInterval(() => {
          currentImageIndex = (currentImageIndex + 1) % product.images.length;
          img.src = product.images[currentImageIndex];
        }, 1500);
      });
      
      item.addEventListener('mouseleave', () => {
        clearInterval(hoverInterval);
        currentImageIndex = 0;
        img.src = product.images[0];
      });
    }
  });
}

// Product navigation - FIXED to absolute relative path
function goToProduct(productId) {
  window.location.href = '/pages/product.html?product=' + productId;
}

// Cart management functions - keeping all your existing functionality
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
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

// Utility functions
function showNotification(message) {
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

// Mobile menu setup - keeping your existing functionality
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
  
  // Close menu when clicking outside
  if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
      }
    });
  }
}

// Search functionality - keeping your existing functionality
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
      <div class="search-result" onclick="goToProduct('${product.id}')" style="
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

  // Close search when clicking overlay
  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) closeSearch();
    });
  }

  // Close on escape
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
if (!document.getElementById('products-animations')) {
  const style = document.createElement('style');
  style.id = 'products-animations';
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

// Global function for onclick in HTML
window.goToProduct = goToProduct;