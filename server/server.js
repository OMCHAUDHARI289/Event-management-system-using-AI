const dotenv = require('dotenv');
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const mlRoutes = require('./routes/mlRoutes');
const aiRoutes = require('./routes/aiRoutes');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/ml', mlRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const checkGPTStatus = require('./config/openaiConfig');
checkGPTStatus();

console.log("Project ID:", process.env.GC_PROJECT_ID);
console.log("Credentials Path:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

// ================== Gemini Test ==================
(async () => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("🧠 Sending prompt to Gemini...");
    const prompt = `
      You are an event feedback analyzer.
      Analyze these comments: "Excellent", "Great", "Average", "cc", "dd".
      Summarize the key sentiment and feedback in 3-4 lines.
    `;

    const result = await model.generateContent(prompt);

    // ✅ Correct extraction of Gemini text
    const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      console.log("✅ Gemini summary:\n", text);
    } else {
      console.warn("⚠️ Gemini returned empty or invalid content structure:", JSON.stringify(result, null, 2));
    }

  } catch (err) {
    console.error("❌ Gemini test failed:", err.message);
  }
})();
