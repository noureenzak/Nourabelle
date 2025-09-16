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
            loadOrdersEnhanced();
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
        
        const pendingCount = orders?.filter(order => 
            order.status === 'pending' || order.status === 'payment_pending'
        ).length || 0;
        document.getElementById('pendingOrders').textContent = pendingCount;
        
        // FIXED: Calculate revenue only for confirmed/delivered orders (not cancelled)
        const confirmedOrders = orders?.filter(order => 
            order.status === 'confirmed' || 
            order.status === 'delivered' || 
            order.status === 'processing' || 
            order.status === 'shipped'
        ) || [];
        
        const totalRevenue = confirmedOrders.reduce((sum, order) => 
            sum + parseFloat(order.total_amount || 0), 0
        );
        
        // FIXED: Display in EGP instead of dollars
        document.getElementById('totalRevenue').textContent = `${totalRevenue.toFixed(2)} EGP`;
        
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
        
        // NEW: Out of Stock badge takes priority
        if (product.out_of_stock) {
            badges.push('<span class="badge out-of-stock">Out of Stock</span>');
        } else {
            // Only show other badges if not out of stock
            if (product.featured) badges.push('<span class="badge featured">Bestseller</span>');
            if (product.original_price && product.price < product.original_price) badges.push('<span class="badge sale">Sale</span>');
        }
        
        if (!product.is_active) badges.push('<span class="badge inactive">Inactive</span>');
        
        // Show stock info with flexible sizing - enhanced for Free Size
        let stockInfo = 'No stock data';
        if (product.out_of_stock) {
            stockInfo = 'Product is out of stock';
        } else if (product.stock && typeof product.stock === 'object') {
            const stockEntries = Object.entries(product.stock);
            stockInfo = stockEntries.map(([size, qty]) => {
                // Handle Free Size display
                if (size === 'Free Size' || size === 'freesize') {
                    if (qty === 0) return 'Free Size: Out of Stock';
                    if (qty < 2) return 'Free Size: Low Stock';
                    return 'Free Size: In Stock';
                }
                
                // Handle regular sizes
                if (qty === 0) return `${size}: Out of Stock`;
                if (qty < 2) return `${size}: Low Stock`;
                return `${size}: In Stock`;
            }).join(', ');
        }
        
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
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📁</div>
                <h3>No categories found</h3>
                <p>Create your first category to organize your products</p>
                <button class="primary-btn" onclick="addCategory()">Add Category</button>
            </div>
        `;
        return;
    }
    
    const html = categories.map(category => `
        <div class="category-item enhanced-card">
            <div class="category-info">
                <div class="category-header">
                    <h4 class="category-name">${category.name || 'Untitled'}</h4>
                    <span class="category-status ${category.is_active ? 'active' : 'inactive'}">
                        ${category.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <p class="category-description">${category.description || 'No description provided'}</p>
                <div class="category-meta">
                    <small>Created: ${category.created_at ? new Date(category.created_at).toLocaleDateString() : 'Unknown'}</small>
                </div>
            </div>
            <div class="category-actions">
                <button class="edit-btn enhanced-btn" onclick="editCategory(${category.id})" title="Edit Category">
                    <span class="btn-icon">✏️</span>
                    Edit
                </button>
                <button class="delete-btn enhanced-btn" onclick="deleteCategory(${category.id})" title="Delete Category">
                    <span class="btn-icon">🗑️</span>
                    Delete
                </button>
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
    const freeSizing = document.getElementById('freeSizing');
    const selectedRadio = document.querySelector('input[name="sizingSystem"]:checked');
    
    if (!selectedRadio) return;
    
    const selectedSystem = selectedRadio.value;
    console.log('🎛️ Switching to sizing system:', selectedSystem);
    
    // Hide all sizing grids first
    if (standardSizing) standardSizing.style.display = 'none';
    if (combinedSizing) combinedSizing.style.display = 'none';
    if (freeSizing) freeSizing.style.display = 'none';
    
    // Clear all inputs when switching systems
    clearAllSizeInputs();
    
    // Show the selected system
    switch (selectedSystem) {
        case 'standard':
            if (standardSizing) standardSizing.style.display = 'grid';
            console.log('📏 Standard sizing (S, M, L, XL) activated');
            break;
            
        case 'combined':
            if (combinedSizing) combinedSizing.style.display = 'grid';
            console.log('📏 Combined sizing (S-M, L-XL) activated');
            break;
            
        case 'freesize':
            if (freeSizing) freeSizing.style.display = 'grid';
            console.log('📏 Free Size activated');
            break;
            
        default:
            console.warn('⚠️ Unknown sizing system:', selectedSystem);
            if (standardSizing) standardSizing.style.display = 'grid';
    }
}
// Add this function to your admin.js file (you can add it after the updateSizingSystem function)

// NEW: Handle Out of Stock toggle
function handleOutOfStockToggle() {
    const outOfStockCheckbox = document.getElementById('productOutOfStock');
    const sizeStockContainer = document.querySelector('.size-stock-container');
    const sizingSystemRadios = document.querySelectorAll('input[name="sizingSystem"]');
    
    if (!outOfStockCheckbox) return;
    
    const isOutOfStock = outOfStockCheckbox.checked;
    console.log('🚫 Out of Stock toggle:', isOutOfStock);
    
    if (isOutOfStock) {
        // Disable sizing system and stock inputs
        if (sizeStockContainer) {
            sizeStockContainer.classList.add('disabled');
        }
        
        // Disable sizing system radios
        sizingSystemRadios.forEach(radio => {
            radio.disabled = true;
        });
        
        // Clear all stock inputs
        clearAllSizeInputs();
        
        console.log('🚫 Product marked as out of stock - sizing disabled');
        
    } else {
        // Enable sizing system and stock inputs
        if (sizeStockContainer) {
            sizeStockContainer.classList.remove('disabled');
        }
        
        // Enable sizing system radios
        sizingSystemRadios.forEach(radio => {
            radio.disabled = false;
        });
        
        console.log('✅ Product unmarked as out of stock - sizing enabled');
    }
}

// NEW: Clear all size inputs when switching systems
function clearAllSizeInputs() {
    const allSizeInputs = [
        'stockS', 'stockM', 'stockL', 'stockXL', // Standard
        'stockSM', 'stockLXL', // Combined
        'stockFreeSize' // Free Size
    ];
    
    allSizeInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = 0;
    });
}

// UPDATED: Enhanced product sizing detection with Free Size support
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
    const hasCombinedSizes = stockKeys.some(key => ['S-M', 'L-XL'].includes(key));
    const hasFreeSize = stockKeys.some(key => ['Free Size', 'freesize', 'FREESIZE'].includes(key));
    
    if (hasFreeSize) {
        setFreeSizing(stock);
    } else if (hasCombinedSizes) {
        setCombinedSizing(stock);
    } else if (hasStandardSizes) {
        setStandardSizing(stock);
    } else {
        // Default to standard if unknown
        console.log('Unknown sizing system, defaulting to standard');
        setStandardSizing();
    }
}
// NEW: Set free sizing system
function setFreeSizing(stock = {}) {
    console.log('Setting free sizing system');
    
    // Select free size radio button
    const freesizeRadio = document.querySelector('input[name="sizingSystem"][value="freesize"]');
    if (freesizeRadio) {
        freesizeRadio.checked = true;
        updateSizingSystem();
    }
    
    // Fill stock value
    const freeSizeKeys = ['Free Size', 'freesize', 'FREESIZE'];
    let freeSizeStock = 0;
    
    for (const key of freeSizeKeys) {
        if (stock[key] !== undefined) {
            freeSizeStock = stock[key];
            break;
        }
    }
    
    const input = document.getElementById('stockFreeSize');
    if (input) {
        input.value = freeSizeStock || 0;
    }
}

// NEW: Set standard sizing system
// UPDATED: Enhanced setStandardSizing function
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
// UPDATED: Enhanced setCombinedSizing function
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
        { key: 'L-XL', id: 'stockLXL' }
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
// UPDATED: Enhanced fillProductForm function with Out of Stock support
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
    
    // Handle checkboxes
    const activeCheckbox = document.getElementById('productActive');
    if (activeCheckbox) activeCheckbox.checked = product.is_active;
    
    const bestsellerCheckbox = document.getElementById('productBestseller');
    if (bestsellerCheckbox) bestsellerCheckbox.checked = product.featured;
    
    // NEW: Handle out of stock checkbox
    const outOfStockCheckbox = document.getElementById('productOutOfStock');
    if (outOfStockCheckbox) {
        outOfStockCheckbox.checked = product.out_of_stock || false;
        handleOutOfStockToggle(); // Apply the toggle effects
    }
    
    // Handle flexible sizing system - only if not out of stock
    if (!product.out_of_stock) {
        handleProductSizing(product.stock);
    }
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
    clearAllSizeInputs();
    
    // Reset checkboxes
    const activeCheckbox = document.getElementById('productActive');
    if (activeCheckbox) activeCheckbox.checked = true;
    
    const bestsellerCheckbox = document.getElementById('productBestseller');
    if (bestsellerCheckbox) bestsellerCheckbox.checked = false;
    
    const outOfStockCheckbox = document.getElementById('productOutOfStock');
    if (outOfStockCheckbox) {
        outOfStockCheckbox.checked = false;
        handleOutOfStockToggle(); // Reset the toggle effects
    }
}
// admin.js - Complete Fixed Admin Dashboard Script - PART 4 (Save Product & Image Functions)

// FIXED: Enhanced saveProduct function with flexible sizing
async function saveProduct(e) {
    e.preventDefault();
    
    try {
        showLoading(true);
        
        // Get out of stock status first
        const isOutOfStock = document.getElementById('productOutOfStock')?.checked || false;
        
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
        
        // Get sizing system and stock - ENHANCED with Free Size support
        let stock = {};
        
        if (isOutOfStock) {
            // If out of stock, set stock to empty or zero values
            stock = { 'out_of_stock': true };
            console.log('📦 Product marked as out of stock, no stock data needed');
        } else {
            const sizingSystemRadio = document.querySelector('input[name="sizingSystem"]:checked');
            const sizingSystem = sizingSystemRadio ? sizingSystemRadio.value : 'standard';
            
            switch (sizingSystem) {
                case 'freesize':
                    stock = {
                        'Free Size': parseInt(document.getElementById('stockFreeSize')?.value || 0)
                    };
                    break;
                    
                case 'combined':
                    stock = {
                        'S-M': parseInt(document.getElementById('stockSM')?.value || 0),
                        'L-XL': parseInt(document.getElementById('stockLXL')?.value || 0)
                    };
                    break;
                    
                case 'standard':
                default:
                    stock = {
                        'S': parseInt(document.getElementById('stockS')?.value || 0),
                        'M': parseInt(document.getElementById('stockM')?.value || 0),
                        'L': parseInt(document.getElementById('stockL')?.value || 0),
                        'XL': parseInt(document.getElementById('stockXL')?.value || 0)
                    };
                    break;
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
            features: features,
            stock: stock,
            is_active: document.getElementById('productActive')?.checked || false,
            featured: document.getElementById('productBestseller')?.checked || false,
            out_of_stock: isOutOfStock // NEW: Add out of stock field
        };
        
        console.log('Form data to save:', formData);
        console.log('Stock data:', stock);
        console.log('Out of stock:', isOutOfStock);
        
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
        
        // Stock validation - skip if out of stock
        if (!isOutOfStock) {
            const hasStock = Object.values(stock).some(qty => qty > 0);
            if (!hasStock) {
                throw new Error('Please add stock for at least one size, or mark the product as out of stock');
            }
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
    if (!name || !name.trim()) {
        showMessage('Category name is required', 'error');
        return;
    }
    
    const description = prompt('Enter category description (optional):') || '';
    
    try {
        showLoading(true);
        
        // Check if category already exists (case insensitive)
        const { data: existingCategories } = await supabase
            .from('categories')
            .select('name')
            .ilike('name', name.trim());
        
        if (existingCategories && existingCategories.length > 0) {
            throw new Error('A category with this name already exists');
        }
        
        const categoryData = {
            name: name.trim().toLowerCase(),
            description: description.trim() || null,
            is_active: true,
            created_at: new Date().toISOString(),
        };
        
        console.log('Creating category with data:', categoryData);
        
        const { data, error } = await supabase
            .from('categories')
            .insert([categoryData])
            .select();
        
        if (error) {
            console.error('Category creation error:', error);
            throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Category created successfully:', data);
        showMessage('Category created successfully', 'success');
        
        // Reload categories and update filters
        await loadCategories();
        
    } catch (error) {
        console.error('Error creating category:', error);
        showMessage(`Error creating category: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}


async function addCategory() {
    const name = prompt('Enter category name:');
    if (!name || !name.trim()) {
        showMessage('Category name is required', 'error');
        return;
    }
    
    const description = prompt('Enter category description (optional):') || '';
    
    try {
        showLoading(true);
        
        // Check if category already exists (case insensitive)
        const { data: existingCategories } = await supabase
            .from('categories')
            .select('name')
            .ilike('name', name.trim());
        
        if (existingCategories && existingCategories.length > 0) {
            throw new Error('A category with this name already exists');
        }
        
        const categoryData = {
            name: name.trim().toLowerCase(),
            description: description.trim() || null,
            is_active: true,
            created_at: new Date().toISOString(),
        };
        
        console.log('Creating category with data:', categoryData);
        
        const { data, error } = await supabase
            .from('categories')
            .insert([categoryData])
            .select();
        
        if (error) {
            console.error('Category creation error:', error);
            throw new Error(`Database error: ${error.message}`);
        }
        
        console.log('Category created successfully:', data);
        showMessage('Category created successfully', 'success');
        
        // Reload categories and update filters
        await loadCategories();
        
    } catch (error) {
        console.error('Error creating category:', error);
        showMessage(`Error creating category: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// FIXED: Enhanced category deletion
async function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
        return;
    }
    
    try {
        showLoading(true);
        
        // First check if any products use this category
        const category = allCategories.find(cat => cat.id === id);
        if (category) {
            const { data: productsUsingCategory } = await supabase
                .from('products')
                .select('id')
                .eq('category', category.name);
            
            if (productsUsingCategory && productsUsingCategory.length > 0) {
                const confirmDelete = confirm(
                    `This category is used by ${productsUsingCategory.length} product(s). ` +
                    `Deleting it will not affect existing products, but they won't be able to select this category in the future. Continue?`
                );
                if (!confirmDelete) return;
            }
        }
        
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
        
        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }
        
        showMessage('Category deleted successfully', 'success');
        await loadCategories(); // Reload categories
        
    } catch (error) {
        console.error('Error deleting category:', error);
        showMessage(`Error deleting category: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// FIXED: Enhanced category editing
async function editCategory(id) {
    const category = allCategories.find(cat => cat.id === id);
    if (!category) {
        showMessage('Category not found', 'error');
        return;
    }
    
    const newName = prompt('Enter new category name:', category.name);
    if (!newName || !newName.trim()) {
        return;
    }
    
    const newDescription = prompt('Enter new category description:', category.description || '');
    
    try {
        showLoading(true);
        
        const updateData = {
            name: newName.trim().toLowerCase(),
            description: newDescription.trim() || null
            // Removed: updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', id);
        
        if (error) {
            throw new Error(`Database error: ${error.message}`);
        }
        
        showMessage('Category updated successfully', 'success');
        await loadCategories();
        
    } catch (error) {
        console.error('Error updating category:', error);
        showMessage(`Error updating category: ${error.message}`, 'error');
    } finally {
        showLoading(false);
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
        await loadOrdersEnhanced (); // Reload orders
        
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

// FIXED: Close order modal with X button working
function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.remove('show');
        console.log('Order modal closed');
    }
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


//order--------------------------------------
// Enhanced Admin Orders Management - admin.js UPDATE
// Add these functions to your existing admin.js file

// Enhanced load orders function with new fields
async function loadOrdersEnhanced() {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        allOrders = data || [];
        renderOrdersEnhanced(allOrders);
        
    } catch (error) {
        console.error('Error loading orders:', error);
        const container = document.getElementById('ordersTableBody');
        if (container) {
            container.innerHTML = '<tr><td colspan="7">Error loading orders</td></tr>';
        }
    }
}

// Enhanced render orders with new columns
function renderOrdersEnhanced(orders) {
    const container = document.getElementById('ordersTableBody');
    if (!container) return;
    
    if (!orders.length) {
        container.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    <div class="empty-state-small">
                        <div class="empty-icon">📋</div>
                        <p>No orders found</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    const html = orders.map(order => {
        const statusClass = getStatusClass(order.status);
        const paymentIcon = getPaymentIcon(order.payment_method);
        
        return `
            <tr class="order-row" data-id="${order.id}">
                <td class="order-number-cell">
                    <div class="order-number-wrapper">
                        <strong class="order-number">#${order.order_number || 'N/A'}</strong>
                        ${order.payment_screenshot ? '<div class="screenshot-indicator">📷 Screenshot</div>' : ''}
                    </div>
                </td>
                <td class="customer-cell">
                    <div class="customer-info">
                        <div class="customer-name">${order.customer_name || 'Unknown'}</div>
                        <div class="customer-email">${order.customer_email || 'N/A'}</div>
                        <div class="customer-phone">${order.customer_phone || 'N/A'}</div>
                    </div>
                </td>
                <td class="amount-cell">
                    <div class="amount-wrapper">
                        <div class="total-amount">${order.total_amount || '0.00'} EGP</div>
                        <div class="payment-method">${paymentIcon} ${formatPaymentMethod(order.payment_method)}</div>
                    </div>
                </td>
                <td class="status-cell">
                    <span class="status-badge ${statusClass}">${formatStatus(order.status)}</span>
                </td>
                <td class="date-cell">
                    <div class="date-wrapper">
                        <div class="order-date">${order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</div>
                        <div class="order-time">${order.created_at ? new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</div>
                    </div>
                </td>
                <td class="actions-cell">
                    <div class="action-group">
                        <button class="view-btn enhanced-btn" onclick="viewOrderDetails(${order.id})" title="View Order Details">
                             View
                        </button>
                        <select class="status-select enhanced-select" onchange="updateOrderStatus(${order.id}, this.value)">
    <option value="">Change Status</option>
    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
</select>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// Helper functions for order display
function getStatusClass(status) {
    const statusClasses = {
        'pending': 'status-pending',
        'payment_pending': 'status-warning',
        'confirmed': 'status-confirmed',
        'processing': 'status-processing',
        'shipped': 'status-shipped',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
}

function getPaymentIcon(method) {
    const icons = {
        'cod': '💵',
        'instapay': '📱',
        'bank': '🏦'
    };
    return icons[method] || '💳';
}

function formatPaymentMethod(method) {
    const methods = {
        'cod': 'Cash on Delivery',
        'instapay': 'Instapay',
        'bank': 'Bank Transfer'
    };
    return methods[method] || method;
}

function formatStatus(status) {
    const statuses = {
        'pending': 'Pending',
        'payment_pending': 'Payment Pending',
        'confirmed': 'Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statuses[status] || status;
}

// Enhanced view order details function
async function viewOrderDetails(orderId) {
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();
            
        if (error) {
            throw error;
        }
        
        showOrderDetailsModal(order);
        
    } catch (error) {
        console.error('Error loading order details:', error);
        showMessage('Error loading order details', 'error');
    }
}

// FIXED: Enhanced order details modal - Copy & Paste this function
function showOrderDetailsModal(order) {
    const modal = document.getElementById('orderModal');
    const orderDetails = document.getElementById('orderDetails');
    
    if (!modal || !orderDetails) {
        console.error('Order modal elements not found');
        return;
    }
    
    // Build comprehensive address string
    let fullAddress = '';
    if (typeof order.shipping_address === 'object' && order.shipping_address !== null) {
        const addr = order.shipping_address;
        fullAddress = addr.street_address || '';
        if (addr.building_info) fullAddress += `\nBuilding: ${addr.building_info}`;
        if (addr.floor) fullAddress += `\nFloor: ${addr.floor}`;
        if (addr.apartment_number) fullAddress += `\nApartment: ${addr.apartment_number}`;
        if (addr.landmark) fullAddress += `\nLandmark: ${addr.landmark}`;
        if (addr.postal_code) fullAddress += `\nPostal Code: ${addr.postal_code}`;
    } else if (typeof order.shipping_address === 'string') {
        fullAddress = order.shipping_address;
    }
    
    const orderHtml = `
        <div class="order-details-content">
            <!-- FIXED: Order Header with working close button -->
            <div class="order-header">
                <div class="order-number">
                    <h2>Order #${order.order_number || 'N/A'}</h2>
                    <span class="status-badge ${getStatusClass(order.status)}">${formatStatus(order.status)}</span>
                </div>
                <div class="order-date">
                    <strong>Order Date:</strong> ${order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
                </div>
            </div>

            <!-- Customer Information -->
            <div class="detail-section">
                <h3>Customer Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Name:</strong> ${order.customer_name || 'N/A'}
                    </div>
                    <div class="detail-item">
                        <strong>Email:</strong> <a href="mailto:${order.customer_email || ''}" class="email-link">${order.customer_email || 'N/A'}</a>
                    </div>
                    <div class="detail-item">
                        <strong>Phone:</strong> ${order.customer_phone || 'N/A'}
                    </div>
                </div>
            </div>

            <!-- Shipping Information -->
            <div class="detail-section">
                <h3>Shipping Information</h3>
                <div class="address-block">
                    <pre>${fullAddress || 'No address provided'}</pre>
                </div>
            </div>

            <!-- Payment Information -->
            <div class="detail-section">
                <h3>Payment Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Method:</strong> ${getPaymentIcon(order.payment_method)} ${formatPaymentMethod(order.payment_method)}
                    </div>
                    <div class="detail-item">
                        <strong>Total Amount:</strong> ${order.total_amount || '0.00'} EGP
                    </div>
                    ${order.payment_screenshot ? `
                        <div class="detail-item full-width">
                            <strong>Payment Screenshot:</strong>
                            <div class="screenshot-container">
                                <img src="${order.payment_screenshot}" alt="Payment Screenshot" 
                                     style="max-width: 300px; max-height: 400px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); cursor: pointer;"
                                     onclick="window.open('${order.payment_screenshot}', '_blank')">
                                <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">Click to view full size</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Order Items -->
            <div class="detail-section">
                <h3>Order Items</h3>
                <div class="items-table">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: var(--accent); border-bottom: 2px solid var(--medium-gray);">
                                <th style="padding: 1rem; text-align: left;">Item</th>
                                <th style="padding: 1rem; text-align: center;">Size</th>
                                <th style="padding: 1rem; text-align: center;">Qty</th>
                                <th style="padding: 1rem; text-align: right;">Price</th>
                                <th style="padding: 1rem; text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items ? order.items.map(item => `
                                <tr style="border-bottom: 1px solid var(--medium-gray);">
                                    <td style="padding: 1rem;">
                                        <div style="display: flex; align-items: center; gap: 1rem;">
                                            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;">` : ''}
                                            <div>
                                                <strong>${item.name || 'Product'}</strong>
                                                ${item.category ? `<br><small style="color: #666;">${item.category}</small>` : ''}
                                            </div>
                                        </div>
                                    </td>
                                    <td style="padding: 1rem; text-align: center;">${item.size || 'N/A'}</td>
                                    <td style="padding: 1rem; text-align: center;">${item.quantity || 1}</td>
                                    <td style="padding: 1rem; text-align: right;">${item.price || '0.00'} EGP</td>
                                    <td style="padding: 1rem; text-align: right;"><strong>${((item.price || 0) * (item.quantity || 1)).toFixed(2)} EGP</strong></td>
                                </tr>
                            `).join('') : '<tr><td colspan="5" style="padding: 1rem; text-align: center; color: #666;">No items found</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Order Summary -->
            <div class="detail-section">
                <h3>Order Summary</h3>
                <div class="summary-table">
                    <table style="width: 100%; max-width: 400px; margin-left: auto;">
                        <tr>
                            <td style="padding: 0.5rem; border-bottom: 1px solid var(--medium-gray);">Subtotal:</td>
                            <td style="padding: 0.5rem; border-bottom: 1px solid var(--medium-gray); text-align: right;">${order.subtotal || '0.00'} EGP</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.5rem; border-bottom: 1px solid var(--medium-gray);">Shipping:</td>
                            <td style="padding: 0.5rem; border-bottom: 1px solid var(--medium-gray); text-align: right;">${order.shipping_cost || '0.00'} EGP</td>
                        </tr>
                        <tr style="font-weight: 600; font-size: 1.1rem;">
                            <td style="padding: 1rem 0.5rem 0.5rem; border-top: 2px solid var(--btn);">Total:</td>
                            <td style="padding: 1rem 0.5rem 0.5rem; border-top: 2px solid var(--btn); text-align: right; color: var(--btn);">${order.total_amount || '0.00'} EGP</td>
                        </tr>
                    </table>
                </div>
            </div>

            ${order.notes ? `
                <div class="detail-section">
                    <h3>Order Notes</h3>
                    <div class="notes-block">
                        <p style="background: var(--light-gray); padding: 1rem; border-radius: 8px; margin: 0;">${order.notes}</p>
                    </div>
                </div>
            ` : ''}

            <!-- Quick Actions -->
            <div class="detail-section">
                <h3>Quick Actions</h3>
                <div class="action-buttons">
                    <select id="statusSelect_${order.id}" onchange="updateOrderStatusFromModal(${order.id}, this.value)" style="padding: 8px 12px; margin-right: 1rem; border-radius: 8px; border: 2px solid var(--accent); background: white; color: var(--text); font-family: var(--font);">
                        <option value="">Update Status</option>
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="payment_pending" ${order.status === 'payment_pending' ? 'selected' : ''}>Payment Pending</option>
                        <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                    <button class="email-btn" onclick="sendOrderUpdate('${order.customer_email}', '${order.order_number}')" style="background: var(--btn); color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-family: var(--font); font-weight: 500; margin-right: 10px;">
                        Email Customer
                    </button>
                    <button class="close-modal-btn" onclick="closeOrderModal()" style="background: var(--medium-gray); color: var(--text); border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-family: var(--font); font-weight: 500;">
                        Close
                    </button>
                </div>
            </div>
        </div>

        <style>
        .email-link {
            color: var(--btn);
            text-decoration: none;
        }
        .email-link:hover {
            text-decoration: underline;
        }
        
        .email-btn:hover {
            background: var(--btn-hover) !important;
            transform: translateY(-1px);
        }
        
        .close-modal-btn:hover {
            background: var(--dark-gray) !important;
            color: white;
        }
        
        .order-details-content {
            max-height: 80vh;
            overflow-y: auto;
            padding: 1rem;
        }

        .order-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--accent);
        }

        .order-number h2 {
            margin: 0 0 0.5rem 0;
            color: var(--text);
        }

        .order-date {
            text-align: right;
            color: var(--dark-gray);
        }

        .detail-section {
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: var(--light-gray);
            border-radius: 12px;
        }

        .detail-section h3 {
            margin: 0 0 1rem 0;
            color: var(--btn);
            font-size: 1.2rem;
            border-bottom: 1px solid var(--accent);
            padding-bottom: 0.5rem;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
        }

        .detail-item {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .detail-item.full-width {
            grid-column: 1 / -1;
        }

        .address-block {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .address-block pre {
            margin: 0;
            font-family: var(--font);
            white-space: pre-wrap;
            line-height: 1.6;
        }

        .screenshot-container {
            margin-top: 0.5rem;
        }

        .items-table, .summary-table {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .action-buttons {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
            background: white;
            padding: 1rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        @media (max-width: 768px) {
            .order-header {
                flex-direction: column;
                gap: 1rem;
            }

            .order-date {
                text-align: left;
            }

            .detail-grid {
                grid-template-columns: 1fr;
            }

            .action-buttons {
                flex-direction: column;
                align-items: stretch;
            }

            .action-buttons select,
            .action-buttons button {
                margin: 0.25rem 0;
            }
        }
        </style>
    `;
    
    orderDetails.innerHTML = orderHtml;
    modal.classList.add('show');
    
    // FIXED: Setup close button functionality after modal is shown
    setTimeout(() => {
        const closeBtn = document.querySelector('#orderModal .close-btn');
        if (closeBtn) {
            closeBtn.onclick = closeOrderModal;
        }
    }, 100);
}

// NEW: Update order status from modal
async function updateOrderStatusFromModal(orderId, newStatus) {
    if (!newStatus) return;
    
    try {
        showLoading(true);
        
        const { error } = await supabase
            .from('orders')
            .update({ 
                status: newStatus,
            })
            .eq('id', orderId);
        
        if (error) {
            throw error;
        }
        
        showMessage(`Order status updated to ${formatStatus(newStatus)}`, 'success');
        
        // Update the status badge in the modal
        const statusBadge = document.querySelector('.status-badge');
        if (statusBadge) {
            statusBadge.className = `status-badge ${getStatusClass(newStatus)}`;
            statusBadge.textContent = formatStatus(newStatus);
        }
        
        // Reload orders and overview to reflect changes
        await Promise.all([
            loadOrdersEnhanced(),
            loadOverviewData()
        ]);
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showMessage('Error updating order status', 'error');
    } finally {
        showLoading(false);
    }
}

// Print order function
function printOrder(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) {
        showMessage('Order not found', 'error');
        return;
    }
    
    // Create printable version
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Order #${order.order_number}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
                .section { margin-bottom: 20px; }
                .section h3 { background: #f5f5f5; padding: 10px; margin: 0 0 10px 0; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background: #f5f5f5; }
                .total { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Nourabelle</h1>
                <h2>Order #${order.order_number}</h2>
                <p>Date: ${order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</p>
            </div>
            
            <div class="section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${order.customer_name || 'N/A'}</p>
                <p><strong>Email:</strong> ${order.customer_email || 'N/A'}</p>
                <p><strong>Phone:</strong> ${order.customer_phone || 'N/A'}</p>
            </div>
            
            <div class="section">
                <h3>Shipping Address</h3>
                <pre>${order.shipping_address || 'N/A'}
${order.building_info ? 'Building: ' + order.building_info : ''}
${order.floor ? 'Floor: ' + order.floor : ''}
${order.apartment_number ? 'Apartment: ' + order.apartment_number : ''}
${order.landmark ? 'Landmark: ' + order.landmark : ''}
${order.shipping_city ? 'City: ' + order.shipping_city : ''}
${order.postal_code ? 'Postal Code: ' + order.postal_code : ''}</pre>
            </div>
            
            <div class="section">
                <h3>Order Items</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Size</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items ? order.items.map(item => `
                            <tr>
                                <td>${item.name || 'Product'}</td>
                                <td>${item.size || 'N/A'}</td>
                                <td>${item.quantity || 1}</td>
                                <td>${item.price || '0.00'} EGP</td>
                                <td>${((item.price || 0) * (item.quantity || 1)).toFixed(2)} EGP</td>
                            </tr>
                        `).join('') : '<tr><td colspan="5">No items</td></tr>'}
                        <tr class="total">
                            <td colspan="4">Subtotal:</td>
                            <td>${order.subtotal_amount || '0.00'} EGP</td>
                        </tr>
                        <tr class="total">
                            <td colspan="4">Shipping:</td>
                            <td>${order.shipping_amount || '0.00'} EGP</td>
                        </tr>
                        <tr class="total">
                            <td colspan="4"><strong>Total:</strong></td>
                            <td><strong>${order.total_amount || '0.00'} EGP</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h3>Payment Information</h3>
                <p><strong>Method:</strong> ${formatPaymentMethod(order.payment_method)}</p>
                <p><strong>Status:</strong> ${formatStatus(order.status)}</p>
            </div>
            
            ${order.order_notes ? `
                <div class="section">
                    <h3>Order Notes</h3>
                    <p>${order.order_notes}</p>
                </div>
            ` : ''}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Send order update email
function sendOrderUpdate(customerEmail, orderNumber) {
    const subject = `Order Update - #${orderNumber}`;
    const body = `Dear Customer,\n\nThis is regarding your order #${orderNumber}.\n\nBest regards,\nNourabelle Team`;
    
    const mailtoLink = document.createElement('a');
    mailtoLink.href = `mailto:${customerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    mailtoLink.click();
    
    showMessage(`Opening email for ${customerEmail}`, 'success');
}


// Close order modal
function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    if (modal) modal.classList.remove('show');
}



// Replace the existing loadOrders function in your admin.js with loadOrdersEnhanced
// Also update the switchTab function to call loadOrdersEnhanced instead of loadOrders

console.log('Enhanced admin orders management loaded successfully');


// Make functions globally available for onclick handlers
window.viewOrderDetails = viewOrderDetails;
window.printOrder = printOrder;
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
window.sendOrderUpdate = sendOrderUpdate;
window.updateOrderStatusFromModal = updateOrderStatusFromModal;
window.closeOrderModal = closeOrderModal;
window.addCategory = addCategory;
window.renderCategories = renderCategories;
window.renderOrdersEnhanced = renderOrdersEnhanced;
window.handleOutOfStockToggle = handleOutOfStockToggle;
window.clearAllSizeInputs = clearAllSizeInputs;
window.setFreeSizing = setFreeSizing;

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