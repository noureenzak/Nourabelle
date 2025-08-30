// Product Detail Page JavaScript - Enhanced but keeping your structure

'use strict';

// Product data with correct image paths for pages directory
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
    description: 'Elegant and modest white two-piece set. Soft fabric, breathable design, perfect for daily wear. This beautiful set combines comfort with style, featuring a relaxed fit that flatters all body types.',
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
    description: 'Classic black set with a sleek and minimal cut, ideal for any occasion. The Classic Black Set is a wardrobe essential that combines timeless elegance with modern comfort.',
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
    description: 'Cozy brown cardigan with flowy fit. Perfect as a layering piece in all seasons. Our Cozy Brown Cardigan is the perfect layering piece for any season with its flowing silhouette and warm earth tone.',
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
    description: 'Timeless black cardigan with soft material and flattering shape. The Timeless Black Cardigan is a sophisticated piece that elevates any ensemble.',
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
    description: 'Soft beige two-piece set with relaxed fit and modern modest cut. The Soft Beige Set offers a perfect balance of comfort and style with neutral beige tone that complements all skin tones.',
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
    description: 'Calm and fresh blue set, light and breathable — perfect for summer days. The Fresh Blue Set brings a breath of fresh air to your wardrobe with its calming blue shade and lightweight fabric.',
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
  loadProductFromURL();
  setupEventListeners();
  updateCartCount();
});

function loadProductFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product');
  
  if (!productId) {
    // Redirect to products page if no ID
    window.location.href = 'products.html';
    return;
  }

  currentProduct = PRODUCTS.find(p => p.id === productId);
  
  if (!currentProduct) {
    // Show product not found
    showProductNotFound();
    return;
  }

  renderProduct();
}

function renderProduct() {
  if (!currentProduct) return;

  // Update page title
  document.title = `${currentProduct.name} - Nourabelle`;

  // Update product info
  document.getElementById('product-category').textContent = currentProduct.category.charAt(0).toUpperCase() + currentProduct.category.slice(1);
  document.getElementById('product-title').textContent = currentProduct.name;
  document.getElementById('product-description').textContent = currentProduct.description;

  // Update price
  document.getElementById('product-price').textContent = `${currentProduct.price} EGP`;
  
  const originalPrice = document.getElementById('original-price');
  const savings = document.getElementById('savings');
  
  if (currentProduct.originalPrice) {
    originalPrice.textContent = `${currentProduct.originalPrice} EGP`;
    originalPrice.style.display = 'inline';
    
    const discountPercentage = Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100);
    savings.textContent = `Save ${discountPercentage}%`;
    savings.style.display = 'inline';
  } else {
    originalPrice.style.display = 'none';
    savings.style.display = 'none';
  }

  // Update badge
  const badge = document.getElementById('product-badge');
  if (currentProduct.badge) {
    badge.textContent = currentProduct.badge;
    badge.className = `image-badge badge-${currentProduct.badge}`;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }

  // Update main image
  document.getElementById('product-image').src = currentProduct.images[0];

  // Render thumbnails
  renderThumbnails();

  // Update features
  renderFeatures();
}

function renderThumbnails() {
  const container = document.getElementById('thumbnail-container');
  if (!container || currentProduct.images.length <= 1) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';
  container.innerHTML = currentProduct.images.map((image, index) => `
    <img src="${image}" 
         alt="${currentProduct.name} ${index + 1}" 
         class="thumbnail ${index === activeImageIndex ? 'active' : ''}"
         onclick="selectImage(${index})">
  `).join('');
}

function renderFeatures() {
  const featuresList = document.getElementById('features-list');
  if (featuresList && currentProduct.features) {
    featuresList.innerHTML = currentProduct.features.map(feature => `<li>${feature}</li>`).join('');
  }
}

function setupEventListeners() {
  // Size selection
  const sizeOptions = document.querySelectorAll('.size-option');
  sizeOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remove active class from all
      sizeOptions.forEach(opt => opt.classList.remove('selected'));
      // Add to clicked
      option.classList.add('selected');
      selectedSize = option.dataset.size;
    });
  });

  // Quantity controls
  const quantityInput = document.getElementById('quantity-input');
  if (quantityInput) {
    quantityInput.addEventListener('change', (e) => {
      quantity = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
      quantityInput.value = quantity;
    });
  }

  // Mobile menu
  setupMobileMenu();
}

// Image selection
function selectImage(index) {
  activeImageIndex = index;
  document.getElementById('product-image').src = currentProduct.images[index];
  
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
  input.value = newQuantity;
}

// Add to cart function
function addToCart() {
  if (!currentProduct) return;

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
  } else {
    cart.push(cartItem);
  }

  localStorage.setItem('nourabelle_cart', JSON.stringify(cart));

  // Visual feedback
  const button = document.getElementById('buy-button');
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

  // Update cart count
  updateCartCount();

  // Show notification
  showNotification(`${currentProduct.name} added to cart!`);
}

// Wishlist functions
function toggleWishlist() {
  if (!currentProduct) return;

  let wishlist = JSON.parse(localStorage.getItem('nourabelle_wishlist') || '[]');
  const isInWishlist = wishlist.some(item => item.id === currentProduct.id);
  
  const button = document.querySelector('.wishlist-btn');
  
  if (isInWishlist) {
    // Remove from wishlist
    wishlist = wishlist.filter(item => item.id !== currentProduct.id);
    button.classList.remove('active');
    showNotification(`${currentProduct.name} removed from wishlist`);
  } else {
    // Add to wishlist
    wishlist.push({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image: currentProduct.image,
      dateAdded: new Date().toISOString()
    });
    button.classList.add('active');
    showNotification(`${currentProduct.name} added to wishlist!`);
  }

  localStorage.setItem('nourabelle_wishlist', JSON.stringify(wishlist));
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
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.style.display === 'flex';
      mobileMenu.style.display = isOpen ? 'none' : 'flex';
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });
    
    // Close menu when clicking on links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.style.display = 'none';
        document.body.style.overflow = '';
      });
    });
  }
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

// Global functions
window.selectImage = selectImage;
window.changeQuantity = changeQuantity;
window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;