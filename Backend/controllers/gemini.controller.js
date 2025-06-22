const { generateProductDetails } = require('../services/gemini.service');

exports.generateProductContent = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Product title is required.' });
    }

    const generatedContent = await generateProductDetails(title, description || '');

    res.status(200).json({ success: true, content: generatedContent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}; 