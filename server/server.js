const dotenv = require("dotenv");
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const mlRoutes = require("./routes/mlRoutes");
const aiRoutes = require("./routes/aiRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
connectDB();

const app = express();

// ✅ Allow frontend (Vercel + local) to access backend
app.use(
  cors({
    origin: [
      "https://icem-events.vercel.app/", // 🔁 replace with your real deployed frontend URL
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// ✅ Handle large JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payment", paymentRoutes);

// ✅ Root route for quick status check
app.get("/", (req, res) => {
  res.send("🎉 ICEM Events API is running successfully!");
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// ✅ Optional: check GPT API status
const checkGPTStatus = require("./config/openaiConfig");
checkGPTStatus();
