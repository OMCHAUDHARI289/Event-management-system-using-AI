// config/openaiConfig.js
require('dotenv').config();
const fetch = require('node-fetch'); // for Node.js fetch (if Node < 18)

const checkGPTStatus = async () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("⚠️  OPENAI_API_KEY missing in .env");
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (response.ok) {
      console.log("🤖 GPT connection successful — AI features are ready!");
    } else {
      console.error("❌ GPT API error:", response.status, response.statusText);
    }
  } catch (err) {
    console.error("🚨 Failed to connect to OpenAI API:", err.message);
  }
};

// ✅ Export the function directly
module.exports = checkGPTStatus;
