// Nourabelle - Clean JavaScript (No contradictions)

'use strict';

// Product data with your exact file paths
const PRODUCTS = [
  {
    id: 'whiteset',
    name: 'White Set',
    price: 1500,
    image: 'assets/images/whiteset1.jpg',
    images: ['assets/images/whiteset1.jpg', 'assets/images/whiteset2.jpg'],
    category: 'sets'
  },
  {
    id: 'blackset',
    name: 'Black Set',
    price: 1500,
    image: 'assets/images/blackset1.jpg',
    images: ['assets/images/blackset1.jpg', 'assets/images/blackset2.jpg'],
    category: 'sets'
  },
  {
    id: 'browncardigan',
    name: 'Brown Cardigan',
    price: 1500,
    image: 'assets/images/browncardigan1.jpg',
    images: ['assets/images/browncardigan1.jpg', 'assets/images/browncardigan2.jpg'],
    category: 'cardigans'
  },
  {
    id: 'blackcardigan',
    name: 'Black Cardigan',
    price: 1500,
    image: 'assets/images/blackcardigan1.jpg',
    images: ['assets/images/blackcardigan1.jpg', 'assets/images/blackcardigan2.jpg'],
    category: 'cardigans'
  }
];

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

  // Hamburger click to toggle
  hamburger.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Hamburger clicked');
    toggleMenu();
  });

  // Close button click
  mobileClose.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Close button clicked');
    closeMenu();
  });

  // Close when clicking menu links
  const menuLinks = mobileMenu.querySelectorAll('.mobile-menu-content a');
  menuLinks.forEach(link => {
    link.addEventListener('click', function() {
      console.log('Menu link clicked');
      closeMenu();
    });
  });

  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isMenuOpen) {
      console.log('Escape key pressed');
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
      product.category.toLowerCase().includes(query)
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

  searchBtn.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);
  searchInput.addEventListener('input', debounce(performSearch, 300));

  // Close search when clicking overlay
  searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) closeSearch();
  });

  // Close on escape
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

  // Auto slide every 2.5 seconds (faster)
  setInterval(nextSlide, 2500);
}

// ========== PRODUCT IMAGE HOVER EFFECTS ==========
function initProductHoverEffects() {
  const products = [
    { id: 'whiteset', images: ['assets/images/whiteset1.jpg', 'assets/images/whiteset2.jpg'] },
    { id: 'blackset', images: ['assets/images/blackset1.jpg', 'assets/images/blackset2.jpg'] },
    { id: 'browncardigan', images: ['assets/images/browncardigan1.jpg', 'assets/images/browncardigan2.jpg'] },
    { id: 'blackcardigan', images: ['assets/images/blackcardigan1.jpg', 'assets/images/blackcardigan2.jpg'] }
  ];

  products.forEach(product => {
    const img = document.getElementById(product.id);
    if (!img || product.images.length < 2) return;

    let currentIndex = 0;

    img.addEventListener('mouseenter', () => {
      currentIndex = (currentIndex + 1) % product.images.length;
      img.src = product.images[currentIndex];
    });

    img.addEventListener('mouseleave', () => {
      img.src = product.images[0];
      currentIndex = 0;
    });

    // Mobile touch effect
    if (window.innerWidth <= 768) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              currentIndex = (currentIndex + 1) % product.images.length;
              img.src = product.images[currentIndex];
            }, 2000);
          } else {
            img.src = product.images[0];
            currentIndex = 0;
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

  // Listen for cart updates
  window.addEventListener('storage', updateCartCount);
  document.addEventListener('cartUpdated', updateCartCount);
}

function getCart() {
  try {
    return JSON.parse(sessionStorage.getItem('cart') || '[]');
  } catch (e) {
    console.error('Cart parsing error:', e);
    return [];
  }
}

function saveCart(cart) {
  try {
    sessionStorage.setItem('cart', JSON.stringify(cart));
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
    // Only update if count actually changed to prevent glitches
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
  // Remove existing notifications
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
  // Validate product ID
  const product = PRODUCTS.find(p => p.id === productId);
  if (product) {
    window.location.href = `pages/product.html?id=${encodeURIComponent(productId)}`;
  }
};

window.addToCart = addToCart;
window.getCart = getCart;
window.saveCart = saveCart;
window.updateCartCount = updateCartCount;
window.scrollToProducts = scrollToProducts;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all modules
  initMobileMenu();
  initSearch();
  initHeroSlider();
  initProductHoverEffects();
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
    `;
    document.head.appendChild(style);
  }

  // Security: Prevent XSS through URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.forEach((value, key) => {
    if (value.includes('<script') || value.includes('javascript:')) {
      window.location.href = '/';
    }
  });

  console.log('Nourabelle homepage initialized successfully');
});