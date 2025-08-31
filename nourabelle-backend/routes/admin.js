const express = require('express');
const router = express.Router();

// Admin routes placeholder
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Admin endpoint working' });
});

module.exports = router;
