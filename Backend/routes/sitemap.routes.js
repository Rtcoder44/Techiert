const express = require('express');
const router = express.Router();
const { generateSitemap } = require('../controllers/sitemap.controller');

router.get('/sitemap.xml', generateSitemap);

module.exports = router; 