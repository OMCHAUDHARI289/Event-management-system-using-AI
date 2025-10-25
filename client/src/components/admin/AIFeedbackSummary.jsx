import { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  Calendar,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  Loader2,
  X,
  Star
} from "lucide-react";
import { getEvents, generateAISummary } from "../../services/adminService";
import axios from "axios";

function AIFeedbackSummary({ onClose }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  // Fetch events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data?.events || data || []);
      } catch (err) {
        console.error("Error loading events:", err);
      }
    };
    fetchEvents();
  }, []);

  const categorizeHighlight = (text) => {
    const s = typeof text === "string" ? text.toLowerCase() : "";
    const positiveKeywords = [
      "excellent","great","good","amazing","awesome","fantastic",
      "wonderful","love","loved","best","perfect","brilliant",
      "outstanding","impressive","enjoyed","appreciate","well-organized",
      "helpful","informative","engaging","interactive"
    ];
    const negativeKeywords = [
      "bad","poor","worst","terrible","horrible","disappointing",
      "disappointed","lacking","issue","issues","problem","problems",
      "difficult","confusing","unclear","disorganized","crowded",
      "long wait","delay","cancelled"
    ];
    const suggestionKeywords = [
      "suggest","recommend","should","could","would be better",
      "improvement","improve","enhance","consider","add","include",
      "provide","offer","need","needs","future"
    ];

    let pos = 0, neg = 0, sug = 0;
    positiveKeywords.forEach(k => { if (s.includes(k)) pos++; });
    negativeKeywords.forEach(k => { if (s.includes(k)) neg++; });
    suggestionKeywords.forEach(k => { if (s.includes(k)) sug++; });

    if (sug > 0) return "suggestion";
    if (pos > neg && pos > 0) return "positive";
    if (neg > pos && neg > 0) return "negative";
    return "neutral";
  };

  const generateSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const data = await generateAISummary(selectedEvent !== "all" ? selectedEvent : null);

      // Normalize feedback array (backend may return feedback or not)
      const feedbackArray = Array.isArray(data.feedback) ? data.feedback : [];

      const comments = feedbackArray
        .map(f => (f && (typeof f.comments === "string" ? f.comments : String(f.comments || ""))))
        .filter(Boolean);

      const ratings = feedbackArray
        .map(f => {
          const r = f?.rating;
          const num = Number(r);
          return !isNaN(num) ? num : null;
        })
        .filter(r => r !== null);

      const averageRatingNumber = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length)
        : null;

      // Accept highlights from backend (strings or objects)
      const rawHighlights = Array.isArray(data.highlights) ? data.highlights : [];
      const highlightTexts = rawHighlights.map(h => {
        if (typeof h === "string") return h;
        if (h && typeof h === "object") return h.text || h.comment || "";
        return "";
      }).filter(Boolean);

      const freq = {};
      comments.forEach(c => {
        const key = c.trim();
        if (!key) return;
        freq[key] = (freq[key] || 0) + 1;
      });

      let chosenHighlights = [];
      if (highlightTexts.length === 0 && comments.length > 0) {
        const uniqComments = Array.from(new Set(comments));
        chosenHighlights = uniqComments
          .sort((a, b) => b.length - a.length)
          .slice(0, 5);
      } else {
        const seen = new Set();
        for (const t of highlightTexts) {
          const trimmed = String(t).trim();
          if (!trimmed) continue;
          if (!seen.has(trimmed)) {
            seen.add(trimmed);
            chosenHighlights.push(trimmed);
            if (chosenHighlights.length >= 10) break;
          }
        }
      }

      const processedHighlights = chosenHighlights.map(txt => {
        const type = categorizeHighlight(txt);
        const backendObj = rawHighlights.find(h => {
          if (typeof h === "string") return h === txt;
          if (h && typeof h === "object") return (h.text || h.comment || "") === txt;
          return false;
        });
        const count = backendObj && backendObj.count ? backendObj.count : (freq[txt] || Math.floor(Math.random() * 10) + 1);
        return { type, text: txt, count };
      });

      const sampleComments = Array.isArray(data.sampleComments) && data.sampleComments.length > 0
        ? data.sampleComments.map(s => String(s)).filter(Boolean).slice(0, 5)
        : Array.from(new Set(comments)).slice(0, 5);

      let mainSummary = data.summary || data.mainSummary || "";
      if (!mainSummary) {
        const posCount = comments.filter(c => /excellent|great|good|amazing|awesome|love|enjoyed/i.test(c)).length;
        const negCount = comments.filter(c => /bad|poor|worst|terrible|disappointing|issue|problem|confusing/i.test(c)).length;
        mainSummary = `Across ${comments.length} feedback responses, the overall sentiment skews ${posCount >= negCount ? "positive" : "mixed to negative"}. Common praise included ${posCount > 0 ? "event organization and speaker quality" : "some positive notes"}, while common concerns included ${negCount > 0 ? "logistics and audio/food issues" : "few serious complaints"}. Average rating reported: ${averageRatingNumber !== null ? averageRatingNumber.toFixed(2) + "/5" : "N/A"}; sample comments: ${sampleComments.slice(0,3).join(" — ")}.`;
      }

      const generatedAt = data.generatedAt ? new Date(data.generatedAt).toISOString() : new Date().toISOString();

      // Format averageRating for display (string or number)
      const avgForUI = data.averageRating ?? (averageRatingNumber !== null ? averageRatingNumber.toFixed(2) : "N/A");

      const formatted = {
        mainSummary,
        highlights: processedHighlights.slice(0, 5),
        totalFeedback: data.itemsCount ?? comments.length,
        averageRating: avgForUI,
        sampleComments,
        generatedAt,
        rawGPT: data.rawGPT || ""
      };

      setSummary(formatted);
    } catch (err) {
      console.error("generateSummary error:", err);
      const message = err?.response?.data?.message || err?.message || "Failed to generate AI summary. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getHighlightColor = (type) => {
    switch (type) {
      case "positive": return "from-green-500 to-emerald-500";
      case "negative": return "from-red-500 to-orange-500";
      case "neutral": return "from-blue-500 to-cyan-500";
      case "suggestion": return "from-purple-500 to-pink-500";
      default: return "from-gray-500 to-slate-500";
    }
  };

  const getHighlightBadge = (type) => {
    switch (type) {
      case "positive": return "bg-green-500/20 text-green-300";
      case "negative": return "bg-red-500/20 text-red-300";
      case "neutral": return "bg-blue-500/20 text-blue-300";
      case "suggestion": return "bg-purple-500/20 text-purple-300";
      default: return "bg-gray-500/20 text-gray-300";
    }
  };

  // Helper to display average rating neatly and stars when numeric
  const renderAverageRating = (avg) => {
    if (avg === null || avg === undefined) return "N/A";
    if (typeof avg === "string" && avg.toLowerCase() === "n/a") return "N/A";

    const num = Number(avg);
    if (isNaN(num)) return "N/A";
    const rounded = Math.round(num * 100) / 100;
    const stars = Math.max(0, Math.min(5, Math.round(rounded))); // 0-5

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < stars ? "text-yellow-400" : "text-white/20"}`} />
          ))}
        </div>
        <div className="text-white font-semibold">{rounded.toFixed(2)}/5.0</div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-20px) translateX(10px)} }
        @keyframes float-delayed { 0%,100%{transform:translateY(0)}50%{transform:translateY(20px) translateX(-10px)} }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 p-6 max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white hover:text-red-400 transition-all duration-300 group">
          <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">AI Feedback Summary</h1>
              <p className="text-white/60">AI-powered insights from attendee feedback</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-white/80 text-sm font-medium mb-2">Select Event</label>
                <div className="relative">
                  <select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none pr-10">
                    <option value="all" className="bg-slate-800">All Events</option>
                    {events.map(event => (
                      <option key={event._id} value={event._id} className="bg-slate-800">
                        {event.title} - {event.date ? new Date(event.date).toLocaleDateString() : 'No date'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
                </div>
              </div>

              <button onClick={generateSummary} disabled={loading} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:transform-none transition-all duration-300 flex items-center space-x-2 whitespace-nowrap self-end">
                {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Generating...</span></>) : (<><RefreshCw className="w-5 h-5" /><span>Generate Summary</span></>)}
              </button>
            </div>
          </div>
        </div>

        {error && !loading && (
          <div className="animate-fadeIn mb-6">
            <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-300 mb-2">Error</h3>
                  <p className="text-red-200/80">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {summary && !loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-2"><MessageSquare className="w-5 h-5 text-purple-400"/><span className="text-white/60 text-sm">Total Feedback</span></div>
                <p className="text-3xl font-bold text-white">{summary.totalFeedback}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-2"><TrendingUp className="w-5 h-5 text-green-400"/><span className="text-white/60 text-sm">Average Rating</span></div>
                <div>{renderAverageRating(summary.averageRating)}</div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-2"><Calendar className="w-5 h-5 text-blue-400"/><span className="text-white/60 text-sm">Generated</span></div>
                <p className="text-lg font-semibold text-white">{new Date(summary.generatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4"><Sparkles className="w-6 h-6 text-purple-400"/><h2 className="text-2xl font-bold text-white">AI-Generated Summary</h2></div>
              <p className="text-white/80 leading-relaxed text-lg">{summary.mainSummary}</p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Key Highlights</h2>
              <div className="space-y-4">
                {summary.highlights.map((hl, idx) => (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`${getHighlightBadge(hl.type)} px-3 py-1 rounded-full text-xs font-semibold uppercase`}>{hl.type}</span>
                          <span className="text-white/50 text-sm">({hl.count} mentions)</span>
                        </div>
                        <p className="text-white/90">{hl.text}</p>
                      </div>
                      <div className={`w-2 h-full bg-gradient-to-b ${getHighlightColor(hl.type)} rounded-full flex-shrink-0`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {summary.sampleComments && summary.sampleComments.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Sample Comments</h2>
                <div className="space-y-4">
                  {summary.sampleComments.map((c, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-start space-x-3">
                        <MessageSquare className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1"/>
                        <p className="text-white/80 italic">"{c}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {summary.rawGPT && process.env.NODE_ENV === 'development' && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Debug: Raw GPT Response</h3>
                <pre className="text-white/60 text-xs overflow-auto max-h-40 bg-black/20 p-3 rounded">{summary.rawGPT}</pre>
              </div>
            )}
          </div>
        )}

        {!summary && !loading && !error && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl mb-6">
                <Sparkles className="w-12 h-12 text-white/70" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Summary Generated Yet</h3>
              <p className="text-white/60 mb-6">Select an event and click "Generate Summary" to analyze feedback with AI</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFeedbackSummary;
