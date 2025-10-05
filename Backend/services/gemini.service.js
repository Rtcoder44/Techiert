const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set in the environment variables.');
}
const genAI = new GoogleGenerativeAI(apiKey);

async function generateProductDetails(title, description) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert e-commerce copywriter.\n\nWrite a unique, humanized, SEO-optimized, and plagiarism-free product description for the following product.\n\n- The content must be original, not copied from any source, and should pass AI detection tools.\n- Write in a natural, conversational, and helpful tone, as if you are a real person who has used the product.\n- Avoid generic phrases and AI-sounding language.\n- Use varied sentence structures, idioms, and natural transitions.\n- Include relevant keywords for Google SEO, but do not keyword-stuff.\n- Follow Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) guidelines.\n- Make sure the information is accurate, useful, and helpful for real customers.\n- Do not use any AI disclaimers or robotic language.\n- Format the content in Markdown with the following sections:\n  - ### ✨ Product Overview\n  - ### 🚀 How to Use\n  - ### 💖 Why You'll Love It\n\nGiven the following product information:\nProduct Title: "${title}"\nProduct Description: "${description}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error('Failed to generate product details.');
  }
}

// Generate a full blog post
async function generateBlogContent({ topic, metaTitle, metaDescription, tags, keywords }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an expert human writer, SEO specialist, and Google AdSense consultant.

Write a unique, high-quality, deeply researched, actionable, and humanized blog post on the topic: "${topic}".

STRICT REQUIREMENTS:
- The content MUST be at least 1500 words (preferably more if needed for depth and value).
- The writing must be rich, detailed, and provide real value to the reader (not generic or surface-level).
- Use a natural, conversational, and engaging tone, as if you are a real person with experience. Use idioms, stories, examples, and varied sentence structure.
- The content must be plagiarism-free and undetectable as AI (pass AI detection tools).
- Insert at least 2-3 image placeholders in relevant sections using Markdown: ![Description](IMAGE_UPLOAD_PLACEHOLDER).
- Include at least 2 internal links to other blog posts (use example slugs like /blog/example-post).
- Include at least 2 external links to reputable sources (e.g., Wikipedia, major news, or .gov/.edu sites).
- Do NOT use any generic, repetitive, or AI-sounding language. Avoid filler and fluff.
- Follow Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) and AdSense content quality guidelines.
- Make sure the information is accurate, up-to-date, and genuinely helpful.
- If metaTitle, metaDescription, tags, or keywords are provided, use them for SEO. Otherwise, generate them.
- Format the content in Markdown with clear sections, subheadings, bullet points, and links.
- Do NOT include any AI disclaimers or robotic language.
- The post should be suitable for Google indexing and AdSense approval.

Meta Title: ${metaTitle || ''}
Meta Description: ${metaDescription || ''}
Tags: ${tags ? tags.join(', ') : ''}
Keywords: ${keywords ? keywords.join(', ') : ''}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error generating blog content with Gemini:', error);
    throw new Error('Failed to generate blog content.');
  }
}

// Generate meta title
async function generateMetaTitle(topic) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a highly clickable, SEO-optimized meta title (max 60 characters) for a blog post on the topic: "${topic}". Do not use quotes.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().replace(/"/g, '').trim();
  } catch (error) {
    console.error('Error generating meta title with Gemini:', error);
    throw new Error('Failed to generate meta title.');
  }
}

// Generate meta description
async function generateMetaDescription(topic) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a compelling, SEO-optimized meta description (max 155 characters) for a blog post on the topic: "${topic}". Do not use quotes.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().replace(/"/g, '').trim();
  } catch (error) {
    console.error('Error generating meta description with Gemini:', error);
    throw new Error('Failed to generate meta description.');
  }
}

// Generate tags
async function generateTags(topic) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a comma-separated list of 5-8 relevant tags for a blog post on the topic: "${topic}". Only return the tags, no extra text.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().replace(/\n/g, '').split(',').map(tag => tag.trim()).filter(Boolean);
  } catch (error) {
    console.error('Error generating tags with Gemini:', error);
    throw new Error('Failed to generate tags.');
  }
}

// Generate keywords
async function generateKeywords(topic) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Generate a comma-separated list of 5-10 SEO keywords for a blog post on the topic: "${topic}". Only return the keywords, no extra text.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().replace(/\n/g, '').split(',').map(kw => kw.trim()).filter(Boolean);
  } catch (error) {
    console.error('Error generating keywords with Gemini:', error);
    throw new Error('Failed to generate keywords.');
  }
}

// Generate a detailed blog outline
async function generateBlogOutline({ topic, keywords }) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an expert blog strategist and SEO specialist.\n\nCreate a detailed outline for a long-form, high-quality, humanized, SEO-optimized blog post on the topic: "${topic}".\n\nRequirements:\n- The outline should be suitable for a 1500+ word article.\n- Use H2 and H3 sections.\n- Each section should be substantial and cover a unique aspect of the topic.\n- Use the following keywords for SEO: ${keywords ? keywords.join(', ') : ''}\n- Include sections for introduction, main points, images, internal/external links, and conclusion.\n- The outline should be logical, comprehensive, and engaging.\n- Do NOT write the full content, just the outline.\n`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error generating blog outline with Gemini:', error);
    throw new Error('Failed to generate blog outline.');
  }
}

module.exports = {
  generateProductDetails,
  generateBlogContent,
  generateMetaTitle,
  generateMetaDescription,
  generateTags,
  generateKeywords,
  generateBlogOutline,
  genAI,
}; 