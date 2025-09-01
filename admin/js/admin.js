// admin.js - Clean Admin Dashboard Script

'use strict';

// Supabase Configuration
const SUPABASE_URL = 'https://ebiwoiaduskjodegnhvq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViaXdvaWFkdXNram9kZWduaHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQ5OTEsImV4cCI6MjA3MjE3MDk5MX0.tuWREO0QuDKfgJQ6fbVpi4UI9ckKUYlqoCy3g2_cJW8';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global State
let allProducts = [];
let allOrders = [];
let allCategories = [];
let currentEditingProduct = null;

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard initializing...');
    
    // Check authentication first
    if (!checkAuth()) {
        return;
    }
    
    // Initialize the dashboard
    initializeApp();
});

// Check authentication
function checkAuth() {
    const token = localStorage.getItem('nourabelle_admin_token');
    const userStr = localStorage.getItem('nourabelle_admin_user');
    
    if (!token || !userStr) {
        console.log('No authentication found, redirecting to login');
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        const user = JSON.parse(userStr);
        document.getElementById('adminName').textContent = user.name || user.email;
        console.log('User authenticated:', user.email);
        return true;
    } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.clear();
        window.location.href = 'login.html';
        return false;
    }
}

// Initialize application
function initializeApp() {
    setupEventListeners();
    loadInitialData();
    console.log('Admin dashboard ready');
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => switchTab(item.dataset.tab));
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Products
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => openProductModal());
    }
    
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', filterProducts);
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterProducts);
    }
    
    // Product Modal
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeProductModal);
    }
    
    const cancelProductBtn = document.getElementById('cancelProductBtn');
    if (cancelProductBtn) {
        cancelProductBtn.addEventListener('click', closeProductModal);
    }
    
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', saveProduct);
    }
    
    // Orders
    const orderSearch = document.getElementById('orderSearch');
    if (orderSearch) {
        orderSearch.addEventListener('input', filterOrders);
    }
    
    const orderStatusFilter = document.getElementById('orderStatusFilter');
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', filterOrders);
    }
    
    // Categories
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', addCategory);
    }
    
    // Settings
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', saveSettings);
    }
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        const productModal = document.getElementById('productModal');
        const orderModal = document.getElementById('orderModal');
        
        if (e.target === productModal) closeProductModal();
        if (e.target === orderModal) closeOrderModal();
    });
}

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Tab switching
function switchTab(tabName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.tab === tabName);
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === tabName);
    });
    
    // Load data for specific tabs
    switch(tabName) {
        case 'overview':
            loadOverviewData();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Load initial data
async function loadInitialData() {
    showLoading(true);
    
    try {
        await Promise.all([
            loadCategories(),
            loadOverviewData()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
        showMessage('Error loading dashboard data', 'error');
    } finally {
        showLoading(false);
    }
}

// Load overview data
async function loadOverviewData() {
    try {
        // Load products
        const { data: products } = await supabase.from('products').select('*');
        
        // Load orders
        const { data: orders } = await supabase.from('orders').select('*');
        
        // Update stats
        document.getElementById('totalProducts').textContent = products?.length || 0;
        document.getElementById('totalOrders').textContent = orders?.length || 0;
        
        const pendingCount = orders?.filter(order => order.status === 'pending').length || 0;
        document.getElementById('pendingOrders').textContent = pendingCount;
        
        const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        
        // Load recent orders
        loadRecentOrders(orders?.slice(-5).reverse() || []);
        
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

// Load recent orders
function loadRecentOrders(orders) {
    const container = document.getElementById('recentOrdersList');
    if (!container) return;
    
    if (!orders.length) {
        container.innerHTML = '<div class="loading">No recent orders</div>';
        return;
    }
    
    const html = orders.map(order => `
        <div class="order-item">
            <div class="order-info">
                <h4>#${order.order_number || 'N/A'}</h4>
                <p>${order.customer_name || 'Unknown'} - $${order.total_amount || '0.00'}</p>
            </div>
            <span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Load products
async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        allProducts = data || [];
        renderProducts(allProducts);
        
    } catch (error) {
        console.error('Error loading products:', error);
        const container = document.getElementById('productsGrid');
        if (container) {
            container.innerHTML = '<div class="loading">Error loading products</div>';
        }
    }
}

// Render products
function renderProducts(products) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (!products.length) {
        container.innerHTML = '<div class="loading">No products found</div>';
        return;
    }
    
    const html = products.map(product => {
        const image = product.images && product.images[0] ? 
            `<img src="${product.images[0]}" alt="${product.name}" onerror="this.style.display='none'">` :
            '📦';
        
        const badges = [];
        if (product.featured) badges.push('<span class="badge featured">Featured</span>');
        if (product.original_price && product.price < product.original_price) badges.push('<span class="badge sale">Sale</span>');
        if (!product.is_active) badges.push('<span class="badge inactive">Inactive</span>');
        
        const stock = product.stock ? 
            `S: ${product.stock.Small || 0}, M: ${product.stock.Medium || 0}, L: ${product.stock.Large || 0}` :
            'No stock data';
        
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">${image}</div>
                <div class="product-info">
                    <div class="product-header">
                        <div class="product-title">${product.name || 'Untitled'}</div>
                    </div>
                    <div class="product-badges">${badges.join('')}</div>
                    <div class="product-price">
                        $${product.price || '0.00'}
                        ${product.original_price ? `<span class="product-original-price">$${product.original_price}</span>` : ''}
                    </div>
                    <div class="product-category">${product.category || 'Uncategorized'}</div>
                    <div class="product-stock">${stock}</div>
                    <div class="product-actions">
                        <button class="edit-btn" onclick="openProductModal(${product.id})">Edit</button>
                        <button class="danger-btn" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Filter products
function filterProducts() {
    const searchInput = document.getElementById('productSearch');
    const categorySelect = document.getElementById('categoryFilter');
    const statusSelect = document.getElementById('statusFilter');
    
    if (!searchInput || !categorySelect || !statusSelect) return;
    
    const search = searchInput.value.toLowerCase();
    const category = categorySelect.value;
    const status = statusSelect.value;
    
    const filtered = allProducts.filter(product => {
        const matchesSearch = (product.name || '').toLowerCase().includes(search) ||
                            (product.description || '').toLowerCase().includes(search);
        const matchesCategory = !category || product.category === category;
        const matchesStatus = !status || product.is_active.toString() === status;
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    renderProducts(filtered);
}

// Load orders
async function loadOrders() {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        allOrders = data || [];
        renderOrders(allOrders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        const container = document.getElementById('ordersTableBody');
        if (container) {
            container.innerHTML = '<tr><td colspan="6">Error loading orders</td></tr>';
        }
    }
}

// Render orders
function renderOrders(orders) {
    const container = document.getElementById('ordersTableBody');
    if (!container) return;
    
    if (!orders.length) {
        container.innerHTML = '<tr><td colspan="6">No orders found</td></tr>';
        return;
    }
    
    const html = orders.map(order => `
        <tr data-id="${order.id}">
            <td>#${order.order_number || 'N/A'}</td>
            <td>
                <div><strong>${order.customer_name || 'Unknown'}</strong></div>
                <div style="font-size: 0.9rem; color: #666;">${order.customer_email || 'N/A'}</div>
            </td>
            <td>$${order.total_amount || '0.00'}</td>
            <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
            <td>${order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="edit-btn" onclick="viewOrder(${order.id})">View</button>
                <select onchange="updateOrderStatus(${order.id}, this.value)" style="margin-left: 0.5rem;">
                    <option value="">Change Status</option>
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
        </tr>
    `).join('');
    
    container.innerHTML = html;
}

// Filter orders
function filterOrders() {
    const searchInput = document.getElementById('orderSearch');
    const statusSelect = document.getElementById('orderStatusFilter');
    
    if (!searchInput || !statusSelect) return;
    
    const search = searchInput.value.toLowerCase();
    const status = statusSelect.value;
    
    const filtered = allOrders.filter(order => {
        const matchesSearch = (order.order_number || '').toLowerCase().includes(search) ||
                            (order.customer_name || '').toLowerCase().includes(search) ||
                            (order.customer_email || '').toLowerCase().includes(search);
        const matchesStatus = !status || order.status === status;
        
        return matchesSearch && matchesStatus;
    });
    
    renderOrders(filtered);
}

// Load categories
async function loadCategories() {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        allCategories = data || [];
        renderCategories(allCategories);
        updateCategoryFilters();
        
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render categories
function renderCategories(categories) {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    if (!categories.length) {
        container.innerHTML = '<div class="loading">No categories found</div>';
        return;
    }
    
    const html = categories.map(category => `
        <div class="category-item">
            <div class="category-info">
                <h4>${category.name || 'Untitled'}</h4>
                <p>${category.description || 'No description'}</p>
            </div>
            <div class="category-actions">
                <button class="edit-btn" onclick="editCategory(${category.id})">Edit</button>
                <button class="danger-btn" onclick="deleteCategory(${category.id})">Delete</button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Update category filters
function updateCategoryFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    const options = allCategories.map(cat => 
        `<option value="${cat.name}">${cat.name}</option>`
    ).join('');
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>' + options;
}

// Product Modal Functions
function openProductModal(productId = null) {
    currentEditingProduct = productId;
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    
    if (productId) {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            fillProductForm(product);
            if (title) title.textContent = 'Edit Product';
        }
    } else {
        resetProductForm();
        if (title) title.textContent = 'Add New Product';
    }
    
    if (modal) modal.classList.add('show');
    loadCategoriesIntoProductSelect();
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('show');
    currentEditingProduct = null;
    resetProductForm();
}

function fillProductForm(product) {
    const fields = {
        'productName': product.name || '',
        'productCategory': product.category || '',
        'productDescription': product.description || '',
        'productPrice': product.price || '',
        'productOriginalPrice': product.original_price || '',
        'productImages': product.images ? product.images.join('\n') : '',
        'stockSmall': product.stock?.Small || 0,
        'stockMedium': product.stock?.Medium || 0,
        'stockLarge': product.stock?.Large || 0
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    });
    
    const activeCheckbox = document.getElementById('productActive');
    if (activeCheckbox) activeCheckbox.checked = product.is_active;
    
    const featuredCheckbox = document.getElementById('productFeatured');
    if (featuredCheckbox) featuredCheckbox.checked = product.featured;
}

function resetProductForm() {
    const form = document.getElementById('productForm');
    if (form) form.reset();
    
    const activeCheckbox = document.getElementById('productActive');
    if (activeCheckbox) activeCheckbox.checked = true;
    
    const featuredCheckbox = document.getElementById('productFeatured');
    if (featuredCheckbox) featuredCheckbox.checked = false;
}
// Add this to your admin.js file - Image upload functionality

// Add this function for handling image uploads
async function uploadProductImages(files) {
    const uploadedUrls = [];
    
    for (const file of files) {
        try {
            // Create unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            // Upload to Supabase storage
            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) throw error;
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);
            
            uploadedUrls.push(publicUrl);
            
        } catch (error) {
            console.error('Error uploading image:', error);
            showMessage(`Error uploading ${file.name}: ${error.message}`, 'error');
        }
    }
    
    return uploadedUrls;
}

// Update the product form to handle file uploads
function updateProductForm() {
    const imagesTextarea = document.getElementById('productImages');
    if (!imagesTextarea) return;
    
    // Replace textarea with file input and preview
    const imageContainer = imagesTextarea.parentElement;
    imageContainer.innerHTML = `
        <label>Product Images</label>
        <div class="image-upload-area">
            <input type="file" id="productImageFiles" multiple accept="image/*" style="display: none;">
            <div class="upload-zone" onclick="document.getElementById('productImageFiles').click()">
                <div class="upload-text">
                    📷 Click to upload images
                    <small>Or drag and drop images here</small>
                </div>
            </div>
            <div class="image-preview" id="imagePreview"></div>
            <input type="hidden" id="productImages" name="images">
        </div>
    `;
    
    // Add drag and drop functionality
    const uploadZone = imageContainer.querySelector('.upload-zone');
    const fileInput = document.getElementById('productImageFiles');
    const imagePreview = document.getElementById('imagePreview');
    
    // Handle file input change
    fileInput.addEventListener('change', handleImageSelection);
    
    // Handle drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
        if (files.length > 0) {
            fileInput.files = createFileList(files);
            handleImageSelection();
        }
    });
}

// Handle image selection and preview
async function handleImageSelection() {
    const fileInput = document.getElementById('productImageFiles');
    const imagePreview = document.getElementById('imagePreview');
    const hiddenInput = document.getElementById('productImages');
    
    if (!fileInput.files.length) return;
    
    // Show loading state
    imagePreview.innerHTML = '<div class="uploading">Uploading images...</div>';
    
    try {
        // Upload images and get URLs
        const uploadedUrls = await uploadProductImages(Array.from(fileInput.files));
        
        // Store URLs in hidden input
        hiddenInput.value = JSON.stringify(uploadedUrls);
        
        // Show preview
        const previewHtml = uploadedUrls.map((url, index) => `
            <div class="image-preview-item">
                <img src="${url}" alt="Product image ${index + 1}">
                <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
            </div>
        `).join('');
        
        imagePreview.innerHTML = previewHtml;
        
    } catch (error) {
        console.error('Error handling images:', error);
        imagePreview.innerHTML = '<div class="error">Error uploading images</div>';
    }
}

// Remove image from preview
function removeImage(index) {
    const hiddenInput = document.getElementById('productImages');
    const imagePreview = document.getElementById('imagePreview');
    
    let urls = [];
    try {
        urls = JSON.parse(hiddenInput.value || '[]');
    } catch (e) {
        urls = [];
    }
    
    urls.splice(index, 1);
    hiddenInput.value = JSON.stringify(urls);
    
    // Update preview
    const previewHtml = urls.map((url, i) => `
        <div class="image-preview-item">
            <img src="${url}" alt="Product image ${i + 1}">
            <button type="button" class="remove-image" onclick="removeImage(${i})">×</button>
        </div>
    `).join('');
    
    imagePreview.innerHTML = previewHtml;
}

// Helper function to create FileList
function createFileList(files) {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    return dataTransfer.files;
}

// Update openProductModal to use new image system
function openProductModal(productId = null) {
    currentEditingProduct = productId;
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    
    // Update form with image upload
    updateProductForm();
    
    if (productId) {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            fillProductForm(product);
            if (title) title.textContent = 'Edit Product';
        }
    } else {
        resetProductForm();
        if (title) title.textContent = 'Add New Product';
    }
    
    if (modal) modal.classList.add('show');
    loadCategoriesIntoProductSelect();
}

// Global function to make removeImage available
window.removeImage = removeImage;

function loadCategoriesIntoProductSelect() {
    const select = document.getElementById('productCategory');
    if (!select) return;
    
    const options = allCategories.map(cat => 
        `<option value="${cat.name}">${cat.name}</option>`
    ).join('');
    
    select.innerHTML = '<option value="">Select Category</option>' + options;
}

// Save product
async function saveProduct(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('productName')?.value || '',
        category: document.getElementById('productCategory')?.value || '',
        description: document.getElementById('productDescription')?.value || '',
        price: parseFloat(document.getElementById('productPrice')?.value || 0),
        original_price: document.getElementById('productOriginalPrice')?.value ? 
            parseFloat(document.getElementById('productOriginalPrice').value) : null,
        images: (document.getElementById('productImages')?.value || '')
            .split('\n')
            .map(url => url.trim())
            .filter(url => url),
        stock: {
            Small: parseInt(document.getElementById('stockSmall')?.value || 0),
            Medium: parseInt(document.getElementById('stockMedium')?.value || 0),
            Large: parseInt(document.getElementById('stockLarge')?.value || 0)
        },
        is_active: document.getElementById('productActive')?.checked || false,
        featured: document.getElementById('productFeatured')?.checked || false
    };
    
    try {
        showLoading(true);
        
        if (currentEditingProduct) {
            const { error } = await supabase
                .from('products')
                .update({ ...formData, updated_at: new Date().toISOString() })
                .eq('id', currentEditingProduct);
            
            if (error) throw error;
            showMessage('Product updated successfully', 'success');
        } else {
            const { error } = await supabase
                .from('products')
                .insert([formData]);
            
            if (error) throw error;
            showMessage('Product created successfully', 'success');
        }
        
        closeProductModal();
        loadProducts();
        
    } catch (error) {
        console.error('Error saving product:', error);
        showMessage('Error saving product: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Utility Functions
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.toggle('show', show);
}

function showMessage(text, type = 'success') {
    const container = document.getElementById('messageContainer');
    if (!container) return;
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    container.appendChild(message);
    
    setTimeout(() => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    }, 5000);
}

// Load settings
function loadSettings() {
    console.log('Settings tab loaded');
}

// Save settings
function saveSettings() {
    showMessage('Settings saved successfully', 'success');
}

// Stub functions for incomplete features
function addCategory() {
    const name = prompt('Enter category name:');
    if (name) {
        showMessage('Category management coming soon', 'info');
    }
}

function editCategory(id) {
    showMessage('Category editing coming soon', 'info');
}

function deleteCategory(id) {
    if (confirm('Delete this category?')) {
        showMessage('Category deletion coming soon', 'info');
    }
}


function fillProductForm(product) {
    const fields = {
        'productName': product.name || '',
        'productCategory': product.category || '',
        'productDescription': product.description || '',
        'productPrice': product.price || '',
        'productOriginalPrice': product.original_price || '',
        'productImages': product.images ? product.images.join('\n') : '',
        'stockSM': product.stock?.['S-M'] || 0,
        'stockML': product.stock?.['M-L'] || 0
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    });
    
    const activeCheckbox = document.getElementById('productActive');
    if (activeCheckbox) activeCheckbox.checked = product.is_active;
    
    const featuredCheckbox = document.getElementById('productFeatured');
    if (featuredCheckbox) featuredCheckbox.checked = product.featured;
} 
// Replace the deleteProduct function in your admin.js with this fixed version

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    try {
        showLoading(true);
        console.log('Deleting product:', productId);
        
        // First get the product to delete images from storage
        const product = allProducts.find(p => p.id == productId); // Use == instead of === for type flexibility
        
        // Delete product from database
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (deleteError) {
            console.error('Delete error:', deleteError);
            throw deleteError;
        }
        
        // If product had images, try to delete them from storage
        if (product && product.images && Array.isArray(product.images)) {
            for (const imageUrl of product.images) {
                try {
                    // Extract filename from URL - handle both Supabase URLs and regular URLs
                    const urlParts = imageUrl.split('/');
                    const fileName = urlParts[urlParts.length - 1];
                    
                    // Only try to delete if it looks like a Supabase storage file
                    if (fileName && imageUrl.includes('supabase')) {
                        await supabase.storage
                            .from('product-images')
                            .remove([fileName]);
                    }
                } catch (storageError) {
                    console.warn('Could not delete image from storage:', storageError);
                    // Continue anyway - don't fail the whole deletion
                }
            }
        }
        
        showMessage('Product deleted successfully', 'success');
        
        // Remove from local array to update UI immediately
        allProducts = allProducts.filter(p => p.id != productId);
        
        // Reload products to update the display
        await loadProducts();
        
        console.log('Product deleted successfully');
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Error deleting product: ' + (error.message || 'Unknown error'), 'error');
    } finally {
        showLoading(false);
    }
}

// Also update the saveProduct function to handle S-M/M-L sizing

async function saveProduct(e) {
    e.preventDefault();
    
    try {
        showLoading(true);
        
        // Get images from hidden input (uploaded URLs) or textarea (URLs)
        let images = [];
        const imagesInput = document.getElementById('productImages');
        if (imagesInput && imagesInput.value) {
            try {
                // Try parsing as JSON first (uploaded files)
                images = JSON.parse(imagesInput.value);
            } catch (e) {
                // If that fails, treat as newline-separated URLs (manual entry)
                images = imagesInput.value
                    .split('\n')
                    .map(url => url.trim())
                    .filter(url => url);
            }
        }
        
        const formData = {
            name: document.getElementById('productName')?.value?.trim() || '',
            category: document.getElementById('productCategory')?.value || '',
            description: document.getElementById('productDescription')?.value?.trim() || '',
            price: parseFloat(document.getElementById('productPrice')?.value || 0),
            original_price: document.getElementById('productOriginalPrice')?.value ? 
                parseFloat(document.getElementById('productOriginalPrice').value) : null,
            images: images,
            stock: {
                'S-M': parseInt(document.getElementById('stockSM')?.value || 0),
                'M-L': parseInt(document.getElementById('stockML')?.value || 0)
            },
            is_active: document.getElementById('productActive')?.checked || false,
            featured: document.getElementById('productFeatured')?.checked || false
        };
        
        // Validation
        if (!formData.name) {
            throw new Error('Product name is required');
        }
        
        if (!formData.category) {
            throw new Error('Product category is required');
        }
        
        if (formData.price <= 0) {
            throw new Error('Product price must be greater than 0');
        }
        
        if (currentEditingProduct) {
            // Update existing product
            const { error } = await supabase
                .from('products')
                .update({ ...formData, updated_at: new Date().toISOString() })
                .eq('id', currentEditingProduct);
            
            if (error) throw error;
            showMessage('Product updated successfully', 'success');
        } else {
            // Create new product
            const { error } = await supabase
                .from('products')
                .insert([{ ...formData, created_at: new Date().toISOString() }]);
            
            if (error) throw error;
            showMessage('Product created successfully', 'success');
        }
        
        closeProductModal();
        await loadProducts();
        
    } catch (error) {
        console.error('Error saving product:', error);
        showMessage('Error saving product: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function updateOrderStatus(id, status) {
    if (status) {
        showMessage('Order status update coming soon', 'info');
    }
}

function viewOrder(id) {
    showMessage('Order viewing coming soon', 'info');
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.classList.remove('show');
}

// Make functions globally available
window.openProductModal = openProductModal;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
window.viewOrder = viewOrder;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;

console.log('Admin dashboard script loaded successfully');