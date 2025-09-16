// Enhanced Checkout JavaScript - checkout.js
'use strict';

// Supabase Configuration
const SUPABASE_URL = 'https://ebiwoiaduskjodegnhvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaXdvaWFkdXNram9kZWduaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQ5OTEsImV4cCI6MjA3MjE3MDk5MX0.tuWREO0QuDKfgJQ6fbVpi4UI9ckKUYlqoCy3g2_cJW8';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State management
let checkoutData = {};
let selectedPayment = 'cod';
let uploadedScreenshot = null;
let screenshotVerified = false;

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Enhanced checkout page initializing...');
    loadCheckoutData();
    setupMobileMenu();
    setupSearch();
    setupInstapayModal();
    updateCartCount();
});

// Load checkout data from localStorage
function loadCheckoutData() {
    const data = localStorage.getItem('nourabelle_checkout');
    if (!data) {
        showNotification('No checkout data found. Redirecting to cart...', 'error');
        setTimeout(() => window.location.href = 'cart.html', 2000);
        return;
    }

    try {
        checkoutData = JSON.parse(data);
        console.log('Checkout data loaded:', checkoutData);
        displayOrderSummary();
    } catch (e) {
        console.error('Error parsing checkout data:', e);
        showNotification('Invalid checkout data. Redirecting to cart...', 'error');
        setTimeout(() => window.location.href = 'cart.html', 2000);
    }
}

// Display order summary
function displayOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryShipping = document.getElementById('summaryShipping');
    const summaryTotal = document.getElementById('summaryTotal');

    if (!orderItems) {
        console.error('Order items container not found');
        return;
    }

    // Display items
    orderItems.innerHTML = checkoutData.items.map(item => `
        <div class="order-item">
            <img src="${item.image || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSIzMCIgeT0iMzAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtc2l6ZT0iOCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'}" alt="${item.name}" class="item-image" 
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSIzMCIgeT0iMzAiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtc2l6ZT0iOCI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+'">
            <div class="item-details">
                <h4>${item.name || 'Product'}</h4>
                <p>Size: ${item.size || 'S-M'} | Qty: ${item.quantity || 1}</p>
            </div>
            <div class="item-price">${((item.price || 0) * (item.quantity || 1)).toFixed(2)} EGP</div>
        </div>
    `).join('');

    // Display totals
    if (summarySubtotal) summarySubtotal.textContent = `${(checkoutData.subtotal || 0).toFixed(2)} EGP`;
    if (summaryShipping) summaryShipping.textContent = `${(checkoutData.shipping || 0).toFixed(2)} EGP`;
    if (summaryTotal) summaryTotal.textContent = `${(checkoutData.total || 0).toFixed(2)} EGP`;
}

// Select payment method
function selectPayment(method) {
    if (method === 'instapay') {
        openInstapayModal();
        return;
    }
    
    selectedPayment = method;
    const radio = document.getElementById(method);
    if (radio) radio.checked = true;
    updatePaymentSelection();
}

// Update payment selection UI
function updatePaymentSelection() {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedOption = document.querySelector(`input[name="payment"]:checked`)?.closest('.payment-option');
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
}

// Setup Instapay Modal
function setupInstapayModal() {
    const screenshotFile = document.getElementById('screenshotFile');
    const uploadArea = document.getElementById('uploadArea');
    
    if (!screenshotFile || !uploadArea) return;

    // File input change handler
    screenshotFile.addEventListener('change', handleScreenshotUpload);
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });
}

// Open Instapay Modal
function openInstapayModal() {
    const modal = document.getElementById('instapayModal');
    const overlay = document.getElementById('modalOverlay');
    const totalAmountDisplay = document.getElementById('totalAmountDisplay');
    const amountToPay = document.getElementById('amountToPay');
    
    if (!modal || !overlay) return;
    
    // Reset modal state
    resetInstapayModal();
    
    // Set total amount
    const total = checkoutData.total || 0;
    if (totalAmountDisplay) totalAmountDisplay.textContent = `${total.toFixed(2)} EGP`;
    if (amountToPay) amountToPay.textContent = `${total.toFixed(2)} EGP`;
    
    // Show modal
    overlay.classList.add('show');
    modal.classList.add('show');
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
}

// Close Instapay Modal
function closeInstapayModal() {
    const modal = document.getElementById('instapayModal');
    const overlay = document.getElementById('modalOverlay');
    
    if (modal) modal.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    
    // Re-enable body scroll
    document.body.style.overflow = '';
    
    // If screenshot was uploaded successfully, select Instapay
    if (screenshotVerified) {
        selectedPayment = 'instapay';
        const instapayRadio = document.getElementById('instapay');
        if (instapayRadio) instapayRadio.checked = true;
        updatePaymentSelection();
    } else {
        // Reset to COD if no screenshot uploaded
        selectedPayment = 'cod';
        const codRadio = document.getElementById('cod');
        if (codRadio) codRadio.checked = true;
        updatePaymentSelection();
    }
}

// Reset Instapay Modal
function resetInstapayModal() {
    // Show payment step, hide others
    document.getElementById('paymentStep')?.classList.remove('hidden');
    document.getElementById('uploadStep')?.classList.add('hidden');
    document.getElementById('confirmationStep')?.classList.add('hidden');
    
    // Reset upload area
    const uploadArea = document.getElementById('uploadArea');
    const screenshotPreview = document.getElementById('screenshotPreview');
    const uploadProgress = document.getElementById('uploadProgress');
    
    if (uploadArea) {
        uploadArea.style.display = 'block';
        uploadArea.onclick = () => document.getElementById('screenshotFile').click();
    }
    if (screenshotPreview) screenshotPreview.classList.add('hidden');
    if (uploadProgress) uploadProgress.classList.add('hidden');
    
    // Reset file input
    const screenshotFile = document.getElementById('screenshotFile');
    if (screenshotFile) screenshotFile.value = '';
    
    // Reset state
    uploadedScreenshot = null;
    screenshotVerified = false;
}

// Copy Instapay Number
function copyInstapayNumber() {
    const number = '01234567890'; // UPDATE THIS WITH YOUR ACTUAL INSTAPAY NUMBER
    
    navigator.clipboard.writeText(number).then(() => {
        showNotification('Instapay number copied to clipboard!', 'success');
        
        // Update button text temporarily
        const copyBtn = document.querySelector('.copy-btn');
        if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✓ Copied!';
            copyBtn.style.background = '#27ae60';
            copyBtn.style.color = 'white';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '';
                copyBtn.style.color = '';
            }, 2000);
        }
    }).catch(() => {
        showNotification('Failed to copy number. Please copy manually: ' + number, 'error');
    });
}

// Proceed to upload step
function proceedToUpload() {
    document.getElementById('paymentStep')?.classList.add('hidden');
    document.getElementById('uploadStep')?.classList.remove('hidden');
}

// Handle screenshot upload
function handleScreenshotUpload(event) {
    const file = event.target.files[0];
    if (file) {
        handleFileSelection(file);
    }
}

// Handle file selection (from input or drag-drop)
async function handleFileSelection(file) {
    // Validate file
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file (PNG, JPG, JPEG)', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }
    
    try {
        // Show upload progress
        showUploadProgress();
        
        // Create unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileName = `payment-${timestamp}-${randomString}.${fileExtension}`;
        
        console.log('Uploading screenshot:', fileName);
        
        // Upload to Supabase storage
        const { data, error } = await supabase.storage
            .from('payment-screenshots')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            });
        
        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }
        
        console.log('Upload successful:', data);
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('payment-screenshots')
            .getPublicUrl(fileName);
        
        if (!publicUrl) {
            throw new Error('Failed to get public URL');
        }
        
        console.log('Public URL generated:', publicUrl);
        
        // Store screenshot URL
        uploadedScreenshot = publicUrl;
        screenshotVerified = true;
        
        // Show preview
        showScreenshotPreview(file, publicUrl);
        
        showNotification('Screenshot uploaded successfully!', 'success');
        
    } catch (error) {
        console.error('Upload error:', error);
        showNotification(`Upload failed: ${error.message}`, 'error');
        hideUploadProgress();
    }
}

// Show upload progress
function showUploadProgress() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    
    if (uploadArea) uploadArea.style.display = 'none';
    if (uploadProgress) uploadProgress.classList.remove('hidden');
    
    // Simulate progress (since we don't have real progress from Supabase)
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 90) progress = 90;
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progress >= 90) {
            clearInterval(interval);
        }
    }, 200);
    
    // Complete progress after upload
    setTimeout(() => {
        if (progressFill) progressFill.style.width = '100%';
        clearInterval(interval);
    }, 1000);
}

// Hide upload progress
function hideUploadProgress() {
    const uploadArea = document.getElementById('uploadArea');
    const uploadProgress = document.getElementById('uploadProgress');
    
    if (uploadArea) uploadArea.style.display = 'block';
    if (uploadProgress) uploadProgress.classList.add('hidden');
}

// Show screenshot preview
function showScreenshotPreview(file, publicUrl) {
    const uploadArea = document.getElementById('uploadArea');
    const uploadProgress = document.getElementById('uploadProgress');
    const screenshotPreview = document.getElementById('screenshotPreview');
    const previewImage = document.getElementById('previewImage');
    
    if (uploadArea) uploadArea.style.display = 'none';
    if (uploadProgress) uploadProgress.classList.add('hidden');
    
    if (previewImage) {
        // Use local file for immediate preview, but store public URL for submission
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    if (screenshotPreview) {
        screenshotPreview.classList.remove('hidden');
    }
}

// Remove screenshot
function removeScreenshot() {
    // Reset upload area
    const uploadArea = document.getElementById('uploadArea');
    const screenshotPreview = document.getElementById('screenshotPreview');
    
    if (uploadArea) uploadArea.style.display = 'block';
    if (screenshotPreview) screenshotPreview.classList.add('hidden');
    
    // Reset file input
    const screenshotFile = document.getElementById('screenshotFile');
    if (screenshotFile) screenshotFile.value = '';
    
    // Reset state
    uploadedScreenshot = null;
    screenshotVerified = false;
    
    showNotification('Screenshot removed', 'info');
}

// Confirm payment (move to confirmation step)
function confirmPayment() {
    if (!screenshotVerified) {
        showNotification('Please upload a payment screenshot first', 'error');
        return;
    }
    
    // Move to confirmation step
    document.getElementById('uploadStep')?.classList.add('hidden');
    document.getElementById('confirmationStep')?.classList.remove('hidden');
}

// Generate order number
function generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `NB${year}${month}${day}${random}`;
}

// Place order - MAIN FUNCTION// In your checkout.js file, find the placeOrder function and replace it with this:

// Replace your entire placeOrder function with this:

// FIXED placeOrder function - replace your existing one with this

async function placeOrder() {
    console.log('=== PLACING ORDER ===');

    const form = document.getElementById('checkoutForm');
    if (!form?.checkValidity()) {
        form?.reportValidity();
        return;
    }

    // Validate Instapay payment
    if (selectedPayment === 'instapay' && !screenshotVerified) {
        showNotification('Please complete Instapay payment verification first', 'error');
        openInstapayModal();
        return;
    }

    const btn = document.getElementById('placeOrderBtn');
    if (!btn) {
        console.error('Place order button not found');
        return;
    }

    try {
        // Disable button and show loading
        btn.disabled = true;
        btn.textContent = 'Processing Order...';

        const formData = new FormData(form);
        const orderNumber = generateOrderNumber();

        // Ensure total is calculated
        checkoutData.subtotal = Number(checkoutData.subtotal || 0);
        checkoutData.shipping = Number(checkoutData.shipping || 0);
        checkoutData.total = Number(checkoutData.total || (checkoutData.subtotal + checkoutData.shipping));

        // Build shipping address
        const shippingAddressObj = {
            street_address: formData.get('address'),
            building_info: formData.get('building') || null,
            floor: formData.get('floor') || null,
            apartment_number: formData.get('apartment') || null,
            landmark: formData.get('landmark') || null,
            postal_code: formData.get('postalCode') || null
        };

        const orderData = {
            order_number: orderNumber,
            customer_name: `${formData.get('firstName')} ${formData.get('lastName')}`,
            customer_email: formData.get('email'),
            customer_phone: formData.get('phone'),
            shipping_address: shippingAddressObj,
            payment_method: selectedPayment || 'cod',
            payment_screenshot: uploadedScreenshot || null,
            notes: formData.get('orderNotes') || null,
            items: checkoutData.items || [],
            subtotal: checkoutData.subtotal,
            shipping_cost: checkoutData.shipping,
            total_amount: checkoutData.total,
            status: selectedPayment === 'instapay' ? 'payment_pending' : 'pending',
            payment_status: selectedPayment === 'instapay' ? 'pending' : 'completed'
        };

        console.log('Order data prepared:', orderData);

        // Insert order into Supabase
        const { data: insertedOrder, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            throw new Error(`Database error: ${error.message}`);
        }

        console.log('Order inserted successfully:', insertedOrder);

        // ===== EMAIL NOTIFICATIONS =====
        emailjs.init('el1mZUzjUjqjdWKbF');

        try {
            console.log('Sending email notifications...');

            function buildFullAddress(addressObj) {
                if (!addressObj) return 'Address not provided';
                let address = addressObj.street_address || '';
                const addressParts = [
                    addressObj.building_info ? `Building: ${addressObj.building_info}` : '',
                    addressObj.floor ? `Floor: ${addressObj.floor}` : '',
                    addressObj.apartment_number ? `Apartment: ${addressObj.apartment_number}` : '',
                    addressObj.landmark ? `Landmark: ${addressObj.landmark}` : '',
                    addressObj.city ? `City: ${addressObj.city}` : '',
                    addressObj.postal_code ? `Postal Code: ${addressObj.postal_code}` : ''
                ].filter(part => part);
                if (addressParts.length > 0) address += '\n' + addressParts.join('\n');
                return address || 'Address not provided';
            }

            function buildItemsList(items) {
                if (!items || !Array.isArray(items)) return 'No items found';
                return items.map(item => `• ${item.name || 'Product'} (Size: ${item.size || 'N/A'}) - Qty: ${item.quantity || 1} - ${((item.price || 0) * (item.quantity || 1)).toFixed(2)} EGP`).join('\n');
            }

            function formatPaymentMethod(method) {
                const methods = { cod: 'Cash on Delivery', instapay: 'Instapay Transfer', bank: 'Bank Transfer' };
                return methods[method] || method;
            }

            // Owner Notification
            const ownerParams = {
                customer_name: orderData.customer_name,
                customer_email: orderData.customer_email,
                customer_phone: orderData.customer_phone,
                order_number: orderData.order_number,
                payment_method: formatPaymentMethod(orderData.payment_method),
                total_amount: orderData.total_amount.toFixed(2) + " EGP",
                items_list: buildItemsList(orderData.items),
                full_address: buildFullAddress(orderData.shipping_address)
            };

            await emailjs.send("service_cigidea", "template_pkp5jrk", ownerParams);
            console.log("Owner notification sent successfully");

            // Customer Notification
            const customerParams = {
                to_email: orderData.customer_email,
                customer_name: orderData.customer_name,
                order_number: orderData.order_number,
                payment_method: formatPaymentMethod(orderData.payment_method),
                total_amount: orderData.total_amount.toFixed(2) + " EGP",
                items_list: buildItemsList(orderData.items),
                shipping_address: buildFullAddress(orderData.shipping_address)
            };

            await emailjs.send("service_cigidea", "template_aezvcul", customerParams);
            console.log("Customer confirmation sent successfully");

        } catch (emailError) {
            console.error("Email notifications failed:", emailError);
            showNotification("Order placed, but email notifications failed.", "error");
        }

        // Show success
        showSuccessMessage(orderNumber);
        localStorage.removeItem('nourabelle_cart');
        localStorage.removeItem('nourabelle_checkout');
        console.log('=== ORDER COMPLETED SUCCESSFULLY ===');

    } catch (error) {
        console.error('Error placing order:', error);
        showNotification(`Error placing order: ${error.message}`, 'error');
        btn.disabled = false;
        btn.textContent = 'Place Order';
    }
}

// Show success message
function showSuccessMessage(orderNumber) {
    const checkoutContent = document.getElementById('checkoutContent');
    const successMessage = document.getElementById('successMessage');
    const orderNumberEl = document.getElementById('orderNumber');

    if (checkoutContent) checkoutContent.style.display = 'none';
    if (successMessage) successMessage.classList.add('show');
    if (orderNumberEl) orderNumberEl.textContent = `Order #${orderNumber}`;
}

// Mobile menu setup
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileClose = document.getElementById('mobileClose');
    
    if (!hamburger || !mobileMenu || !mobileClose) return;

    hamburger.addEventListener('click', () => {
        mobileMenu.classList.add('open');
        document.body.classList.add('menu-open');
    });
    
    mobileClose.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
    });
    
    mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) {
            mobileMenu.classList.remove('open');
            document.body.classList.remove('menu-open');
        }
    });
}

// Search functionality
function setupSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');

    if (!searchBtn || !searchOverlay) return;

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

// Update cart count
function updateCartCount() {
    try {
        const cart = JSON.parse(localStorage.getItem('nourabelle_cart') || '[]');
        const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
            cartCountEl.textContent = count;
            cartCountEl.style.display = count > 0 ? 'flex' : 'none';
        }
    } catch (e) {
        console.error('Error updating cart count:', e);
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Listen for payment method changes
document.addEventListener('change', function(e) {
    if (e.target.name === 'payment') {
        if (e.target.value === 'instapay') {
            openInstapayModal();
        } else {
            selectedPayment = e.target.value;
            updatePaymentSelection();
        }
    }
});

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('instapayModal');
    const overlay = document.getElementById('modalOverlay');
    
    if (e.target === overlay) {
        closeInstapayModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('instapayModal');
        if (modal && modal.classList.contains('show')) {
            closeInstapayModal();
        }
    }
});

// Make functions globally available
window.selectPayment = selectPayment;
window.placeOrder = placeOrder;
window.openInstapayModal = openInstapayModal;
window.closeInstapayModal = closeInstapayModal;
window.copyInstapayNumber = copyInstapayNumber;
window.proceedToUpload = proceedToUpload;
window.removeScreenshot = removeScreenshot;
window.confirmPayment = confirmPayment;

console.log('Enhanced checkout system with Instapay modal loaded successfully');