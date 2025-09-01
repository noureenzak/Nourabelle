const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    try {
      await fs.access(uploadPath);
    } catch {
      await fs.mkdir(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'));
    }
  }
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
};

// Helper function to save base64 images
const saveBase64Image = async (base64Data) => {
  if (!base64Data || !base64Data.startsWith('data:image/')) {
    throw new Error('Invalid image data');
  }
  
  const matches = base64Data.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error('Invalid base64 format');
  }

  const extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const imageBuffer = Buffer.from(matches[2], 'base64');
  const filename = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}.${extension}`;
  const uploadPath = path.join(__dirname, '../uploads');
  
  // Ensure upload directory exists
  try {
    await fs.access(uploadPath);
  } catch {
    await fs.mkdir(uploadPath, { recursive: true });
  }
  
  const filepath = path.join(uploadPath, filename);
  await fs.writeFile(filepath, imageBuffer);
  
  return `/uploads/${filename}`;
};

// ================================
// AUTHENTICATION ROUTES
// ================================

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password required' 
      });
    }
    
    // Check if admin exists
    const { data: admin, error } = await req.supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error('Database error:', error);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    if (!admin) {
      console.log('Admin not found for email:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    console.log('Admin found:', { id: admin.id, email: admin.email });
    
    // Verify password
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Login successful for:', email);
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// Verify token route
router.get('/verify', verifyAdmin, (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

// Create first admin user (run once)
router.post('/setup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if admin already exists
    const { data: existingAdmin } = await req.supabase
      .from('admin_users')
      .select('id')
      .limit(1);
    
    if (existingAdmin && existingAdmin.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Admin already exists' 
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create admin
    const { data, error } = await req.supabase
      .from('admin_users')
      .insert([{
        email,
        password_hash: passwordHash,
        name
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Admin user created successfully'
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ================================
// DASHBOARD ROUTES
// ================================

// Get dashboard statistics
router.get('/dashboard', verifyAdmin, async (req, res) => {
  try {
    // Get product stats
    const { data: products, error: productsError } = await req.supabase
      .from('products')
      .select('id, featured, original_price, is_active');
    
    if (productsError) throw productsError;
    
    // Get order stats
    const { data: orders, error: ordersError } = await req.supabase
      .from('orders')
      .select('id, total_amount, status, created_at');
    
    if (ordersError) throw ordersError;
    
    // Calculate statistics
    const stats = {
      products: {
        total: products?.length || 0,
        active: products?.filter(p => p.is_active).length || 0,
        featured: products?.filter(p => p.featured).length || 0,
        onSale: products?.filter(p => p.original_price).length || 0
      },
      orders: {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        completed: orders?.filter(o => o.status === 'delivered').length || 0,
        totalRevenue: orders
          ?.filter(o => o.status === 'delivered')
          ?.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0) || 0
      },
      recent: {
        orders: orders
          ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          ?.slice(0, 5) || []
      }
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ================================
// PRODUCT MANAGEMENT ROUTES
// ================================

// Get all products (admin view - includes inactive)
router.get('/products', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      count: data ? data.length : 0
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Add new product
router.post('/products', verifyAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      original_price,
      category,
      images,
      sizes,
      stock,
      featured
    } = req.body;
    
    // Validate required fields
    if (!name || !price || !category || !images || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, price, category, and at least one image'
      });
    }
    
    // Process images (convert base64 to files)
    const processedImages = [];
    for (const imageData of images) {
      try {
        if (imageData.startsWith('data:image/')) {
          const imagePath = await saveBase64Image(imageData);
          processedImages.push(`${req.protocol}://${req.get('host')}${imagePath}`);
        } else {
          processedImages.push(imageData); // Already a URL
        }
      } catch (imgError) {
        console.error('Error processing image:', imgError);
      }
    }
    
    if (processedImages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid images provided'
      });
    }
    
    // Insert product
    const { data, error } = await req.supabase
      .from('products')
      .insert([{
        name,
        description: description || '',
        price: parseFloat(price),
        original_price: original_price ? parseFloat(original_price) : null,
        category,
        images: processedImages,
        sizes: sizes || ["Small", "Medium", "Large"],
        stock: stock || {"Small": 0, "Medium": 0, "Large": 0},
        featured: featured || false,
        is_active: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data,
      message: 'Product added successfully'
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update product
router.put('/products/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      original_price,
      category,
      images,
      sizes,
      stock,
      featured,
      is_active
    } = req.body;
    
    // Process images if provided
    let processedImages = [];
    if (images && images.length > 0) {
      for (const imageData of images) {
        try {
          if (imageData.startsWith('data:image/')) {
            const imagePath = await saveBase64Image(imageData);
            processedImages.push(`${req.protocol}://${req.get('host')}${imagePath}`);
          } else {
            processedImages.push(imageData); // Already a URL
          }
        } catch (imgError) {
          console.error('Error processing image:', imgError);
        }
      }
    }
    
    const updateData = {
      name,
      description,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      category,
      sizes: sizes || ["Small", "Medium", "Large"],
      stock: stock || {"Small": 0, "Medium": 0, "Large": 0},
      featured: featured || false,
      is_active: is_active !== undefined ? is_active : true,
      updated_at: new Date().toISOString()
    };
    
    if (processedImages.length > 0) {
      updateData.images = processedImages;
    }
    
    const { data, error } = await req.supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete product
router.delete('/products/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product first to clean up images
    const { data: product } = await req.supabase
      .from('products')
      .select('images')
      .eq('id', id)
      .single();
    
    // Delete product
    const { error } = await req.supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Clean up image files (optional)
    if (product && product.images) {
      for (const imageUrl of product.images) {
        try {
          if (imageUrl.includes('/uploads/')) {
            const filename = imageUrl.split('/uploads/')[1];
            const filepath = path.join(__dirname, '../uploads', filename);
            await fs.unlink(filepath).catch(() => {});
          }
        } catch (cleanupError) {
          console.error('Error cleaning up image:', cleanupError);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Toggle product featured status
router.patch('/products/:id/featured', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    
    const { data, error } = await req.supabase
      .from('products')
      .update({ featured })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: `Product ${featured ? 'featured' : 'unfeatured'} successfully`
    });
  } catch (error) {
    console.error('Error updating featured status:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Bulk operations
router.post('/products/bulk', verifyAdmin, async (req, res) => {
  try {
    const { action, productIds } = req.body;
    
    if (!action || !productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        error: 'Action and product IDs required'
      });
    }
    
    let updateData = {};
    let message = '';
    
    switch (action) {
      case 'delete':
        const { error: deleteError } = await req.supabase
          .from('products')
          .delete()
          .in('id', productIds);
        
        if (deleteError) throw deleteError;
        message = `${productIds.length} products deleted successfully`;
        break;
        
      case 'feature':
        updateData = { featured: true };
        message = `${productIds.length} products featured successfully`;
        break;
        
      case 'unfeature':
        updateData = { featured: false };
        message = `${productIds.length} products unfeatured successfully`;
        break;
        
      case 'activate':
        updateData = { is_active: true };
        message = `${productIds.length} products activated successfully`;
        break;
        
      case 'deactivate':
        updateData = { is_active: false };
        message = `${productIds.length} products deactivated successfully`;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }
    
    if (action !== 'delete') {
      const { error } = await req.supabase
        .from('products')
        .update(updateData)
        .in('id', productIds);
      
      if (error) throw error;
    }
    
    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error in bulk operation:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ================================
// FILE UPLOAD ROUTES
// ================================

// Upload multiple images
router.post('/upload', verifyAdmin, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }
    
    const imageUrls = req.files.map(file => 
      `${req.protocol}://${req.get('host')}/uploads/${file.filename}`
    );
    
    res.json({
      success: true,
      data: imageUrls,
      message: `${req.files.length} images uploaded successfully`
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ================================
// CATEGORY MANAGEMENT
// ================================

// Get all categories
router.get('/categories', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Add category
router.post('/categories', verifyAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name required'
      });
    }
    
    const { data, error } = await req.supabase
      .from('categories')
      .insert([{ name, description }])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data,
      message: 'Category added successfully'
    });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;