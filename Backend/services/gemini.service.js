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

    const prompt = `You are an expert e-commerce copywriter. Your goal is to create compelling, human-like, and SEO-friendly product descriptions that are not detectable as AI-generated. The tone should be enthusiastic and helpful.

    Given the following product information:
    Product Title: "${title}"
    Product Description: "${description}"

    Generate the following sections, formatted in Markdown:
    ### ✨ Product Overview
    (An engaging and detailed description of the product. Highlight its key features and what makes it special. Use emojis to make it more appealing.)

    ### 🚀 How to Use
    (Clear, step-by-step instructions on how to use the product. If it's a simple product, explain its various applications. Use emojis where appropriate.)

    ### 💖 Why You'll Love It
    (A bulleted list of the top 3-5 reasons why a customer should buy this product. Focus on benefits, not just features. Start each bullet point with a '*' and use emojis.)

    Ensure the content is:
    - Original and plagiarism-free.
    - Easy to read: Use short paragraphs, headings, and bullet points.
    - Engaging and persuasive.
    - Sounds like it was written by a human expert.

    Do not include any introductory or concluding remarks like "Here is the content you requested". Just provide the content for the three sections.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error('Failed to generate product details.');
  }
}

module.exports = { generateProductDetails }; 