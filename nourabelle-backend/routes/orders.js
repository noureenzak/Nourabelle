const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ success: true, message: 'Orders endpoint working' });
});

module.exports = router;
