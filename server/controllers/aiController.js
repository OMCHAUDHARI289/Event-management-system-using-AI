const fetch = global.fetch || require('node-fetch');
const Registration = require('../models/Registration');

exports.summarizeFeedback = async (req, res) => {
  try {
    // 1️⃣ Normalize incoming feedback from request body
    let feedback = Array.isArray(req.body?.feedback) ? req.body.feedback : null;

    // 2️⃣ If no feedback in body, fetch from DB
    if (!feedback || feedback.length === 0) {
      const query = { 'feedback.comments': { $exists: true, $ne: '' } };
      if (req.query?.eventId) query.eventId = req.query.eventId;

      const regs = await Registration.find(query)
        .sort({ updatedAt: -1 })
        .limit(200)
        .lean();

      if (!regs || regs.length === 0) {
        return res.status(400).json({
          message: 'No feedback found in request body or database',
        });
      }

      feedback = regs.map(r => ({
        registrationId: r._id,
        eventId: r.eventId,
        rating: r.feedback?.rating,
        comments: r.feedback?.comments ? String(r.feedback.comments) : '',
      })).filter(f => f.comments.trim());
    }

    // 3️⃣ Concatenate all comments into a single text block
    const comments = feedback
      .map(f => typeof f === 'string' ? f : f.comments)
      .filter(Boolean)
      .join('\n');

    if (!comments) {
      return res.status(400).json({ message: 'No textual feedback available to summarize' });
    }

    // 4️⃣ Debug mode: return aggregated feedback without calling AI
    if (req.query?.debug === 'true') {
      return res.json({
        debug: true,
        itemsCount: feedback.length,
        sampleComments: feedback.slice(0, 10).map(f => typeof f === 'string' ? f : f.comments),
        rawComments: comments,
      });
    }

    // 5️⃣ AI summarization using OpenAI if API key is set
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const prompt = `You are a helpful assistant. Summarize the following event feedback into a concise paragraph and 3 short bullet highlights:\n\n${comments}`;

        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 400,
            temperature: 0.6,
          }),
        });

        const data = await resp.json();
        const summary = data?.choices?.[0]?.message?.content || '';

        if (summary) {
          return res.json({
            summary,
            itemsCount: feedback.length,
            sampleComments: feedback.slice(0, 5).map(f => typeof f === 'string' ? f : f.comments),
          });
        }
      } catch (err) {
        console.error('OpenAI request failed:', err);
        // fallback will be used below
      }
    }

    // 6️⃣ Fallback summarization if AI unavailable or failed
    const lines = comments.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 12);
    const paragraph = lines.slice(0, 4).join(' ');
    const highlights = lines.slice(0, 3).map(l => `- ${l}`).join('\n');
    const fallbackSummary = `${paragraph}\n\nHighlights:\n${highlights}`;

    return res.json({
      summary: fallbackSummary,
      itemsCount: feedback.length,
      sampleComments: feedback.slice(0, 5).map(f => typeof f === 'string' ? f : f.comments),
    });

  } catch (err) {
    console.error('summarizeFeedback error:', err);
    return res.status(500).json({ message: 'Server error', error: err?.message });
  }
};
