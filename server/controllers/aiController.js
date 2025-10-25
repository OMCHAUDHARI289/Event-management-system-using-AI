require("dotenv").config();
const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ------------------ Gemini Client Setup ------------------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ------------------ AI Summarizer ------------------
async function generateSummaryFromFeedback(feedbackArray) {
  if (!feedbackArray || feedbackArray.length === 0) {
    return { summary: "No feedback provided.", highlights: [] };
  }

  // Extract and clean feedback comments
  const comments = feedbackArray.map(f => f.comments).filter(Boolean);

  // Construct structured JSON prompt
  const prompt = `
You are an AI event feedback summarizer. Analyze the following attendee feedback and return a structured JSON response in this format:

{
  "mainSummary": "A concise summary of the feedback in 3-5 sentences",
  "highlights": [
    { "type": "positive", "text": "Example highlight text", "count": 12 },
    { "type": "suggestion", "text": "Example improvement suggestion", "count": 5 }
  ]
}

Only return valid JSON, nothing else.

Feedback:
${comments.join("\n")}
`;

  try {
    console.log("🧠 Sending structured JSON prompt to Gemini...");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);

    console.log("Gemini raw response:", JSON.stringify(result, null, 2));

    let responseText = "";

    const candidate = result?.response?.candidates?.[0] || result?.candidates?.[0];
    const content = candidate?.content;

    if (content?.parts && Array.isArray(content.parts)) {
      responseText = content.parts.map(p => p.text || "").join("\n").trim();
    }

    if (!responseText) {
      throw new Error("Empty response from Gemini");
    }

    // Try to parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (err) {
      console.warn("⚠️ Gemini returned invalid JSON — attempting cleanup...");
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error("Failed to parse Gemini JSON output");
        }
      } else {
        throw new Error("No valid JSON structure found");
      }
    }

    // Validate structure
    const summary = parsed.mainSummary || "No summary provided.";
    const highlights = Array.isArray(parsed.highlights) ? parsed.highlights : [];

    console.log("✅ Gemini JSON summary parsed successfully");

    return { summary, highlights };

  } catch (err) {
    console.error("❌ Gemini API error:", err.message);
    return {
      summary: "AI summary generation failed due to an error.",
      highlights: feedbackArray.slice(0, 5).map(f => ({
        type: "sample",
        text: f.comments,
        count: 1,
      })),
    };
  }
}

// ======================== GET EVENT FEEDBACK ========================
exports.getEventFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const query = { "feedback.comments": { $exists: true, $ne: "" } };

    if (eventId && eventId !== "all") {
      query.eventId = mongoose.Types.ObjectId.isValid(eventId)
        ? new mongoose.Types.ObjectId(eventId)
        : eventId;
    }

    const feedbackDocs = await Registration.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    if (!feedbackDocs || feedbackDocs.length === 0) {
      return res.json({
        itemsCount: 0,
        feedback: [],
        sampleComments: [],
        averageRating: "N/A",
      });
    }

    const feedback = feedbackDocs.map(r => ({
      registrationId: r._id,
      rating: r.feedback?.rating ?? null,
      comments: r.feedback?.comments ?? "",
      createdAt: r.updatedAt,
    }));

    const ratings = feedback
      .map(f => Number(f.rating))
      .filter(r => !isNaN(r) && r > 0);

    const averageRating =
      ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
        : "N/A";

    return res.json({
      itemsCount: feedback.length,
      feedback,
      sampleComments: feedback.slice(0, 5).map(f => f.comments),
      averageRating,
    });
  } catch (err) {
    console.error("getEventFeedback error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ======================== SUMMARIZE FEEDBACK WITH GEMINI ========================
exports.summarizeFeedback = async (req, res) => {
  try {
    let feedback = Array.isArray(req.body?.feedback) ? req.body.feedback : null;
    const eventId = req.query?.eventId;

    // Fetch feedback from DB if not provided
    if (!feedback || feedback.length === 0) {
      const query = { "feedback.comments": { $exists: true, $ne: "" } };
      if (eventId && eventId !== "all") {
        query.eventId = mongoose.Types.ObjectId.isValid(eventId)
          ? new mongoose.Types.ObjectId(eventId)
          : eventId;
      }

      const regs = await Registration.find(query)
        .sort({ updatedAt: -1 })
        .limit(200)
        .lean();

      feedback = regs
        .map(r => ({
          rating: r.feedback?.rating ?? null,
          comments: r.feedback?.comments ?? "",
        }))
        .filter(f => f.comments && f.comments.trim().length > 0);
    }

    if (!feedback || feedback.length === 0) {
      return res.status(200).json({
        summary: "",
        highlights: [],
        itemsCount: 0,
        sampleComments: [],
        averageRating: "N/A",
      });
    }

    // Calculate average rating
    const ratings = feedback
      .map(f => Number(f.rating))
      .filter(r => !isNaN(r) && r > 0);

    const averageRating =
      ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
        : "N/A";

    // Test mode (no AI call)
    if (req.query?.test === "true") {
      const testSummary = `Based on ${feedback.length} feedback entries, sample comments include: "${feedback
        .slice(0, 5)
        .map(f => f.comments)
        .join('", "')}".`;
      return res.json({
        summary: testSummary,
        highlights: feedback.slice(0, 5).map(f => ({
          type: "sample",
          text: f.comments,
          count: 1,
        })),
        itemsCount: feedback.length,
        sampleComments: feedback.slice(0, 5).map(f => f.comments),
        averageRating,
        testMode: true,
      });
    }

    // Generate AI summary via Gemini
    const aiResult = await generateSummaryFromFeedback(feedback);

    return res.json({
      summary: aiResult.summary,
      highlights: aiResult.highlights,
      itemsCount: feedback.length,
      sampleComments: feedback.slice(0, 5).map(f => f.comments),
      averageRating,
    });
  } catch (err) {
    console.error("summarizeFeedback error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
