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

module.exports = { generateProductDetails }; 