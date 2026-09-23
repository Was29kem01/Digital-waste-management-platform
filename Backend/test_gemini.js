require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;

async function run() {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: 'Say hello in 5 words for EcoLink waste reporting system.'
    });
    console.log('Gemini Live Response Success:');
    console.log(response.text);
  } catch (err) {
    console.error('Gemini Test Error:', err.message);
  }
}

run();
