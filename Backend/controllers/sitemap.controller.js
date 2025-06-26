const { SitemapStream, streamToPromise } = require('sitemap');
const Product = require('../models/product.model');
const Blog = require('../models/blogs.model');
const shopifyService = require('../services/shopify.service'); // Import Shopify Service
const gemini = require('../services/gemini.service'); // Import Gemini service
const BASE_URL = 'https://techiert.com';

// Controller to generate robots.txt
exports.getRobotsTxt = (req, res) => {
  res.type('text/plain');
  res.send(
`User-agent: *
Disallow: /api/
Disallow: /admin/

Sitemap: https://techiert.com/sitemap.xml`
  );
};

// Controller to generate a complete sitemap
exports.generateSitemap = async (req, res) => {
  try {
    const smStream = new SitemapStream({ hostname: BASE_URL });

    // Static pages
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/store', changefreq: 'daily', priority: 0.9 });
    smStream.write({ url: '/blog', changefreq: 'weekly', priority: 0.8 });

    // 1. Add Shopify Products
    const shopifyProducts = await shopifyService.fetchProducts({ limit: 250 });
    for (const product of shopifyProducts) {
      let description = product.description;
      if (product.handle && product.title) {
        if (!description || description.trim().length < 20) {
          // Generate description with Gemini if missing or too short
          try {
            description = await gemini.generateProductDetails(product.title, product.title + (product.tags ? (" " + product.tags.join(", ")) : ""));
          } catch (err) {
            console.error(`Gemini failed for product ${product.handle}:`, err.message);
            description = 'High-quality product from Techiert.'; // fallback
          }
        }
        smStream.write({
          url: BASE_URL + `/store/product/${product.handle}`,
          changefreq: 'weekly',
          priority: 0.9,
        });
      }
    }

    // 2. Add Blogs
    const blogs = await Blog.find({}, 'slug updatedAt title content').lean();
    blogs.forEach(blog => {
      if (blog.slug && blog.title && blog.content) {
        smStream.write({
          url: BASE_URL + `/blog/${blog.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: blog.updatedAt,
        });
      }
    });

    smStream.end();
    const sitemapOutput = await streamToPromise(smStream).then(sm => sm.toString());

    res.header('Content-Type', 'application/xml');
    res.send(sitemapOutput);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Sitemap generation error');
  }
}; 