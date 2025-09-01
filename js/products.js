// Products Page JavaScript - Database Only (No Fallbacks)

'use strict';

// Supabase Configuration
const SUPABASE_URL = 'https://ebiwoiaduskjodegnhvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaXdvaWFkdXNram9kZWduaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQ5OTEsImV4cCI6MjA3MjE3MDk5MX0.tuWREO0QuDKfgJQ6fbVpi4UI9ckKUYlqoCy3g2_cJW8';

// Initialize Supabase
let supabase = null;
try {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('Supabase initialized successfully');
} catch (error) {
  console.error('Supabase initialization failed:', error);
}

// State management
let allProducts = [];
let currentProducts = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  console.log('Products page initializing...');
  setupEventListeners();
  loadProductsFromDatabase();
  updateCartCount();
});

// Load products from database ONLY
async function loadProductsFromDatabase() {
  const loadingState = document.getElementById('loadingState');
  const productsGrid = document.getElementById('productsGrid');
  const noProducts = document.getElementById('noProducts');
  
  try {
    // Show loading
    if (loadingState) loadingState.style.display = 'block';
    if (productsGrid) productsGrid.style.display = 'none';
    if (noProducts) noProducts.style.display = 'none';
    
    console.log('Loading products from database...');
    
    if (!supabase) {
      throw new Error('Database not available');
    }
    
    // Fetch products from Supabase
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    
    console.log('Products fetched:', products?.length || 0);
    
    if (!products || products.length === 0) {
      // No products in database
      allProducts = [];
      currentProducts = [];
      
      if (loadingState) loadingState.style.display = 'none';
      if (noProducts) noProducts.style.display = 'block';
      if (productsGrid) productsGrid.style.display = 'none';
      
      console.log('No products found in database');
      return;
    }
    
    // Convert database products to display format
    allProducts = products.map(product => ({
      id: product.id,
      name: product.name || 'Untitled Product',
      price: product.price || 0,
      originalPrice: product.original_price || null,
      image: (product.images && product.images.length > 0) ? product.images[0] : null,
      images: product.images || [],
      category: product.category || 'uncategorized',
      badge: getBadge(product),
      description: product.description || 'No description available',
      dateAdded: product.created_at || new Date().toISOString(),
      stock: product.stock || {}
    }));
    
    currentProducts = [...allProducts];
    
    console.log('Products processed:', allProducts.length);
    
    // Hide loading and show products
    if (loadingState) loadingState.style.display = 'none';
    if (productsGrid) productsGrid.style.display = 'grid';
    if (noProducts) noProducts.style.display = 'none';
    
    renderProducts(currentProducts);
    
  } catch (error) {
    console.error('Error loading products:', error);
    
    // Show error state
    if (loadingState) loadingState.style.display = 'none';
    if (noProducts) {
      noProducts.style.display = 'block';
      noProducts.innerHTML = `
        <h3>Error Loading Products</h3>
        <p>Unable to connect to database. Please try refreshing the page.</p>
      `;
    }
    if (productsGrid) productsGrid.style.display = 'none';
    
    allProducts = [];
    currentProducts = [];
  }
}

// Determine product badge
function getBadge(product) {
  if (product.featured) {
    return 'featured';
  } else if (product.original_price && product.price < product.original_price) {
    return 'sale';
  }
  return null;
}

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
    currentProducts = [...allProducts];
  } else if (selectedCategory === 'sale') {
    currentProducts = allProducts.filter(p => p.badge === 'sale' || p.originalPrice);
  } else {
    currentProducts = allProducts.filter(p => p.category === selectedCategory);
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
        if (a.originalPrice && !b.originalPrice) return -1;
        if (!a.originalPrice && b.originalPrice) return 1;
        return new Date(b.dateAdded) - new Date(a.dateAdded);
      case 'newest':
      default:
        return new Date(b.dateAdded) - new Date(a.dateAdded);
    }
  });
  
  renderProducts(currentProducts);
}

function renderProducts(products) {
  const productsGrid = document.getElementById('productsGrid');
  const noProducts = document.getElementById('noProducts');
  
  if (!productsGrid) return;
  
  if (products.length === 0) {
    productsGrid.style.display = 'none';
    if (noProducts) noProducts.style.display = 'block';
    return;
  }

  if (noProducts) noProducts.style.display = 'none';
  productsGrid.style.display = 'grid';
  
  productsGrid.innerHTML = products.map(product => createProductCard(product)).join('');
  
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

  const imageUrl = product.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjEyNSIgeT0iMTI1IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  return `
    <div class="product-item" onclick="goToProduct('${product.id}')">
      <img src="${imageUrl}" alt="${product.name}" 
           onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjI1MCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjEyNSIgeT0iMTI1IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">
      <p>${product.name}</p>
      ${priceHTML}
      ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
    </div>
  `;
}

function setupProductInteractions() {
  document.querySelectorAll('.product-item').forEach(item => {
    const img = item.querySelector('img');
    const productId = item.getAttribute('onclick').match(/'([^']+)'/)[1];
    const product = allProducts.find(p => p.id.toString() === productId);
    
    if (product && product.images && product.images.length > 1) {
      let currentImageIndex = 0;
      let hoverInterval;
      
      item.addEventListener('mouseenter', () => {
        hoverInterval = setInterval(() => {
          currentImageIndex = (currentImageIndex + 1) % product.images.length;
          if (product.images[currentImageIndex]) {
            img.src = product.images[currentImageIndex];
          }
        }, 1500);
      });
      
      item.addEventListener('mouseleave', () => {
        clearInterval(hoverInterval);
        currentImageIndex = 0;
        img.src = product.images[0] || product.image;
      });
    }
  });
}

// Navigate to product page (uses your existing product.html)
function goToProduct(productId) {
  console.log('Navigating to product:', productId);
  window.location.href = `product.html?product=${encodeURIComponent(productId)}`;
}

// Cart management
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

    const results = allProducts.filter(product => 
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
        <img src="${product.image || ''}" alt="${product.name}" style="
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 4px;
          margin-right: 15px;
        " onerror="this.style.display='none'">
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
    .product-badge {
      position: absolute;
      top: 0.5rem;
      left: 0.5rem;
      background: var(--btn);
      color: white;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      border-radius: 4px;
      z-index: 1;
    }
    .product-badge.sale {
      background: #e74c3c;
    }
    .product-badge.featured {
      background: #f39c12;
    }
    .product-item {
      position: relative;
    }
  `;
  document.head.appendChild(style);
}

// Global function
window.goToProduct = goToProduct;

console.log('Database-only products page loaded');