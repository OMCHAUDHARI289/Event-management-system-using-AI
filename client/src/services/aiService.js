import api from './api'; // Axios instance with baseURL: http://localhost:5000

// feedbackData: optional array of feedback items
// options: { eventId: '<id>', debug: true } optional
export const summarizeFeedback = async (feedbackData, options = {}) => {
  try {
    const params = [];
    if (options.eventId) params.push(`eventId=${options.eventId}`);
    if (options.debug) params.push(`debug=true`);

    // Use relative path only, not full URL
    const url = params.length 
      ? `/api/ai/summarize-feedback?${params.join('&')}` 
      : `/api/ai/summarize-feedback`;

    const payload = feedbackData ? { feedback: feedbackData } : {};
    const res = await api.post(url, payload);
    return res.data; // { summary: '...', itemsCount: n, sampleComments: [...] } or debug object
  } catch (err) {
    console.error('AI summarization failed:', err.response?.data || err.message);
    return null;
  }
};
