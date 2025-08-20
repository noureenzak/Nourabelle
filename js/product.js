// Product Detail Page JavaScript

// Import product database (this would come from your backend)
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
    description: 'Elegant and modest white two-piece set. Soft fabric, breathable design, perfect for daily wear. This beautiful set combines comfort with style, featuring a relaxed fit that flatters all body types.',
    detailedDescription: 'Our Elegant White Set is crafted from premium cotton blend fabric that offers both comfort and durability. The two-piece design includes a flowing top with modest coverage and matching bottoms with an adjustable fit. Perfect for both casual outings and special occasions, this set embodies the essence of modest fashion while maintaining a contemporary edge.',
    inStock: true,
    stockCount: 15,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White'],
    features: [
      'Soft, breathable cotton blend fabric',
      'Modest and elegant design',
      'Perfect for daily wear',
      'Relaxed fit for all body types',
      'Easy care - machine washable'
    ],
    specifications: {
      material: '70% Cotton, 30% Polyester',
      care: 'Machine wash cold, hang dry',
      origin: 'Designed with love',
      fit: 'Relaxed modest fit'
    },
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
    detailedDescription: 'The Classic Black Set is a wardrobe essential that combines timeless elegance with modern comfort. This versatile piece transitions seamlessly from day to night, offering a sophisticated look that never goes out of style.',
    inStock: true,
    stockCount: 12,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black'],
    features: [
      'Classic timeless design',
      'Versatile styling options',
      'Premium quality fabric',
      'Comfortable all-day wear',
      'Professional appearance'
    ],
    specifications: {
      material: '65% Cotton, 35% Modal',
      care: 'Machine wash cold, low heat iron',
      origin: 'Thoughtfully designed',
      fit: 'Classic modest fit'
    },
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
    detailedDescription: 'Our Cozy Brown Cardigan is the perfect layering piece for any season. With its flowing silhouette and warm earth tone, this cardigan adds both comfort and style to any outfit. The soft fabric drapes beautifully while providing the coverage and warmth you need.',
    inStock: true,
    stockCount: 8,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Brown'],
    features: [
      'Flowy, flattering silhouette',
      'Perfect for layering',
      'All-season versatility',
      'Cozy, soft material',
      'Earth-tone color palette'
    ],
    specifications: {
      material: '60% Acrylic, 40% Cotton',
      care: 'Hand wash recommended, lay flat to dry',
      origin: 'Crafted with care',
      fit: 'Relaxed flowing fit'
    },
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
    detailedDescription: 'The Timeless Black Cardigan is a sophisticated piece that elevates any ensemble. Its classic design and premium materials make it a versatile addition to your modest wardrobe, perfect for both professional and casual settings.',
    inStock: true,
    stockCount: 10,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black'],
    features: [
      'Timeless, versatile design',
      'Soft, premium material',
      'Flattering silhouette',
      'Professional appearance',
      'Easy to style'
    ],
    specifications: {
      material: '55% Cotton, 45% Viscose',
      care: 'Machine wash gentle cycle, reshape while damp',
      origin: 'Quality craftsmanship',
      fit: 'Classic tailored fit'
    },
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
    detailedDescription: 'The Soft Beige Set offers a perfect balance of comfort and style. The neutral beige tone complements all skin tones while the relaxed fit ensures comfort throughout the day. This modern take on modest fashion is both practical and beautiful.',
    inStock: true,
    stockCount: 14,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Beige'],
    features: [
      'Relaxed, comfortable fit',
      'Modern modest styling',
      'Soft, breathable fabric',
      'Neutral, versatile color',
      'Contemporary design'
    ],
    specifications: {
      material: '75% Cotton, 25% Linen',
      care: 'Machine wash cold, tumble dry low',
      origin: 'Sustainably made',
      fit: 'Relaxed modern fit'
    },
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
    detailedDescription: 'The Fresh Blue Set brings a breath of fresh air to your wardrobe. The calming blue shade and lightweight fabric make it ideal for warm weather while maintaining the modest coverage you love. This set is perfect for summer outings and casual gatherings.',
    inStock: true,
    stockCount: 11,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Blue'],
    features: [
      'Light and breathable fabric',
      'Perfect for summer wear',
      'Fresh, calming color',
      'Comfortable design',
      'Moisture-wicking properties'
    ],
    specifications: {
      material: '80% Cotton, 20% Bamboo fiber',
      care: 'Machine wash cold, air dry preferred',
      origin: 'Eco-friendly production',
      fit: 'Light and airy fit'
    },
    dateAdded: '2024-01-18'
  }
];

// Sample reviews data
const SAMPLE_REVIEWS = [
  {
    id: 1,
    name: 'Sarah M.',
    rating: 5,
    date: '2024-01-20',
    comment: 'Absolutely love this piece! The quality is amazing and the fit is perfect. Highly recommend!',
    verified: true
  },
  {
    id: 2,
    name: 'Amira K.',
    rating: 5,
    date: '2024-01-18',
    comment: 'Beautiful design and very comfortable. Great for both casual and formal occasions.',
    verified: true
  },
  {
    id: 3,
    name: 'Nour A.',
    rating: 4,
    date: '2024-01-15',
    comment: 'Love the style and quality. Runs slightly large, so consider sizing down.',
    verified: true
  }
];

// State Management
class ProductPageState {
  constructor() {
    this.currentProduct = null;
    this.selectedSize = 'M';
    this.selectedColor = null;
    this.quantity = 1;
    this.activeImageIndex = 0;
    this.activeTab = 'description';
    this.isInWishlist = false;
  }

  setProduct(product) {
    this.currentProduct = product;
    this.selectedColor = product.colors[0];
    this.updateWishlistStatus();
  }

  setSize(size) {
    this.selectedSize = size;
  }

  setColor(color) {
    this.selectedColor = color;
  }

  setQuantity(quantity) {
    this.quantity = Math.max(1, Math.min(10, quantity));
  }

  setActiveImage(index) {
    this.activeImageIndex = index;
  }

  setActiveTab(tab) {
    this.activeTab = tab;
  }

  updateWishlistStatus() {
    if (!this.currentProduct) return;
    
    const wishlist = JSON.parse(localStorage.getItem('nourabelle_wishlist') || '[]');
    this.isInWishlist = wishlist.some(item => item.id === this.currentProduct.id);
  }
}

// Initialize state
const state = new ProductPageState();

// DOM Elements
let mainImage, thumbnailContainer, productBreadcrumb, productCategory, productTitle;
let currentPrice, originalPrice, savings, productBadge, productDescription;
let sizeOptions, colorOptions, quantityInput, stockInfo, addToCartBtn, wishlistBtn;
let featuresListEl, detailedDescription, specsTable, reviewsList;
let relatedGrid, tabBtns, tabPanels;

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
  initializeElements();
  setupEventListeners();
  loadProductFromURL();
});

function initializeElements() {
  mainImage = document.getElementById('main-image');
  thumbnailContainer = document.getElementById('thumbnail-container');
  productBreadcrumb = document.getElementById('product-breadcrumb');
  productCategory = document.getElementById('product-category');
  productTitle = document.getElementById('product-title');
  currentPrice = document.getElementById('current-price');
  originalPrice = document.getElementById('original-price');
  savings = document.getElementById('savings');
  productBadge = document.getElementById('product-badge');
  productDescription = document.getElementById('product-description');
  sizeOptions = document.getElementById('size-options');
  colorOptions = document.getElementById('color-options');
  quantityInput = document.getElementById('quantity-input');
  stockInfo = document.getElementById('stock-info');
  addToCartBtn = document.getElementById('add-to-cart-btn');
  wishlistBtn = document.getElementById('wishlist-btn');
  featuresListEl = document.getElementById('features-list');
  detailedDescription = document.getElementById('detailed-description');
  specsTable = document.getElementById('specs-table');
  reviewsList = document.getElementById('reviews-list');
  relatedGrid = document.getElementById('related-grid');
  tabBtns = document.querySelectorAll('.tab-btn');
  tabPanels = document.querySelectorAll('.tab-panel');
}

function setupEventListeners() {
  // Quantity controls
  document.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const change = e.target.textContent === '+' ? 1 : -1;
      changeQuantity(change);
    });
  });

  // Quantity input
  if (quantityInput) {
    quantityInput.addEventListener('change', (e) => {
      state.setQuantity(parseInt(e.target.value) || 1);
      quantityInput.value = state.quantity;
    });
  }

  // Size options
  if (sizeOptions) {
    sizeOptions.addEventListener('click', (e) => {
      if (e.target.classList.contains('size-option') && !e.target.classList.contains('unavailable')) {
        handleSizeSelection(e.target);
      }
    });
  }

  // Color options
  if (colorOptions) {
    colorOptions.addEventListener('click', (e) => {
      if (e.target.classList.contains('color-option')) {
        handleColorSelection(e.target);
      }
    });
  }

  // Tab buttons
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabName = e.target.dataset.tab;
      switchTab(tabName);
    });
  });

  // Image zoom
  if (mainImage) {
    mainImage.addEventListener('click', showImageZoom);
  }

  // Mobile menu
  setupMobileMenu();
  
  // Size guide modal
  setupSizeGuideModal();
}

function loadProductFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    // Redirect to products page if no ID
    window.location.href = 'pages/products.html';
    return;
  }

  const product = PRODUCTS_DATABASE.find(p => p.id === productId);
  
  if (!product) {
    // Show product not found
    showProductNotFound();
    return;
  }

  state.setProduct(product);
  renderProduct();
  loadRelatedProducts();
  updateCartCount();
}

function renderProduct() {
  const product = state.currentProduct;
  if (!product) return;

  // Update page title
  document.title = `${product.name} - Nourabelle`;

  // Update breadcrumb
  if (productBreadcrumb) {
    productBreadcrumb.textContent = product.name;
  }

  // Update product info
  if (productCategory) {
    productCategory.textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);
  }

  if (productTitle) {
    productTitle.textContent = product.name;
  }

  // Update price
  if (currentPrice) {
    currentPrice.textContent = `${product.price} EGP`;
  }

  if (originalPrice && product.originalPrice) {
    originalPrice.textContent = `${product.originalPrice} EGP`;
    originalPrice.style.display = 'inline';
    
    if (savings) {
      const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
      savings.textContent = `Save ${discountPercentage}%`;
      savings.style.display = 'inline';
    }
  } else {
    if (originalPrice) originalPrice.style.display = 'none';
    if (savings) savings.style.display = 'none';
  }

  // Update badge
  if (productBadge && product.badge) {
    productBadge.textContent = product.badge;
    productBadge.className = `image-badge badge-${product.badge}`;
    productBadge.style.display = 'block';
  } else if (productBadge) {
    productBadge.style.display = 'none';
  }

  // Update description
  if (productDescription) {
    productDescription.textContent = product.description;
  }

  if (detailedDescription) {
    detailedDescription.textContent = product.detailedDescription || product.description;
  }

  // Update images
  renderImages();

  // Update sizes
  renderSizes();

  // Update colors
  renderColors();

  // Update stock info
  updateStockInfo();

  // Update features
  renderFeatures();

  // Update specifications
  renderSpecifications();

  // Update reviews
  renderReviews();

  // Update wishlist button
  updateWishlistButton();
}

function renderImages() {
  const product = state.currentProduct;
  if (!product || !mainImage) return;

  // Set main image
  mainImage.src = product.images[state.activeImageIndex];
  mainImage.alt = product.name;

  // Render thumbnails
  if (thumbnailContainer) {
    thumbnailContainer.innerHTML = product.images.map((image, index) => `
      <img src="${image}" 
           alt="${product.name} ${index + 1}" 
           class="thumbnail ${index === state.activeImageIndex ? 'active' : ''}"
           onclick="selectImage(${index})">
    `).join('');
  }
}

function renderSizes() {
  const product = state.currentProduct;
  if (!product || !sizeOptions) return;

  sizeOptions.innerHTML = product.sizes.map(size => `
    <div class="size-option ${size === state.selectedSize ? 'selected' : ''}" 
         data-size="${size}">
      ${size}
    </div>
  `).join('');
}

function renderColors() {
  const product = state.currentProduct;
  if (!product || !colorOptions) return;

  if (product.colors.length <= 1) {
    const colorSection = document.getElementById('color-section');
    if (colorSection) colorSection.style.display = 'none';
    return;
  }

  const colorSection = document.getElementById('color-section');
  if (colorSection) colorSection.style.display = 'block';

  colorOptions.innerHTML = product.colors.map(color => `
    <div class="color-option ${color === state.selectedColor ? 'selected' : ''}" 
         data-color="${color}"
         style="background-color: ${getColorValue(color)}"
         title="${color}">
    </div>
  `).join('');
}

function getColorValue(colorName) {
  const colorMap = {
    'White': '#ffffff',
    'Black': '#000000',
    'Brown': '#8B4513',
    'Beige': '#F5F5DC',
    'Blue': '#4169E1'
  };
  return colorMap[colorName] || colorName.toLowerCase();
}

function updateStockInfo() {
  const product = state.currentProduct;
  if (!product || !stockInfo) return;

  if (!product.inStock || product.stockCount === 0) {
    stockInfo.textContent = 'Out of stock';
    stockInfo.className = 'stock-info out-of-stock';
    if (addToCartBtn) {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Out of Stock';
    }
  } else if (product.stockCount <= 3) {
    stockInfo.textContent = `Only ${product.stockCount} left in stock`;
    stockInfo.className = 'stock-info low-stock';
    if (addToCartBtn) {
      addToCartBtn.disabled = false;
      addToCartBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 22c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          <path d="M20 22c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        Add to Cart
      `;
    }
  } else {
    stockInfo.textContent = 'In stock';
    stockInfo.className = 'stock-info';
    if (addToCartBtn) {
      addToCartBtn.disabled = false;
      addToCartBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 22c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          <path d="M20 22c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        Add to Cart
      `;
    }
  }
}

function renderFeatures() {
  const product = state.currentProduct;
  if (!product || !featuresListEl) return;

  featuresListEl.innerHTML = product.features.map(feature => `
    <li>${feature}</li>
  `).join('');
}

function renderSpecifications() {
  const product = state.currentProduct;
  if (!product || !specsTable) return;

  specsTable.innerHTML = Object.entries(product.specifications).map(([key, value]) => `
    <tr>
      <td>${key.charAt(0).toUpperCase() + key.slice(1)}</td>
      <td>${value}</td>
    </tr>
  `).join('');
}

function renderReviews() {
  if (!reviewsList) return;

  reviewsList.innerHTML = SAMPLE_REVIEWS.map(review => `
    <div class="review-item">
      <div class="review-header">
        <div class="reviewer-name">${review.name}</div>
        <div class="review-rating">
          ${Array(5).fill(0).map((_, i) => `
            <span class="star ${i < review.rating ? 'active' : ''}">★</span>
          `).join('')}
        </div>
        <div class="review-date">${formatDate(review.date)}</div>
      </div>
      <div class="review-comment">${review.comment}</div>
      ${review.verified ? '<div class="verified-badge">Verified Purchase</div>' : ''}
    </div>
  `).join('');
}

function loadRelatedProducts() {
  const product = state.currentProduct;
  if (!product || !relatedGrid) return;

  // Get related products from same category, excluding current product
  const relatedProducts = PRODUCTS_DATABASE
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  relatedGrid.innerHTML = relatedProducts.map(relatedProduct => `
    <div class="related-card" onclick="goToProduct('${relatedProduct.id}')">
      <img src="${relatedProduct.images[0]}" alt="${relatedProduct.name}" class="related-image">
      <div class="related-info">
        <div class="related-name">${relatedProduct.name}</div>
        <div class="related-price">${relatedProduct.price} EGP</div>
      </div>
    </div>
  `).join('');
}

// Event Handlers
function selectImage(index) {
  state.setActiveImage(index);
  renderImages();
}

function handleSizeSelection(sizeElement) {
  // Remove active class from all sizes
  sizeOptions.querySelectorAll('.size-option').forEach(el => {
    el.classList.remove('selected');
  });

  // Add active class to selected size
  sizeElement.classList.add('selected');
  
  // Update state
  const size = sizeElement.dataset.size;
  state.setSize(size);
}

function handleColorSelection(colorElement) {
  // Remove active class from all colors
  colorOptions.querySelectorAll('.color-option').forEach(el => {
    el.classList.remove('selected');
  });

  // Add active class to selected color
  colorElement.classList.add('selected');
  
  // Update state
  const color = colorElement.dataset.color;
  state.setColor(color);
}

function changeQuantity(change) {
  const newQuantity = state.quantity + change;
  state.setQuantity(newQuantity);
  if (quantityInput) {
    quantityInput.value = state.quantity;
  }
}

function switchTab(tabName) {
  // Update active tab button
  tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  // Update active tab panel
  tabPanels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `${tabName}-tab`);
  });

  state.setActiveTab(tabName);
}

// Action Functions
function addToCart() {
  const product = state.currentProduct;
  if (!product || !product.inStock) return;

  const cartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    size: state.selectedSize,
    color: state.selectedColor,
    quantity: state.quantity,
    category: product.category
  };

  // Add to cart
  let cart = JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
  
  // Check if item already exists with same size and color
  const existingIndex = cart.findIndex(item => 
    item.id === cartItem.id && 
    item.size === cartItem.size && 
    item.color === cartItem.color
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += cartItem.quantity;
  } else {
    cart.push(cartItem);
  }

  localStorage.setItem('nourabelle_cart', JSON.stringify(cart));

  // Visual feedback
  if (addToCartBtn) {
    const originalText = addToCartBtn.innerHTML;
    addToCartBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      Added to Cart!
    `;
    addToCartBtn.classList.add('added');
    
    setTimeout(() => {
      addToCartBtn.innerHTML = originalText;
      addToCartBtn.classList.remove('added');
    }, 2000);
  }

  // Update cart count
  updateCartCount();

  // Show notification
  showNotification(`${product.name} added to cart!`);

  // Track analytics
  trackEvent('add_to_cart', {
    product_id: product.id,
    product_name: product.name,
    size: state.selectedSize,
    color: state.selectedColor,
    quantity: state.quantity,
    price: product.price
  });
}

function toggleWishlist() {
  const product = state.currentProduct;
  if (!product) return;

  let wishlist = JSON.parse(localStorage.getItem('nourabelle_wishlist') || '[]');
  
  if (state.isInWishlist) {
    // Remove from wishlist
    wishlist = wishlist.filter(item => item.id !== product.id);
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
  state.updateWishlistStatus();
  updateWishlistButton();

  // Track analytics
  trackEvent('toggle_wishlist', {
    product_id: product.id,
    action: state.isInWishlist ? 'add' : 'remove'
  });
}

function updateWishlistButton() {
  if (!wishlistBtn) return;

  if (state.isInWishlist) {
    wishlistBtn.classList.add('active');
    wishlistBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    `;
  } else {
    wishlistBtn.classList.remove('active');
    wishlistBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    `;
  }
}

// Modal Functions
function showSizeGuide() {
  const modal = document.getElementById('size-guide-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeSizeGuide() {
  const modal = document.getElementById('size-guide-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function setupSizeGuideModal() {
  const modal = document.getElementById('size-guide-modal');
  if (!modal) return;

  // Close when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeSizeGuide();
    }
  });

  // Size guide tabs
  const sizeTabBtns = document.querySelectorAll('.size-tab-btn');
  const sizeGuidePanels = document.querySelectorAll('.size-guide-panel');

  sizeTabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.sizeTab;
      
      // Update active button
      sizeTabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      // Update active panel
      sizeGuidePanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `${tab}-size-guide`);
      });
    });
  });
}

function showImageZoom() {
  const zoomOverlay = document.getElementById('zoomOverlay');
  const zoomImage = document.getElementById('zoom-image');
  
  if (zoomOverlay && zoomImage) {
    zoomImage.src = mainImage.src;
    zoomOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function setupImageZoom() {
  const zoomOverlay = document.getElementById('zoomOverlay');
  const zoomClose = document.getElementById('zoomClose');
  
  if (zoomClose) {
    zoomClose.addEventListener('click', closeImageZoom);
  }
  
  if (zoomOverlay) {
    zoomOverlay.addEventListener('click', (e) => {
      if (e.target === zoomOverlay) {
        closeImageZoom();
      }
    });
  }
}

function closeImageZoom() {
  const zoomOverlay = document.getElementById('zoomOverlay');
  if (zoomOverlay) {
    zoomOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Utility Functions
function goToProduct(productId) {
  window.location.href = `product.html?id=${productId}`;
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

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function trackEvent(eventName, parameters) {
  // Analytics tracking - implement your analytics service here
  console.log('Track Event:', eventName, parameters);
  
  // Example: Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, parameters);
  }
}

function showProductNotFound() {
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem;">
      <h1 style="font-size: 2rem; color: var(--btn); margin-bottom: 1rem;">Product Not Found</h1>
      <p style="color: #666; margin-bottom: 2rem;">The product you're looking for doesn't exist or has been removed.</p>
      <a href="pages/products.html" style="background: var(--btn); color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600;">Browse Products</a>
    </div>
  `;
}

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

// Initialize image zoom
document.addEventListener('DOMContentLoaded', function() {
  setupImageZoom();
});

// Export functions for global use
window.ProductPage = {
  selectImage,
  changeQuantity,
  addToCart,
  toggleWishlist,
  showSizeGuide,
  closeSizeGuide,
  goToProduct,
  state
};