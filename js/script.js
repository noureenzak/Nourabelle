// Updated Nourabelle Website JavaScript - Database Integration

'use strict';

// Supabase Configuration
const SUPABASE_URL = 'https://ebiwoiaduskjodegnhvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaXdvaWFkdXNram9kZWduaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQ5OTEsImV4cCI6MjA3MjE3MDk5MX0.tuWREO0QuDKfgJQ6fbVpi4UI9ckKUYlqoCy3g2_cJW8';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global products array - will be populated from database
let PRODUCTS = [];

// Fallback products (your original static products as backup)
const FALLBACK_PRODUCTS = [
  {
    id: 'whiteset',
    name: 'White Set',
    price: 1500,
    image: 'assets/images/whiteset1.jpg',
    images: ['assets/images/whiteset1.jpg', 'assets/images/whiteset2.jpg'],
    category: 'sets',
    featured: true,
    is_active: true
  },
  {
    id: 'blackset',
    name: 'Black Set',
    price: 1500,
    image: 'assets/images/blackset1.jpg',
    images: ['assets/images/blackset1.jpg', 'assets/images/blackset2.jpg'],
    category: 'sets',
    featured: true,
    is_active: true
  },
  {
    id: 'browncardigan',
    name: 'Brown Cardigan',
    price: 1500,
    image: 'assets/images/browncardigan1.jpg',
    images: ['assets/images/browncardigan1.jpg', 'assets/images/browncardigan2.jpg'],
    category: 'cardigans',
    featured: true,
    is_active: true
  },
  {
    id: 'blackcardigan',
    name: 'Black Cardigan',
    price: 1500,
    image: 'assets/images/blackcardigan1.jpg',
    images: ['assets/images/blackcardigan1.jpg', 'assets/images/blackcardigan2.jpg'],
    category: 'cardigans',
    featured: true,
    is_active: true
  }
];

// Load products from database
async function loadProducts() {
  try {
    console.log('Loading products from database...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data && data.length > 0) {
  PRODUCTS = data.map(product => ({
    id: product.id.toString(),
    name: product.name,
    price: product.price,
   image: (product.images && product.images[0]) || 'assets/images/placeholder.jpg',
images: product.images || ['assets/images/placeholder.jpg'],
stock: product.stock || {},

    category: product.category || 'uncategorized',
    featured: product.featured || false,
    is_active: product.is_active,
    description: product.description,
    original_price: product.original_price
  }));
  
  console.log(`Loaded ${PRODUCTS.length} products from database`);
} else {
  PRODUCTS = FALLBACK_PRODUCTS;
  console.log('Using fallback products - database empty or unavailable');
}

    
    // Update the homepage products display
    updateHomepageProducts();
    
  } catch (error) {
    console.error('Error loading products:', error);
    PRODUCTS = FALLBACK_PRODUCTS;
    updateHomepageProducts();
  }
}

// Update homepage products display
function updateHomepageProducts() {
  const productContainer = document.getElementById('product-scroll');
  if (!productContainer) return;

  // Get featured products, fallback to first 4 products
  const featuredProducts = PRODUCTS.filter(p => p.featured).slice(0, 4);
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : PRODUCTS.slice(0, 4);

  if (displayProducts.length === 0) return;

  productContainer.innerHTML = displayProducts.map(product => `
    <div class="product" onclick="goToProduct('${product.id}')">
      <img id="${product.id}" src="${product.image}" alt="${product.name}" 
           onerror="this.src='assets/images/placeholder.jpg'">
      <p>${product.name}</p>
      <div class="price-container">
        ${product.original_price && product.original_price > product.price ? 
          `<p class="original-price">${product.original_price} EGP</p>` : ''
        }
        <p class="price">${product.price} EGP</p>
      </div>
    </div>
  `).join('');

  // Re-initialize hover effects for new products
  initProductHoverEffects();
}

// ========== MOBILE MENU ==========
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
    console.log('Opening menu');
    isMenuOpen = true;
    hamburger.classList.add('active');
    mobileMenu.classList.add('open');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    console.log('Closing menu');
    isMenuOpen = false;
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  function toggleMenu() {
    console.log('Toggle menu - current state:', isMenuOpen);
    if (isMenuOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburger.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  mobileClose.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
  });

  const menuLinks = mobileMenu.querySelectorAll('.mobile-menu-content a');
  menuLinks.forEach(link => {
    link.addEventListener('click', function() {
      closeMenu();
    });
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  });
}

// ========== SEARCH FUNCTIONALITY ==========
function initSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (!searchBtn || !searchOverlay) return;

  function openSearch() {
    searchOverlay.classList.add('open');
    setTimeout(() => searchInput.focus(), 100);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    searchInput.value = '';
    searchResults.innerHTML = '';
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
      (product.description && product.description.toLowerCase().includes(query))
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
        " onerror="this.src='assets/images/placeholder.jpg'">
        <div>
          <div style="font-weight: 500; margin-bottom: 4px;">${product.name}</div>
          <div style="color: var(--btn); font-weight: 600;">
            ${product.original_price && product.original_price > product.price ? 
              `<span style="text-decoration: line-through; color: #999; margin-right: 8px;">${product.original_price} EGP</span>` : ''
            }
            ${product.price} EGP
          </div>
        </div>
      </div>
    `).join('');
  }

  searchBtn.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);
  searchInput.addEventListener('input', debounce(performSearch, 300));

  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('open')) {
      closeSearch();
    }
  });
}

// ========== HERO SLIDER ==========
function initHeroSlider() {
  const slides = document.querySelectorAll('.slide-img');
  if (slides.length <= 1) return;

  let currentSlide = 0;

  function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }

  setInterval(nextSlide, 2500);
}

// ========== PRODUCT IMAGE HOVER EFFECTS ==========
function initProductHoverEffects() {
  // Get all product images and apply hover effects based on loaded products
  PRODUCTS.forEach(product => {
    const img = document.getElementById(product.id);
    if (!img || !product.images || product.images.length < 2) return;

    let currentIndex = 0;
    let originalSrc = img.src;

    img.addEventListener('mouseenter', () => {
      if (product.images.length > 1) {
        currentIndex = 1; // Switch to second image
        img.src = product.images[currentIndex];
      }
    });

    img.addEventListener('mouseleave', () => {
      currentIndex = 0;
      img.src = product.images[0] || originalSrc;
    });

    // Mobile touch effect
    if (window.innerWidth <= 768) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && product.images.length > 1) {
            setTimeout(() => {
              if (currentIndex === 0) {
                currentIndex = 1;
                img.src = product.images[currentIndex];
                setTimeout(() => {
                  currentIndex = 0;
                  img.src = product.images[0];
                }, 1500);
              }
            }, 1000);
          }
        });
      }, { threshold: 0.8 });

      observer.observe(img);
    }
  });
}

// ========== CART MANAGEMENT ==========
function initCartSystem() {
  updateCartCount();
  window.addEventListener('storage', updateCartCount);
  document.addEventListener('cartUpdated', updateCartCount);
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
  } catch (e) {
    console.error('Cart parsing error:', e);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem('nourabelle_cart', JSON.stringify(cart));
    updateCartCount();
    document.dispatchEvent(new CustomEvent('cartUpdated'));
  } catch (e) {
    console.error('Cart save error:', e);
  }
}

function addToCart(product) {
  const cart = getCart();
  const existingIndex = cart.findIndex(item => 
    item.id === product.id && item.size === product.size
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
      addedAt: Date.now()
    });
  }

  saveCart(cart);
  showNotification(`${product.name} added to cart`);
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
  const cartCountEl = document.getElementById('cart-count');
  
  if (cartCountEl) {
    if (parseInt(cartCountEl.textContent) !== count) {
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
}

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

// ========== UTILITY FUNCTIONS ==========
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

function scrollToProducts() {
  const productsSection = document.getElementById("products");
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: "smooth" });
  }
}

// ========== GLOBAL FUNCTIONS ==========
window.goToProduct = function(productId) {
  const product = PRODUCTS.find(p => p.id == productId);
  if (product) {
    window.location.href = `pages/product.html?product=${encodeURIComponent(productId)}`;
  }
};

window.addToCart = addToCart;
window.getCart = getCart;
window.saveCart = saveCart;
window.updateCartCount = updateCartCount;
window.scrollToProducts = scrollToProducts;
window.PRODUCTS = PRODUCTS; // Make products globally available

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async function() {
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
      }
    `;
    document.head.appendChild(style);
  }
  // Cart icon update
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  document.getElementById('cart-count').textContent = count;
}

// Call on page load
updateCartCount();

// Function to add product to cart
function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Check if product with same id and size already exists
  const existingIndex = cart.findIndex(
    item => item.id === product.id && item.size === product.size
  );

  if (existingIndex > -1) {
    cart[existingIndex].quantity += product.quantity;
  } else {
    cart.push(product);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(`${product.name} (${product.size}) added to cart!`);
}


  console.log('Nourabelle homepage initialized successfully');
});