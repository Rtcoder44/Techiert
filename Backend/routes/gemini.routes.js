const express = require('express');
const router = express.Router();
const { generateProductContent } = require('../controllers/gemini.controller');

router.post('/generate-product-content', generateProductContent);

module.exports = router; 