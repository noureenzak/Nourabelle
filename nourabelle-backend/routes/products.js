const express = require('express');
const router = express.Router();

// GET /api/products - Get all active products
router.get('/', async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        original_price,
        category,
        images,
        stock,
        featured,
        created_at
      `)
      .eq('is_active', true)
      .order('featured', { ascending: false })
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

module.exports = router;