// Products Page JavaScript

// Product Database - This will eventually come from your backend
const PRODUCTS_DATABASE = [
  {
    id: 'white-set-001',
    name: 'Elegant White Set',
    category: 'sets',
    price: 1500,
    originalPrice: null,
    images: [
      'assets/images/whiteset1.jpg',
      'assets/images/whiteset2.jpg',
      'assets/images/whiteset3.jpg'
    ],
    badge: 'new',
    description: 'Elegant and modest white two-piece set. Soft fabric, breathable design, perfect for daily wear.',
    inStock: true,
    stockCount: 15,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White'],
    features: ['Soft, breathable fabric', 'Modest and elegant design', 'Perfect for daily wear', 'Available in multiple sizes'],
    dateAdded: '2024-01-15'
  },
  {
    id: 'black-set-001',
    name: 'Classic Black Set',
    category: 'sets',
    price: 1500,
    originalPrice: null,
    images: [
      'assets/images/blackset1.jpg',
      'assets/images/blackset2.jpg'
    ],
    badge: null,
    description: 'Classic black set with a sleek and minimal cut, ideal for any occasion.',
    inStock: true,
    stockCount: 12,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black'],
    features: ['Classic design', 'Versatile styling', 'Premium fabric', 'Comfortable fit'],
    dateAdded: '2024-01-10'
  },
  {
    id: 'brown-cardigan-001',
    name: 'Cozy Brown Cardigan',
    category: 'cardigans',
    price: 1275,
    originalPrice: 1500,
    images: [
      'assets/images/browncardigan1.jpg',
      'assets/images/browncardigan2.jpg'
    ],
    badge: 'sale',
    description: 'Cozy brown cardigan with flowy fit. Perfect as a layering piece in all seasons.',
    inStock: true,
    stockCount: 8,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown'],
    features: ['Flowy fit', 'Perfect for layering', 'All-season wear', 'Cozy material'],
    dateAdded: '2024-01-05'
  },
  {
    id: 'black-cardigan-001',
    name: 'Timeless Black Cardigan',
    category: 'cardigans',
    price: 1500,
    originalPrice: null,
    images: [
      'assets/images/blackcardigan1.jpg',
      'assets/images/blackcardigan2.jpg'
    ],
    badge: null,
    description: 'Timeless black cardigan with soft material and flattering shape.',
    inStock: true,
    stockCount: 10,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black'],
    features: ['Timeless design', 'Soft material', 'Flattering shape', 'Versatile styling'],
    dateAdded: '2024-01-08'
  },
  {
    id: 'beige-set-001',
    name: 'Soft Beige Set',
    category: 'sets',
    price: 1500,
    originalPrice: null,
    images: [
      'assets/images/beigeset1.jpg',
      'assets/images/beigeset2.jpg'
    ],
    badge: null,
    description: 'Soft beige two-piece set with relaxed fit and modern modest cut.',
    inStock: true,
    stockCount: 14,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Beige'],
    features: ['Relaxed fit', 'Modern modest cut', 'Soft fabric', 'Comfortable wear'],
    dateAdded: '2024-01-12'
  },
  {
    id: 'blue-set-001',
    name: 'Fresh Blue Set',
    category: 'sets',
    price: 1500,
    originalPrice: null,
    images: [
      'assets/images/blueset1.jpg',
      'assets/images/blueset2.jpg'
    ],
    badge: null,
    description: 'Calm and fresh blue set, light and breathable — perfect for summer days.',
    inStock: true,
    stockCount: 11,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Blue'],
    features: ['Light and breathable', 'Perfect for summer', 'Fresh color', 'Comfortable design'],
    dateAdded: '2024-01-18'
  }
];

// State Management
class ProductsPageState {
  constructor() {
    this.products = [...PRODUCTS_DATABASE];
    this.filteredProducts = [...PRODUCTS_DATABASE];
    this.currentFilter = 'all';
    this.currentSort = 'featured';
    this.searchQuery = '';
    this.productsPerPage = 12;
    this.currentPage = 1;
    this.isLoading = false;
  }

  filterProducts(filter) {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  sortProducts(sortBy) {
    this.currentSort = sortBy;
    this.applyFiltersAndSort();
  }

  searchProducts(query) {
    this.searchQuery = query.toLowerCase();
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    let filtered = [...this.products];

    // Apply category filter
    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'sale') {
        filtered = filtered.filter(p => p.badge === 'sale' || p.originalPrice);
      } else {
        filtered = filtered.filter(p => p.category === this.currentFilter);
      }
    }

    // Apply search filter
    if (this.searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.description.toLowerCase().includes(this.searchQuery) ||
        p.category.toLowerCase().includes(this.searchQuery)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.dateAdded) - new Date(a.dateAdded);
        case 'featured':
        default:
          // Featured items first (new, sale), then by date
          const aScore = (a.badge ? 2 : 0) + (a.inStock ? 1 : 0);
          const bScore = (b.badge ? 2 : 0) + (b.inStock ? 1 : 0);
          if (aScore !== bScore) return bScore - aScore;
          return new Date(b.dateAdded) - new Date(a.dateAdded);
      }
    });

    this.filteredProducts = filtered;
  }

  getVisibleProducts() {
    const start = 0;
    const end = this.currentPage * this.productsPerPage;
    return this.filteredProducts.slice(start, end);
  }

  hasMoreProducts() {
    return this.currentPage * this.productsPerPage < this.filteredProducts.length;
  }

  loadMore() {
    this.currentPage++;
  }
}

// Initialize state
const state = new ProductsPageState();

// DOM Elements
let productsGrid;
let loadingState;
let noProducts;
let filterBtns;
let sortSelect;
let searchInput;
let loadMoreBtn;
let loadMoreSection;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  setupEventListeners();
  showLoading();
  
  // Simulate loading delay for better UX
  setTimeout(() => {
    hideLoading();
    renderProducts();
  }, 800);
});

function initializeElements() {
  productsGrid = document.getElementById('productsGrid');
  loadingState = document.getElementById('loadingState');
  noProducts = document.getElementById('noProducts');
  filterBtns = document.querySelectorAll('.filter-btn');
  sortSelect = document.getElementById('sortSelect');
  searchInput = document.getElementById('searchInput');
  loadMoreBtn = document.getElementById('loadMoreBtn');
  loadMoreSection = document.getElementById('loadMoreSection');
}

function setupEventListeners() {
  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', handleFilter);
  });

  // Sort select
  if (sortSelect) {
    sortSelect.addEventListener('change', handleSort);
  }

  // Search input
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        handleSearch(e.target.value);
      }, 300);
    });
  }

  // Load more button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', handleLoadMore);
  }

  // Mobile menu and search
  setupMobileMenu();
  setupSearch();
}

function handleFilter(e) {
  const filter = e.target.dataset.filter;
  
  // Update active button
  filterBtns.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  
  // Filter products
  state.filterProducts(filter);
  renderProducts();
  
  // Track analytics
  trackEvent('filter_products', { filter: filter });
}

function handleSort(e) {
  const sortBy = e.target.value;
  state.sortProducts(sortBy);
  renderProducts();
  
  // Track analytics
  trackEvent('sort_products', { sort: sortBy });
}

function handleSearch(query) {
  state.searchProducts(query);
  renderProducts();
  
  // Track analytics if query is not empty
  if (query) {
    trackEvent('search_products', { query: query });
  }
}

function handleLoadMore() {
  showLoadMoreLoading();
  
  // Simulate loading delay
  setTimeout(() => {
    state.loadMore();
    renderProducts();
    hideLoadMoreLoading();
  }, 500);
}

function showLoading() {
  if (loadingState) loadingState.style.display = 'block';
  if (productsGrid) productsGrid.style.display = 'none';
  if (noProducts) noProducts.style.display = 'none';
  if (loadMoreSection) loadMoreSection.style.display = 'none';
}

function hideLoading() {
  if (loadingState) loadingState.style.display = 'none';
}

function showLoadMoreLoading() {
  if (loadMoreBtn) {
    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.disabled = true;
  }
}

function hideLoadMoreLoading() {
  if (loadMoreBtn) {
    loadMoreBtn.textContent = 'Load More Products';
    loadMoreBtn.disabled = false;
  }
}

function renderProducts() {
  const visibleProducts = state.getVisibleProducts();
  
  if (visibleProducts.length === 0) {
    if (productsGrid) productsGrid.style.display = 'none';
    if (noProducts) noProducts.style.display = 'block';
    if (loadMoreSection) loadMoreSection.style.display = 'none';
    return;
  }

  if (noProducts) noProducts.style.display = 'none';
  if (productsGrid) {
    productsGrid.style.display = 'grid';
    
    // Render products with animation
    productsGrid.innerHTML = visibleProducts.map((product, index) => 
      createProductCard(product, index)
    ).join('');
  }

  // Setup product card interactions
  setupProductCards();

  // Show/hide load more button
  if (loadMoreSection) {
    if (state.hasMoreProducts()) {
      loadMoreSection.style.display = 'block';
    } else {
      loadMoreSection.style.display = 'none';
    }
  }

  // Animate cards
  animateProductCards();
}

function createProductCard(product, index) {
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const stockStatus = getStockStatus(product.stockCount);
  
  return `
    <div class="product-card ${!product.inStock ? 'out-of-stock' : ''}" 
         data-product-id="${product.id}"
         style="animation-delay: ${index * 0.1}s">
      
      <div class="product-image-container">
        <img src="${product.images[0]}" 
             alt="${product.name}" 
             class="product-image"
             loading="lazy">
        
        ${product.badge ? `<span class="product-badge badge-${product.badge}">${product.badge}</span>` : ''}
        
        ${stockStatus ? `<span class="stock-status ${stockStatus.class}">${stockStatus.text}</span>` : ''}
        
        <div class="product-actions">
          <button class="action-btn wishlist-btn" 
                  onclick="toggleWishlist('${product.id}')" 
                  title="Add to Wishlist">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          
          <button class="action-btn preview-btn" 
                  onclick="quickPreview('${product.id}')" 
                  title="Quick Preview">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-title">${product.name}</h3>
        
        <div class="product-price">
          <span class="current-price">${product.price} EGP</span>
          ${product.originalPrice ? `
            <span class="original-price">${product.originalPrice} EGP</span>
            <span class="discount-badge">-${discountPercentage}%</span>
          ` : ''}
        </div>
        
        <button class="quick-add-btn" 
                onclick="quickAdd(event, '${product.id}')"
                ${!product.inStock ? 'disabled' : ''}>
          ${!product.inStock ? 'Out of Stock' : 'Quick Add to Cart'}
        </button>
      </div>
    </div>
  `;
}

function getStockStatus(stockCount) {
  if (stockCount === 0) {
    return { class: 'stock-out', text: 'Out of Stock' };
  } else if (stockCount <= 3) {
    return { class: 'stock-low', text: `Only ${stockCount} left` };
  }
  return null;
}

function setupProductCards() {
  // Setup click handlers for product cards
  document.querySelectorAll('.product-card').forEach(card => {
    // Prevent click when clicking on action buttons
    card.addEventListener('click', (e) => {
      if (e.target.closest('.product-actions') || e.target.closest('.quick-add-btn')) {
        return;
      }
      
      const productId = card.dataset.productId;
      goToProduct(productId);
    });

    // Setup image hover effect for multiple images
    const img = card.querySelector('.product-image');
    const productId = card.dataset.productId;
    const product = PRODUCTS_DATABASE.find(p => p.id === productId);
    
    if (product && product.images.length > 1) {
      let currentImageIndex = 0;
      let hoverInterval;
      
      card.addEventListener('mouseenter', () => {
        hoverInterval = setInterval(() => {
          currentImageIndex = (currentImageIndex + 1) % product.images.length;
          img.src = product.images[currentImageIndex];
        }, 1000);
      });
      
      card.addEventListener('mouseleave', () => {
        clearInterval(hoverInterval);
        currentImageIndex = 0;
        img.src = product.images[0];
      });
    }
  });
}

function animateProductCards() {
  // Add animation class to cards
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      card.style.transition = 'all 0.6s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, index * 50);
  });
}

// Product interaction functions
function goToProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
  
  // Track analytics
  trackEvent('view_product', { product_id: productId });
}

function quickAdd(event, productId) {
  event.stopPropagation();
  
  const product = PRODUCTS_DATABASE.find(p => p.id === productId);
  if (!product || !product.inStock) return;

  const button = event.target;
  const originalText = button.textContent;
  
  // Add to cart
  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    size: 'M', // Default size for quick add
    quantity: 1,
    category: product.category
  };

  addToCart(cartItem);
  
  // Visual feedback
  button.textContent = 'Added!';
  button.classList.add('added');
  
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('added');
  }, 1500);

  // Update cart count
  updateCartCount();
  
  // Show notification
  showNotification(`${product.name} added to cart!`);
  
  // Track analytics
  trackEvent('add_to_cart', { 
    product_id: productId, 
    product_name: product.name,
    source: 'quick_add'
  });
}

function toggleWishlist(productId) {
  const product = PRODUCTS_DATABASE.find(p => p.id === productId);
  if (!product) return;

  // Get current wishlist
  let wishlist = JSON.parse(localStorage.getItem('nourabelle_wishlist') || '[]');
  
  const isInWishlist = wishlist.some(item => item.id === productId);
  
  if (isInWishlist) {
    // Remove from wishlist
    wishlist = wishlist.filter(item => item.id !== productId);
    showNotification(`${product.name} removed from wishlist`);
  } else {
    // Add to wishlist
    wishlist.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      dateAdded: new Date().toISOString()
    });
    showNotification(`${product.name} added to wishlist!`);
  }
  
  localStorage.setItem('nourabelle_wishlist', JSON.stringify(wishlist));
  
  // Update UI
  updateWishlistUI();
  
  // Track analytics
  trackEvent('toggle_wishlist', { 
    product_id: productId, 
    action: isInWishlist ? 'remove' : 'add'
  });
}

function quickPreview(productId) {
  // This could open a modal with product details
  // For now, just go to the product page
  goToProduct(productId);
}

function clearFilters() {
  // Reset all filters
  state.currentFilter = 'all';
  state.searchQuery = '';
  state.currentSort = 'featured';
  state.currentPage = 1;
  
  // Update UI
  filterBtns.forEach(btn => btn.classList.remove('active'));
  document.querySelector('[data-filter="all"]').classList.add('active');
  
  if (sortSelect) {
    sortSelect.value = 'featured';
  }
  
  if (searchInput) {
    searchInput.value = '';
  }
  
  // Re-render
  state.applyFiltersAndSort();
  renderProducts();
}

// Cart management functions
function addToCart(item) {
  let cart = JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
  
  // Check if item already exists with same size
  const existingIndex = cart.findIndex(cartItem => 
    cartItem.id === item.id && cartItem.size === item.size
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  localStorage.setItem('nourabelle_cart', JSON.stringify(cart));
  
  // Trigger cart update event
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = count;
    cartCountEl.classList.toggle('show', count > 0);
  }
}

function updateWishlistUI() {
  const wishlist = JSON.parse(localStorage.getItem('nourabelle_wishlist') || '[]');
  
  document.querySelectorAll('.product-card').forEach(card => {
    const productId = card.dataset.productId;
    const isInWishlist = wishlist.some(item => item.id === productId);
    
    card.classList.toggle('in-wishlist', isInWishlist);
  });
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

function trackEvent(eventName, parameters) {
  // Analytics tracking - implement your analytics service here
  console.log('Track Event:', eventName, parameters);
  
  // Example: Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
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
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
  
  // Close menu when clicking outside
  if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
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
  
  if (searchBtn && searchOverlay) {
    searchBtn.addEventListener('click', () => {
      searchOverlay.classList.add('open');
      if (searchInput) searchInput.focus();
    });
  }
  
  if (searchClose) {
    searchClose.addEventListener('click', () => {
      searchOverlay.classList.remove('open');
      if (searchInput) searchInput.value = '';
    });
  }
  
  // Close search when clicking outside
  if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
      if (e.target === searchOverlay) {
        searchOverlay.classList.remove('open');
        if (searchInput) searchInput.value = '';
      }
    });
  }
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  updateWishlistUI();
});

// Listen for cart updates from other pages
window.addEventListener('cartUpdated', updateCartCount);

// Export functions for global use
window.ProductsPage = {
  goToProduct,
  quickAdd,
  toggleWishlist,
  quickPreview,
  clearFilters,
  state
};