const express = require('express');
const router = express.Router();

// Simple password-based auth (for single admin)
const ADMIN_PASSWORD = 'nourabelle2024'; // Change this to something secure

// Login endpoint
router.post('/login', (req, res) => {
  const { password } = req.body;
  
  if (password === ADMIN_PASSWORD) {
    res.json({ 
      success: true, 
      token: 'admin-authenticated',
      message: 'Login successful' 
    });
  } else {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid password' 
    });
  }
});

// Add new product
router.post('/products', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      original_price,
      category,
      images,
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

    // Insert product into database
    const { data, error } = await req.supabase
      .from('products')
      .insert([{
        name: name,
        description: description || '',
        price: parseFloat(price),
        original_price: original_price ? parseFloat(original_price) : null,
        category: category,
        images: images,
        stock: stock || { "Small": 0, "Medium": 0, "Large": 0 },
        featured: featured || false,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data,
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
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      original_price,
      category,
      images,
      stock,
      featured,
      is_active
    } = req.body;

    const { data, error } = await req.supabase
      .from('products')
      .update({
        name: name,
        description: description,
        price: parseFloat(price),
        original_price: original_price ? parseFloat(original_price) : null,
        category: category,
        images: images,
        stock: stock,
        featured: featured,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
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
      data: data,
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
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await req.supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

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

// Get all products (including inactive ones)
router.get('/products', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Toggle product featured status
router.patch('/products/:id/featured', async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    const { data, error } = await req.supabase
      .from('products')
      .update({ featured: featured })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: data,
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

// Duplicate product
router.post('/products/:id/duplicate', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the original product
    const { data: original, error: fetchError } = await req.supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Create duplicate with modified name
    const { data, error } = await req.supabase
      .from('products')
      .insert([{
        name: `${original.name} (Copy)`,
        description: original.description,
        price: original.price,
        original_price: original.original_price,
        category: original.category,
        images: original.images,
        stock: original.stock,
        featured: false, // Don't duplicate featured status
        is_active: true
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data,
      message: 'Product duplicated successfully'
    });
  } catch (error) {
    console.error('Error duplicating product:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;