const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateSummaryFromFeedback(feedbackArray) {
  if (!feedbackArray || feedbackArray.length === 0) {
    return { summary: "No feedback provided" };
  }

  const prompt = `
You are an event feedback summarizer AI. Summarize the following attendee feedback:
- Include positives, negatives, suggestions, and overall sentiment.
- Keep it concise and readable.

Feedback:
${feedbackArray.join("\n")}
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    const summary = result.response.text(); // text output
    return { summary };
  } catch (err) {
    console.error("Gemini API error:", err);
    return { summary: "Failed to generate AI summary" };
  }
}

module.exports = { generateSummaryFromFeedback };
