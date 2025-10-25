import api from './api'; // Axios instance with baseURL: http://localhost:5000

export async function checkAIReady() {
  try {
    const resp = await api.get('/api/ai/ready');
    return resp.data.status === 'ready';
  } catch (err) {
    console.error('AI readiness check failed:', err);
    return false;
  }
}


/**
 * Summarize feedback using AI (calls backend)
 * @param {Array|null} allFeedback - Optional local array of feedback (ignored if using backend)
 * @param {Object} options - Optional filters, e.g., { eventId: "123" }
 * @returns {Object} { summary: string, itemsCount: number, sampleComments: string[] }
 */
export async function summarizeFeedback(allFeedback = null, options = {}) {
  try {
    const params = {};
    if (options.eventId) params.eventId = options.eventId;

    const resp = await api.post('/api/ai/summarize-feedback', {}, { params });
    
    return {
      summary: resp.data.summary || 'No summary available.',
      itemsCount: resp.data.itemsCount ?? 0,
      sampleComments: resp.data.sampleComments || []
    };
  } catch (err) {
    console.error('AI summarization failed:', err);
    return {
      summary: 'AI summarization failed.',
      itemsCount: 0,
      sampleComments: []
    };
  }
}
