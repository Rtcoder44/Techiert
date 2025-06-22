const express = require('express');
const router = express.Router();
const { generateSitemap, getRobotsTxt } = require('../controllers/sitemap.controller');

router.get('/sitemap.xml', generateSitemap);
router.get('/robots.txt', getRobotsTxt);

module.exports = router; 