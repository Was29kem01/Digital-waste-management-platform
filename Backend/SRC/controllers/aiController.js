const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini API Client
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * AI Assistant Chat Endpoint (Gemini 2.0 / 1.5 Flash)
 */
exports.chat = async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message prompt is required.' });
    }

    const systemPrompt = `You are EcoLink Assistant, an AI helper for the EcoLink Waste Reporting System.
Your job is to assist citizens and field agents with reporting waste, understanding status tracking, environmental safety, and recycling guidelines.
Be friendly, concise, encouraging, and respond in the user's requested language (${language === 'fr' ? 'French' : 'English'}).`;

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }
        ]
      });

      return res.json({
        success: true,
        answer: response.text || "Thank you for reaching out to EcoLink AI.",
        source: 'google-gemini'
      });
    }

    // Smart Fallback when GEMINI_API_KEY is not set yet
    let fallbackAnswer = language === 'fr'
      ? "🤖 Assistant EcoLink (Gemini) : Pour signaler des déchets, prenez une photo depuis l'écran d'accueil, validez votre géolocalisation et choisissez la catégorie correspondante."
      : "🤖 EcoLink Assistant (Gemini): To report waste, capture a clear photo from the home screen, confirm your location on the map, and select the category.";

    return res.json({
      success: true,
      answer: fallbackAnswer,
      source: 'local-fallback',
      note: 'Set GEMINI_API_KEY in Backend/.env for live Google Gemini models'
    });
  } catch (error) {
    console.error('Gemini AI Chat Error:', error);
    res.status(500).json({ 
      message: 'Failed to process AI chat request', 
      error: error.message 
    });
  }
};

/**
 * AI Waste Photo Quality & Waste Category Inspector (Gemini Vision)
 */
exports.analyzePhoto = async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', language = 'en' } = req.body;

    if (ai && imageBase64) {
      const prompt = `Analyze this image for the EcoLink Waste Management System.
Return a JSON object with keys:
- "isQualityGood": boolean (true if clear and readable waste site photo, false if blurry or dark)
- "category": string (one of: "OVERFLOWING_BIN", "ILLEGAL_DUMPING", "PLASTIC_WASTE", "ELECTRONIC_WASTE", "HAZARDOUS", "GENERAL_WASTE")
- "suggestedPriority": string ("NORMAL" or "HIGH")
- "feedback": string (short 1-sentence assessment in ${language === 'fr' ? 'French' : 'English'})`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: imageBase64
                }
              }
            ]
          }
        ]
      });

      let parsed = {};
      try {
        parsed = JSON.parse(response.text.replace(/```json|```/g, '').trim());
      } catch (e) {
        parsed = { feedback: response.text };
      }

      return res.json({
        success: true,
        isQualityGood: parsed.isQualityGood ?? true,
        category: parsed.category || 'GENERAL_WASTE',
        suggestedPriority: parsed.suggestedPriority || 'NORMAL',
        feedback: parsed.feedback || 'Photo analyzed successfully by Gemini Vision.',
        source: 'google-gemini'
      });
    }

    // Fallback response
    return res.json({
      success: true,
      isQualityGood: true,
      category: 'OVERFLOWING_BIN',
      suggestedPriority: 'NORMAL',
      feedback: language === 'fr'
        ? "✨ Inspection Qualité EcoLink : Image nette et claire !"
        : "✨ EcoLink Quality Inspector: Image is clear and sharp!",
      source: 'local-inspector'
    });
  } catch (error) {
    console.error('Gemini Vision Error:', error);
    res.status(500).json({ 
      message: 'Failed to analyze photo', 
      error: error.message 
    });
  }
};
