import fs from "fs";
import fetch from "node-fetch";

const DOMAIN = "https://techiert.com";

async function generateSitemap() {
  try {
    const res = await fetch("https://techiert.onrender.com/api/blogs");

    if (!res.ok) {
      throw new Error(`Failed to fetch blogs, status: ${res.status}`);
    }

    const { blogs } = await res.json();

    // Ensure the response is in the correct format
    if (!Array.isArray(blogs)) {
      throw new Error("API response is not in the expected format: 'blogs' should be an array.");
    }

    // Build sitemap content dynamically
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${blogs.map(post => `
  <url>
    <loc>${DOMAIN}/blog/${post.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  `).join("")}
</urlset>`;

    // Ensure the 'public' directory exists before writing the file
    const outputDir = "public";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Write the sitemap to the public folder
    fs.writeFileSync(`${outputDir}/sitemap.xml`, sitemap.trim());
    console.log("✅ Sitemap generated in public/sitemap.xml");
  } catch (err) {
    console.error("❌ Failed to generate sitemap:", err);
    process.exit(1);
  }
}

generateSitemap();
