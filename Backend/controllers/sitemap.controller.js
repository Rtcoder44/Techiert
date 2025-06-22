const { SitemapStream, streamToPromise } = require('sitemap');
const Product = require('../models/product.model');
const Blog = require('../models/blogs.model');
const redisClient = require('../utils/redisClient');

const BASE_URL = process.env.BASE_URL || 'https://techiert.com';

exports.generateSitemap = async (req, res) => {
  try {
    // Try cache first
    const cached = await redisClient.get('sitemap.xml');
    if (cached) {
      res.header('Content-Type', 'application/xml');
      return res.send(cached);
    }

    const smStream = new SitemapStream({ hostname: BASE_URL });

    // Add static pages
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/store', changefreq: 'daily', priority: 0.9 });
    smStream.write({ url: '/blog', changefreq: 'weekly', priority: 0.8 });

    // Add all products
    const products = await Product.find({}, 'slug updatedAt').lean();
    products.forEach(product => {
      smStream.write({
        url: `/store/product/${product.slug}`,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: product.updatedAt,
      });
    });

    // Add all blogs
    const blogs = await Blog.find({}, 'slug updatedAt').lean();
    blogs.forEach(blog => {
      smStream.write({
        url: `/blog/${blog.slug}`,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: blog.updatedAt,
      });
    });

    smStream.end();
    const sitemapOutput = await streamToPromise(smStream).then(sm => sm.toString());

    // Cache for 10 minutes
    await redisClient.set('sitemap.xml', sitemapOutput, 'EX', 600);

    res.header('Content-Type', 'application/xml');
    res.send(sitemapOutput);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).end();
  }
}; 