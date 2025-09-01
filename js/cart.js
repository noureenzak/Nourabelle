const shippingCosts = { cairo: 50, alexandria: 60, giza: 55, other: 80 };
const storageKey = 'nourabelle_cart';

function getCart() {
  return JSON.parse(sessionStorage.getItem(storageKey) || '[]');
}

function saveCart(cart) {
  sessionStorage.setItem(storageKey, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  const total = getCart().reduce((sum, i) => sum + (i.quantity || 1), 0);
  if (countEl) {
    countEl.textContent = total;
    countEl.style.display = total > 0 ? 'inline-block' : 'none';
  }
}

function displayCartItems() {
  const cart = getCart();
  const cartItemsEl = document.getElementById('cart-items');
  const emptyCart = document.getElementById('empty-cart');
  const cartContent = document.getElementById('cart-content');

  if (!cart.length) {
    emptyCart.style.display = 'block';
    cartContent.style.display = 'none';
    return;
  }

  emptyCart.style.display = 'none';
  cartContent.style.display = 'grid';

  cartItemsEl.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="item-image"><img src="${item.image}" alt="${item.name}"></div>
      <div class="item-info">
        <h3>${item.name}</h3>
        <p>Size: ${item.size}</p>
      </div>
      <div class="item-actions">
        <button onclick="updateQuantity(${i}, -1)">-</button>
        <span>${item.quantity}</span>
        <button onclick="updateQuantity(${i}, 1)">+</button>
      </div>
      <div class="item-total">
        <span>${(item.price * item.quantity).toFixed(2)} EGP</span>
        <button onclick="removeItem(${i})">x</button>
      </div>
    </div>
  `).join('');

  updateTotals();
}

function updateQuantity(index, change) {
  const cart = getCart();
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  saveCart(cart);
  displayCartItems();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  displayCartItems();
}

function updateTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const shipping = 50; // default or make dynamic
  const total = subtotal + shipping;

  document.getElementById('subtotal-amount').textContent = `${subtotal.toFixed(2)} EGP`;
  document.getElementById('shipping-amount').textContent = `${shipping.toFixed(2)} EGP`;
  document.getElementById('total-amount').textContent = `${total.toFixed(2)} EGP`;
  document.getElementById('checkout-btn').disabled = !cart.length;
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  displayCartItems();
});

window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
