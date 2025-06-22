const { SitemapStream, streamToPromise } = require('sitemap');
const Product = require('../models/product.model');
const Blog = require('../models/blogs.model');
const BASE_URL = process.env.BASE_URL || 'https://techiert.com';

exports.generateSitemap = async (req, res) => {
  try {
    const smStream = new SitemapStream({ hostname: BASE_URL });

    // Static pages
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/store', changefreq: 'daily', priority: 0.9 });
    smStream.write({ url: '/blog', changefreq: 'weekly', priority: 0.8 });

    // Products
    const products = await Product.find({}, 'slug updatedAt').lean();
    products.forEach(product => {
      smStream.write({
        url: `/store/product/${product.slug}`,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: product.updatedAt,
      });
    });

    // Blogs
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

    res.header('Content-Type', 'application/xml');
    res.send(sitemapOutput);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Sitemap generation error');
  }
}; 