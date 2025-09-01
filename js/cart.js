
    // Cart Page Functionality
    let currentShipping = 0;

    // Initialize cart page
    document.addEventListener('DOMContentLoaded', function() {
      displayCartItems();
      setupMobileMenu();
      setupSearch();
    });

    // Display cart items
    function displayCartItems() {
      const cart = getCart();
      const emptyCart = document.getElementById('emptyCart');
      const cartContent = document.getElementById('cartContent');
      const cartItemsList = document.getElementById('cartItemsList');

      if (!cart || cart.length === 0) {
        emptyCart.style.display = 'block';
        cartContent.style.display = 'none';
        return;
      }

      emptyCart.style.display = 'none';
      cartContent.style.display = 'grid';

      cartItemsList.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
          <div class="item-image">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='../assets/images/placeholder.jpg'">
          </div>
          
          <div class="item-info">
            <h3>${item.name}</h3>
            <p>Size: ${item.size}</p>
            <p>Category: ${item.category}</p>
            <div class="item-price">${item.price} EGP</div>
          </div>

          <div class="quantity-controls">
            <button class="quantity-btn" onclick="changeQuantity(${index}, -1)">−</button>
            <span class="quantity-display">${item.quantity}</span>
            <button class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</button>
          </div>

          <div class="item-controls">
            <button class="remove-btn" onclick="removeItem(${index})">Remove</button>
          </div>
        </div>
      `).join('');

      updateTotals();
    }

    // Change quantity
    function changeQuantity(index, change) {
      updateQuantity(index, change);
      displayCartItems();
    }

    // Remove item
    function removeItem(index) {
      if (confirm('Remove this item from your cart?')) {
        removeFromCart(index);
        displayCartItems();
      }
    }

    // Update shipping
    function updateShipping() {
      const select = document.getElementById('shippingSelect');
      const shippingCosts = { cairo: 50, alexandria: 60, giza: 55, other: 80 };
      currentShipping = shippingCosts[select.value] || 0;
      updateTotals();
    }

    // Update totals
    function updateTotals() {
      const subtotal = getCartTotal();
      const total = subtotal + currentShipping;

      document.getElementById('subtotal').textContent = `${subtotal} EGP`;
      document.getElementById('total').textContent = `${total} EGP`;

      const checkoutBtn = document.getElementById('checkoutBtn');
      checkoutBtn.disabled = subtotal === 0 || currentShipping === 0;
    }

    // Proceed to checkout
    function proceedToCheckout() {
      const cart = getCart();
      const shippingSelect = document.getElementById('shippingSelect');
      
      if (cart.length === 0) {
        alert('Your cart is empty');
        return;
      }
      
      if (!shippingSelect.value) {
        alert('Please select shipping location');
        return;
      }

      // Store checkout data
      const checkoutData = {
        items: cart,
        subtotal: getCartTotal(),
        shipping: currentShipping,
        total: getCartTotal() + currentShipping,
        shippingLocation: shippingSelect.value
      };

      localStorage.setItem('nourabelle_checkout', JSON.stringify(checkoutData));

      // Redirect to checkout page
      window.location.href = 'checkout.html';
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

      if (searchBtn) {
        searchBtn.addEventListener('click', () => {
          searchOverlay.classList.add('open');
          setTimeout(() => searchInput && searchInput.focus(), 100);
        });
      }

      if (searchClose) {
        searchClose.addEventListener('click', () => {
          searchOverlay.classList.remove('open');
          if (searchInput) searchInput.value = '';
        });
      }

      if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
          if (e.target === searchOverlay) {
            searchOverlay.classList.remove('open');
            if (searchInput) searchInput.value = '';
          }
        });
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('open')) {
          searchOverlay.classList.remove('open');
          if (searchInput) searchInput.value = '';
        }
      });
    }

    // Listen for cart updates
    document.addEventListener('cartUpdated', displayCartItems);
 