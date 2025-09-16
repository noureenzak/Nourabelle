// admin.js - Complete Fixed Admin Dashboard Script - PART 1

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
// admin.js - Complete Fixed Admin Dashboard Script - PART 2 (Data Loading Functions)

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

// Render products (FIXED to show Bestseller and flexible sizing)
function renderProducts(products) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    console.log('Rendering products:', products);
    
    if (!products.length) {
        container.innerHTML = '<div class="loading">No products found</div>';
        return;
    }
    
    const html = products.map(product => {
        console.log('Product:', product.name, 'Images:', product.images);
        
        // Handle images properly
        let imageUrl = '';
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            imageUrl = product.images[0];
        }
        
        const image = imageUrl ? 
            `<img src="${imageUrl}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">` :
            '<div style="padding: 50px; text-align: center; color: #999; background: #f5f5f5; border-radius: 8px;">📦<br>No Image</div>';
        
        const badges = [];
        if (product.featured) badges.push('<span class="badge featured">Bestseller</span>'); // Changed to Bestseller
        if (product.original_price && product.price < product.original_price) badges.push('<span class="badge sale">Sale</span>');
        if (!product.is_active) badges.push('<span class="badge inactive">Inactive</span>');
        
        // Show stock info with flexible sizing
        let stockInfo = 'No stock data';
        if (product.stock && typeof product.stock === 'object') {
            const stockEntries = Object.entries(product.stock);
stockInfo = stockEntries.map(([size, qty]) => {
    if (qty === 0) return `${size}: Out of Stock`;
    if (qty < 2) return `${size}: Low Stock`;
    return `${size}: In Stock`;
}).join(', ');        }
        
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">${image}</div>
                <div class="product-info">
                    <div class="product-header">
                        <div class="product-title">${product.name || 'Untitled'}</div>
                    </div>
                    <div class="product-badges">${badges.join('')}</div>
                    <div class="product-price">
                        ${product.price || '0.00'} EGP
                        ${product.original_price ? `<span class="product-original-price">${product.original_price} EGP</span>` : ''}
                    </div>
                    <div class="product-category">${product.category || 'Uncategorized'}</div>
                    <div class="product-stock">${stockInfo}</div>
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
            <td>${order.total_amount || '0.00'} EGP</td>
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
// admin.js - Complete Fixed Admin Dashboard Script - PART 3 (Category & Sizing Functions)

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

// FIXED: Load categories into product select
function loadCategoriesIntoProductSelect() {
    const select = document.getElementById('productCategory');
    if (!select) {
        console.warn('Product category select not found');
        return;
    }
    
    console.log('Loading categories into select. Categories found:', allCategories.length);
    
    const options = allCategories.map(cat => 
        `<option value="${cat.name}">${cat.name}</option>`
    ).join('');
    
    select.innerHTML = '<option value="">Select Category</option>' + options;
    console.log('Categories loaded into select successfully');
}

// FIXED: Function to update sizing system display
function updateSizingSystem() {
    const standardSizing = document.getElementById('standardSizing');
    const combinedSizing = document.getElementById('combinedSizing');
    const selectedRadio = document.querySelector('input[name="sizingSystem"]:checked');
    
    if (!selectedRadio) return;
    
    const selectedSystem = selectedRadio.value;
    
    if (selectedSystem === 'standard') {
        // Show S, M, L, XL inputs and hide S-M, M-L
        if (standardSizing) standardSizing.style.display = 'grid';
        if (combinedSizing) combinedSizing.style.display = 'none';
        
        // Clear combined sizing inputs when switching to standard
        ['stockSM', 'stockML'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = 0;
        });
        
    } else if (selectedSystem === 'combined') {
        // Show S-M, M-L inputs and hide S, M, L, XL
        if (standardSizing) standardSizing.style.display = 'none';
        if (combinedSizing) combinedSizing.style.display = 'grid';
        
        // Clear standard sizing inputs when switching to combined
        ['stockS', 'stockM', 'stockL', 'stockXL'].forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = 0;
        });
    }
}
// NEW: Handle product sizing detection
function handleProductSizing(stock) {
    if (!stock || typeof stock !== 'object') {
        console.log('No stock data, defaulting to standard sizing');
        setStandardSizing();
        return;
    }
    
    const stockKeys = Object.keys(stock);
    console.log('Stock keys found:', stockKeys);
    
    // Determine sizing system based on stock keys
    const hasStandardSizes = stockKeys.some(key => ['S', 'M', 'L', 'XL'].includes(key));
    const hasCombinedSizes = stockKeys.some(key => ['S-M', 'M-L'].includes(key));
    
    if (hasCombinedSizes) {
        setCombinedSizing(stock);
    } else if (hasStandardSizes) {
        setStandardSizing(stock);
    } else {
        // Default to standard if unknown
        console.log('Unknown sizing system, defaulting to standard');
        setStandardSizing();
    }
}

// NEW: Set standard sizing system
function setStandardSizing(stock = {}) {
    console.log('Setting standard sizing system');
    
    // Select standard radio button
    const standardRadio = document.querySelector('input[name="sizingSystem"][value="standard"]');
    if (standardRadio) {
        standardRadio.checked = true;
        updateSizingSystem();
    }
    
    // Fill stock values
    const standardSizes = ['S', 'M', 'L', 'XL'];
    standardSizes.forEach(size => {
        const input = document.getElementById(`stock${size}`);
        if (input) {
            input.value = stock[size] || 0;
        }
    });
}

// NEW: Set combined sizing system
function setCombinedSizing(stock = {}) {
    console.log('Setting combined sizing system');
    
    // Select combined radio button
    const combinedRadio = document.querySelector('input[name="sizingSystem"][value="combined"]');
    if (combinedRadio) {
        combinedRadio.checked = true;
        updateSizingSystem();
    }
    
    // Fill stock values
    const combinedSizes = [
        { key: 'S-M', id: 'stockSM' },
        { key: 'M-L', id: 'stockML' }
    ];
    
    combinedSizes.forEach(({ key, id }) => {
        const input = document.getElementById(id);
        if (input) {
            input.value = stock[key] || 0;
        }
    });
}

// FIXED: Product Modal Functions
function openProductModal(productId = null) {
    currentEditingProduct = productId;
    const modal = document.getElementById('productModal');
    const title = document.getElementById('modalTitle');
    
    console.log('Opening product modal for ID:', productId);
    
    // Update form with image upload FIRST
    updateProductForm();
    
    // ALWAYS load categories into select - FIXED
    loadCategoriesIntoProductSelect();
    
    // Initialize sizing system - FIXED
    setTimeout(() => {
        updateSizingSystem();
    }, 100);
    
    if (productId) {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            console.log('Found product for editing:', product);
            // Use setTimeout to ensure form is updated first
            setTimeout(() => {
                fillProductForm(product);
            }, 200);
            if (title) title.textContent = 'Edit Product';
        }
    } else {
        console.log('Creating new product');
        resetProductForm();
        if (title) title.textContent = 'Add New Product';
    }
    
    if (modal) modal.classList.add('show');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.remove('show');
    currentEditingProduct = null;
    resetProductForm();
}

// FIXED: Enhanced fillProductForm function for flexible sizing
function fillProductForm(product) {
    console.log('Filling form for product:', product);
    
    // Basic product info
    const fields = {
        'productName': product.name || '',
        'productCategory': product.category || '',
        'productDescription': product.description || '',
        'productPrice': product.price || '',
        'productOriginalPrice': product.original_price || ''
    };
    
    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
            console.log(`Set ${id} to:`, value);
        }
    });
    
    // Handle features
    const featuresTextarea = document.getElementById('productFeatures');
    if (featuresTextarea && product.features && Array.isArray(product.features)) {
        featuresTextarea.value = product.features.join('\n');
    }
    
    // Handle images
    const hiddenInput = document.getElementById('productImages');
    if (hiddenInput && product.images && Array.isArray(product.images)) {
        hiddenInput.value = JSON.stringify(product.images);
        displayImagePreviews(product.images);
        console.log('Images set:', product.images);
    }
    
    // FIXED: Handle flexible sizing system
    handleProductSizing(product.stock);
    
    // Handle checkboxes - FIXED to use "Bestseller"
    const activeCheckbox = document.getElementById('productActive');
    if (activeCheckbox) activeCheckbox.checked = product.is_active;
    
    const bestsellerCheckbox = document.getElementById('productBestseller');
    if (bestsellerCheckbox) bestsellerCheckbox.checked = product.featured; // featured = bestseller
}

// FIXED: Enhanced resetProductForm function
function resetProductForm() {
    const form = document.getElementById('productForm');
    if (form) form.reset();
    
    // Clear image preview
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) imagePreview.innerHTML = '';
    
    const hiddenInput = document.getElementById('productImages');
    if (hiddenInput) hiddenInput.value = '';
    
    // Reset features
    const featuresTextarea = document.getElementById('productFeatures');
    if (featuresTextarea) featuresTextarea.value = '';
    
    // Reset to standard sizing
    const standardRadio = document.querySelector('input[name="sizingSystem"][value="standard"]');
    if (standardRadio) {
        standardRadio.checked = true;
        updateSizingSystem();
    }
    
    // Reset all stock inputs
    ['S', 'M', 'L', 'XL'].forEach(size => {
        const input = document.getElementById(`stock${size}`);
        if (input) input.value = 0;
    });
    
    ['SM', 'ML'].forEach(size => {
        const input = document.getElementById(`stock${size}`);
        if (input) input.value = 0;
    });
    
    const activeCheckbox = document.getElementById('productActive');
    if (activeCheckbox) activeCheckbox.checked = true;
    
    const bestsellerCheckbox = document.getElementById('productBestseller');
    if (bestsellerCheckbox) bestsellerCheckbox.checked = false;
}
// admin.js - Complete Fixed Admin Dashboard Script - PART 4 (Save Product & Image Functions)

// FIXED: Enhanced saveProduct function with flexible sizing
async function saveProduct(e) {
    e.preventDefault();
    
    try {
        showLoading(true);
        
        // Get images from hidden input
        let images = [];
        const imagesInput = document.getElementById('productImages');
        if (imagesInput && imagesInput.value) {
            try {
                images = JSON.parse(imagesInput.value);
                console.log('Images to save:', images);
            } catch (e) {
                console.warn('Could not parse images JSON:', e);
                images = [];
            }
        }
        
        // Get features from textarea
        let features = [];
        const featuresInput = document.getElementById('productFeatures');
        if (featuresInput && featuresInput.value.trim()) {
            features = featuresInput.value
                .split('\n')
                .map(feature => feature.trim())
                .filter(feature => feature.length > 0);
        } else {
            // Default features if none provided
            features = [
                'High-quality materials',
                'Comfortable fit',
                'Elegant design',
                'Perfect for daily wear',
                'Easy care instructions'
            ];
        }
        
        // FIXED: Get sizing system and stock
        const sizingSystemRadio = document.querySelector('input[name="sizingSystem"]:checked');
        const sizingSystem = sizingSystemRadio ? sizingSystemRadio.value : 'standard';
        let stock = {};
        
        if (sizingSystem === 'combined') {
            // Combined sizing (S-M, M-L)
            stock = {
                'S-M': parseInt(document.getElementById('stockSM')?.value || 0),
                'M-L': parseInt(document.getElementById('stockML')?.value || 0)
            };
        } else {
            // Standard sizing (S, M, L, XL)
            stock = {
                'S': parseInt(document.getElementById('stockS')?.value || 0),
                'M': parseInt(document.getElementById('stockM')?.value || 0),
                'L': parseInt(document.getElementById('stockL')?.value || 0),
                'XL': parseInt(document.getElementById('stockXL')?.value || 0)
            };
        }
        
        const formData = {
            name: document.getElementById('productName')?.value?.trim() || '',
            category: document.getElementById('productCategory')?.value || '',
            description: document.getElementById('productDescription')?.value?.trim() || '',
            price: parseFloat(document.getElementById('productPrice')?.value || 0),
            original_price: document.getElementById('productOriginalPrice')?.value ? 
                parseFloat(document.getElementById('productOriginalPrice').value) : null,
            images: images, // Array of URLs
            features: features, // Array of feature strings
            stock: stock, // Object with flexible sizing
            is_active: document.getElementById('productActive')?.checked || false,
            featured: document.getElementById('productBestseller')?.checked || false // featured = bestseller
        };
        
        console.log('Form data to save:', formData);
        console.log('Sizing system used:', sizingSystem);
        console.log('Stock data:', stock);
        
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
        
        // Check if at least one size has stock
        const hasStock = Object.values(stock).some(qty => qty > 0);
        if (!hasStock) {
            throw new Error('Please add stock for at least one size');
        }
        
        if (currentEditingProduct) {
            // Update existing product
            console.log('Updating product:', currentEditingProduct);
            const { error } = await supabase
                .from('products')
                .update({ ...formData, updated_at: new Date().toISOString() })
                .eq('id', currentEditingProduct);
            
            if (error) {
                console.error('Update error:', error);
                throw error;
            }
            showMessage('Product updated successfully', 'success');
        } else {
            // Create new product
            console.log('Creating new product');
            const { data, error } = await supabase
                .from('products')
                .insert([{ ...formData, created_at: new Date().toISOString() }])
                .select();
            
            if (error) {
                console.error('Insert error:', error);
                throw error;
            }
            
            console.log('Product created:', data);
            showMessage('Product created successfully', 'success');
        }
        
        closeProductModal();
        await loadProducts(); // Reload products
        
    } catch (error) {
        console.error('Error saving product:', error);
        showMessage('Error saving product: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Image upload functionality
async function uploadProductImages(files) {
    const uploadedUrls = [];
    
    for (const file of files) {
        try {
            console.log('Uploading file:', file.name);
            
            // Create unique filename with timestamp
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `product-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            
            console.log('Generated filename:', fileName);
            
            // Upload to Supabase storage
            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                    contentType: file.type
                });
            
            if (error) {
                console.error('Upload error:', error);
                throw new Error(`Upload failed: ${error.message}`);
            }
            
            console.log('Upload successful:', data);
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);
            
            console.log('Public URL generated:', publicUrl);
            
            // Verify the URL is accessible
            if (publicUrl && publicUrl.includes('supabase')) {
                uploadedUrls.push(publicUrl);
                console.log('URL added to array:', publicUrl);
            } else {
                throw new Error('Invalid URL generated');
            }
            
        } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            showMessage(`Error uploading ${file.name}: ${error.message}`, 'error');
        }
    }
    
    console.log('All uploads completed. URLs:', uploadedUrls);
    return uploadedUrls;
}

// Update product form to handle file uploads
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
                    <small>Select multiple images (hold Ctrl/Cmd)</small>
                </div>
            </div>
            <div class="image-preview" id="imagePreview"></div>
            <input type="hidden" id="productImages" name="images">
        </div>
    `;
    
    // Add drag and drop functionality
    const uploadZone = imageContainer.querySelector('.upload-zone');
    const fileInput = document.getElementById('productImageFiles');
    
    // Handle file input change
    fileInput.addEventListener('change', handleMultipleImageSelection);
    
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
            const dataTransfer = new DataTransfer();
            files.forEach(file => dataTransfer.items.add(file));
            fileInput.files = dataTransfer.files;
            handleMultipleImageSelection();
        }
    });
}

// Handle multiple image selection and upload
async function handleMultipleImageSelection() {
    const fileInput = document.getElementById('productImageFiles');
    const imagePreview = document.getElementById('imagePreview');
    const hiddenInput = document.getElementById('productImages');
    
    if (!fileInput.files.length) return;
    
    console.log(`Uploading ${fileInput.files.length} images...`);
    
    // Show loading state
    imagePreview.innerHTML = '<div class="uploading">Uploading ' + fileInput.files.length + ' images...</div>';
    
    try {
        // Get existing images from hidden input
        let existingUrls = [];
        try {
            existingUrls = JSON.parse(hiddenInput.value || '[]');
        } catch (e) {
            existingUrls = [];
        }
        
        // Upload new images and get URLs
        const newUrls = await uploadProductImages(Array.from(fileInput.files));
        
        if (newUrls.length === 0) {
            throw new Error('No images could be uploaded');
        }
        
        // Combine existing and new URLs
        const allUrls = [...existingUrls, ...newUrls];
        
        // Store all URLs in hidden input
        hiddenInput.value = JSON.stringify(allUrls);
        
        console.log(`Successfully uploaded ${newUrls.length} images. Total: ${allUrls.length}`);
        
        // Show preview of all images
        displayImagePreviews(allUrls);
        
        // Clear file input for next selection
        fileInput.value = '';
        
    } catch (error) {
        console.error('Error handling images:', error);
        imagePreview.innerHTML = '<div class="error">Error uploading images: ' + error.message + '</div>';
    }
}

// Display image previews
function displayImagePreviews(urls) {
    const imagePreview = document.getElementById('imagePreview');
    
    if (!urls || urls.length === 0) {
        imagePreview.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">No images uploaded yet</div>';
        return;
    }
    
    console.log('Displaying images:', urls);
    
    const previewHtml = urls.map((url, index) => {
        const cleanUrl = url.trim();
        return `
            <div class="image-preview-item">
                <img src="${cleanUrl}" 
                     alt="Product image ${index + 1}" 
                     onload="console.log('Image loaded successfully:', this.src)"
                     onerror="console.error('Image failed to load:', this.src); this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div style="display: none; padding: 20px; text-align: center; color: #999; background: #f0f0f0;">
                    Image Error
                </div>
                <button type="button" class="remove-image" onclick="removeImage(${index})">×</button>
            </div>
        `;
    }).join('');
    
    imagePreview.innerHTML = previewHtml;
}

// Remove image from preview
function removeImage(index) {
    const hiddenInput = document.getElementById('productImages');
    
    let urls = [];
    try {
        urls = JSON.parse(hiddenInput.value || '[]');
    } catch (e) {
        urls = [];
    }
    
    // Remove the image at the specified index
    urls.splice(index, 1);
    hiddenInput.value = JSON.stringify(urls);
    
    // Refresh the preview with updated indices
    displayImagePreviews(urls);
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    try {
        showLoading(true);
        console.log('Deleting product:', productId);
        
        // Delete product from database
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
        
        if (error) {
            console.error('Delete error:', error);
            throw error;
        }
        
        showMessage('Product deleted successfully', 'success');
        
        // Reload products immediately
        await loadProducts();
        
        console.log('Product deleted successfully');
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showMessage('Error deleting product: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}
// admin.js - Complete Fixed Admin Dashboard Script - PART 5 (Final Functions & Utilities)

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

// Category management functions (placeholder implementations)
// Replace the placeholder addCategory function with this:
async function addCategory() {
    const name = prompt('Enter category name:');
    if (!name || !name.trim()) return;
    
    const description = prompt('Enter category description (optional):') || '';
    
    try {
        showLoading(true);
        
        const { data, error } = await supabase
            .from('categories')
            .insert([{
                name: name.trim().toLowerCase(),
                description: description.trim(),
                is_active: true,
                created_at: new Date().toISOString()
            }])
            .select();
        
        if (error) throw error;
        
        showMessage('Category created successfully', 'success');
        await loadCategories(); // Reload categories
        
    } catch (error) {
        console.error('Error creating category:', error);
        showMessage('Error creating category: ' + error.message, 'error');
    } finally {
        showLoading(false);
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

// Order management functions (placeholder implementations)
async function updateOrderStatus(id, status) {
    if (!status) return;
    
    try {
        showLoading(true);
        
        const { error } = await supabase
            .from('orders')
            .update({ status: status, updated_at: new Date().toISOString() })
            .eq('id', id);
        
        if (error) {
            throw error;
        }
        
        showMessage(`Order status updated to ${status}`, 'success');
        await loadOrders(); // Reload orders
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showMessage('Error updating order status: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function viewOrder(id) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) {
            throw error;
        }
        
        // Show order details in modal (simplified for now)
        const orderModal = document.getElementById('orderModal');
        const orderDetails = document.getElementById('orderDetails');
        
        if (orderDetails) {
            orderDetails.innerHTML = `
                <div style="padding: 2rem;">
                    <h3>Order #${data.order_number}</h3>
                    <p><strong>Customer:</strong> ${data.customer_name}</p>
                    <p><strong>Email:</strong> ${data.customer_email}</p>
                    <p><strong>Phone:</strong> ${data.customer_phone}</p>
                    <p><strong>Address:</strong> ${data.shipping_address}</p>
                    <p><strong>Total:</strong> ${data.total_amount} EGP</p>
                    <p><strong>Status:</strong> ${data.status}</p>
                    <p><strong>Date:</strong> ${new Date(data.created_at).toLocaleDateString()}</p>
                    ${data.order_notes ? `<p><strong>Notes:</strong> ${data.order_notes}</p>` : ''}
                </div>
            `;
        }
        
        if (orderModal) orderModal.classList.add('show');
        
    } catch (error) {
        console.error('Error viewing order:', error);
        showMessage('Error loading order details: ' + error.message, 'error');
    }
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.classList.remove('show');
}

// Debug function to check database contents
async function debugProducts() {
    console.log('=== DEBUG: Products in Database ===');
    try {
        const { data, error } = await supabase.from('products').select('*');
        console.log('Products found:', data?.length || 0);
        console.log('Products data:', data);
        if (data && data.length > 0) {
            console.log('Sample product:', data[0]);
            console.log('Sample product images:', data[0].images);
            console.log('Sample product stock:', data[0].stock);
        }
        if (error) console.error('Error:', error);
        return data;
    } catch (error) {
        console.error('Debug error:', error);
    }
}

// Debug function to check categories
async function debugCategories() {
    console.log('=== DEBUG: Categories in Database ===');
    try {
        const { data, error } = await supabase.from('categories').select('*');
        console.log('Categories found:', data?.length || 0);
        console.log('Categories data:', data);
        if (error) console.error('Error:', error);
        return data;
    } catch (error) {
        console.error('Debug error:', error);
    }
}

// Make functions globally available for onclick handlers
window.openProductModal = openProductModal;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
window.viewOrder = viewOrder;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.removeImage = removeImage;
window.handleMultipleImageSelection = handleMultipleImageSelection;
window.debugProducts = debugProducts;
window.debugCategories = debugCategories;
window.updateSizingSystem = updateSizingSystem;
window.handleProductSizing = handleProductSizing;
window.setStandardSizing = setStandardSizing;
window.setCombinedSizing = setCombinedSizing;

console.log('Nourabelle Admin Dashboard script loaded successfully - All functions available');

// Initialize sizing system on page load
document.addEventListener('DOMContentLoaded', function() {
    // Make sure sizing system is initialized
    setTimeout(() => {
        const sizingRadios = document.querySelectorAll('input[name="sizingSystem"]');
        sizingRadios.forEach(radio => {
            radio.addEventListener('change', updateSizingSystem);
        });
        
        // Set default to standard
        const standardRadio = document.querySelector('input[name="sizingSystem"][value="standard"]');
        if (standardRadio && !document.querySelector('input[name="sizingSystem"]:checked')) {
            standardRadio.checked = true;
            updateSizingSystem();
        }
    }, 500);
});