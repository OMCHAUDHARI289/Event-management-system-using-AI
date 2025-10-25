// src/pages/admin/AdminAnalytics.jsx
import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Star,
  MessageSquare,
  Download,
  ChevronDown,
  Calendar,
  Users,
  Award
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import {
  getAnalytics,
  getEvents,
  getEventCategories,
  getEventStats,
  getEventPopularity,
  getEventFeedback,
  generateAISummary
} from "../../services/adminService";
import AIFeedbackSummary from "../../components/admin/AIFeedbackSummary";
import { exportToExcel } from "../../utils/exportData";
import { useToast } from "../../pages/common/Toast";

/**
 * AdminAnalytics
 * - Loads analytics + events
 * - Builds a feedback overview per event (feedback count, avg rating, sample comments, AI summary)
 * - Robust to invalid / HTML responses (falls back safely)
 */

function AdminAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const { addToast } = useToast();
  // analytics data
  const [eventStats, setEventStats] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [popularityData, setPopularityData] = useState([]);
  const [summaryStats, setSummaryStats] = useState([
    { title: "Total Events", value: "-", trend: "up", icon: Calendar, color: "from-blue-500 to-cyan-500" },
    { title: "Total Users", value: "-", trend: "up", icon: Users, color: "from-purple-500 to-pink-500" },
    { title: "Students", value: "-", trend: "up", icon: Users, color: "from-green-500 to-emerald-500" },
    { title: "Club Members", value: "-", trend: "up", icon: Star, color: "from-orange-500 to-red-500" }
  ]);

  // chart defaults (fallback)
  const [categoryData, setCategoryData] = useState([
    { name: "Technical", value: 35, color: "#3b82f6" },
    { name: "Cultural", value: 28, color: "#8b5cf6" },
    { name: "Sports", value: 20, color: "#f97316" },
    { name: "Workshop", value: 17, color: "#10b981" }
  ]);

  // Feedback overview (derived/enriched events list)
  // each item: { _id, title, date, avgRating, sentiment, feedbackCount, sampleComments: [], aiSummary: { summary, highlights } }
  const [feedbackOverview, setFeedbackOverview] = useState([]);
  const [loadingFeedbackOverview, setLoadingFeedbackOverview] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  // Helper: stable delay classes for Tailwind (avoid dynamic `delay-${...}`)
  const delayClasses = ['delay-100', 'delay-200', 'delay-300', 'delay-400'];
  const getDelayClass = (idx) => delayClasses[idx] || delayClasses[delayClasses.length - 1];

  // sentiment helper
  const ratingToSentiment = (rating) => {
    if (rating === null || rating === undefined || rating === "N/A") return "unknown";
    const n = Number(rating);
    if (Number.isNaN(n)) return "unknown";
    if (n >= 4) return "positive";
    if (n >= 2) return "neutral";
    return "negative";
  };

  const handleExport = (type) => {
    switch(type) {
      case "feedback":
        if (!feedbackOverview || feedbackOverview.length === 0) return;
        exportToExcel(
          feedbackOverview.map(ev => ({
            Event: ev.title,
            Date: ev.date ? new Date(ev.date).toLocaleDateString() : "-",
            "Average Rating": ev.avgRating ?? "-",
            Sentiment: ev.sentiment,
            "Feedback Count": ev.feedbackCount,
            "Sample Comments": ev.sampleComments.join("; "),
            "AI Summary": ev.aiSummary?.summary || "-"
          })),
          addToast("Exported feedback overview successfully!", "success"),
          "FeedbackOverview"
        );
        break;

      case "summary":
        exportToExcel(
          summaryStats.map(stat => ({
            Title: stat.title,
            Value: stat.value,
          })),
          "SummaryStats"
        );
        break;

      case "popularity":
        exportToExcel(
          popularityData.map(ev => ({
            Event: ev.name,
            Popularity: ev.popularity,
          })),
          "EventPopularity"
        );
        break;

      case "categories":
        exportToExcel(
          categoryData.map(cat => ({
            Category: cat.name,
            Count: cat.value,
          })),
          "EventCategories"
        );
        break;

      default:
        add
    }
  };

  /**
   * Safe wrapper: fetch feedback for a single event using adminService.getEventFeedback
   * The service already uses axios; still guard against malformed responses.
   */
  const safeGetEventFeedback = async (eventId) => {
    try {
      const feedback = await getEventFeedback(eventId); // returns array or []
      if (!Array.isArray(feedback)) {
        console.warn(`getEventFeedback for ${eventId} returned non-array, falling back.`);
        addToast("Failed to load event feedback", "error");
        return { itemsCount: 0, feedback: [], sampleComments: [], averageRating: "N/A" };
      }

      // get averageRating by scanning feedback objects (service sometimes returns only feedback array)
      const ratings = feedback.map(f => Number(f.rating)).filter(r => !Number.isNaN(r));
      const averageRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : "N/A";

      // sample comments
      const sampleComments = feedback.slice(0, 5).map(f => f.comments || "").filter(Boolean);

      return {
        itemsCount: feedback.length,
        feedback,
        sampleComments,
        averageRating
      };
    } catch (err) {
      console.error("safeGetEventFeedback error:", err?.message || err);
      addToast("Failed to load event feedback", "error");
      return { itemsCount: 0, feedback: [], sampleComments: [], averageRating: "N/A" };
    }
  };

  /**
   * Build the feedback overview for all events.
   * - eventsParam: optional pre-fetched events array. If not provided, will call getEvents().
   * - Fetches feedback for each event in parallel and optionally fetches AI summary (from generateAISummary)
   * - Resilient to single-endpoint failures (returns placeholder entries)
   */
  const fetchFeedbackOverview = async (eventsParam) => {
    setLoadingFeedbackOverview(true);
    setFeedbackError(null);

    try {
      // ensure events array
      let events = Array.isArray(eventsParam) ? eventsParam : null;
      if (!events) {
        const ev = await getEvents();
        events = Array.isArray(ev) ? ev : (ev?.events || []);
      }

      // guard
      if (!Array.isArray(events) || events.length === 0) {
        setFeedbackOverview([]);
        return;
      }

      // Parallel fetch per-event feedback, then optional AI summary
      const items = await Promise.all(events.map(async (ev) => {
        const id = ev._id || ev.id || (ev._doc && ev._doc._id) || null;
        if (!id) {
          return {
            _id: null,
            title: ev.title || ev.name || "Unnamed",
            date: ev.date,
            avgRating: "N/A",
            sentiment: "unknown",
            feedbackCount: 0,
            sampleComments: [],
            aiSummary: null
          };
        }

        // 1) Feedback (safe)
        const feedbackData = await safeGetEventFeedback(id);
        const avgRating = feedbackData.averageRating ?? "N/A";
        const sentiment = ratingToSentiment(avgRating);
        const feedbackCount = feedbackData.itemsCount ?? (Array.isArray(feedbackData.feedback) ? feedbackData.feedback.length : 0);
        const sampleComments = Array.isArray(feedbackData.sampleComments) ? feedbackData.sampleComments : [];

        // 2) AI summary (best-effort) - use generateAISummary service which posts to /api/ai/summarize-feedback
        let aiSummary = null;
        try {
          // Only call AI summary if there is feedback to summarize
          if (feedbackCount > 0) {
            const aiRes = await generateAISummary(id);
            // aiRes expected shape: { summary, highlights, sampleComments, itemsCount, averageRating }
            if (aiRes && typeof aiRes === "object") {
              aiSummary = {
                summary: aiRes.summary ?? "",
                highlights: Array.isArray(aiRes.highlights) ? aiRes.highlights : []
              };
            } else {
              aiSummary = null;
            }
          }
        } catch (aiErr) {
          console.warn(`AI summary failed for ${id}:`, aiErr?.message || aiErr);
          addToast("Failed to generate AI summary", "error");
          aiSummary = null;
        }

        return {
          _id: id,
          title: ev.title || ev.name || "Untitled Event",
          date: ev.date,
          avgRating,
          sentiment,
          feedbackCount,
          sampleComments,
          aiSummary
        };
      }));

      setFeedbackOverview(items);
    } catch (err) {
      console.error("fetchFeedbackOverview overall error:", err);
      addToast("Failed to load feedback overview", "error");
      setFeedbackOverview([]);
    } finally {
      setLoadingFeedbackOverview(false);
    }
  };

  // Load analytics and events on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [analytics, stats, categories, events, popularity] = await Promise.all([
          getAnalytics(),
          getEventStats(),
          getEventCategories(),
          getEvents(),
          getEventPopularity()
        ]);

        // Summary Stats
        const s = analytics?.summary || {};
        setSummaryStats([
          { title: "Total Events", value: s.totalEvents ?? '-', icon: Calendar, color: "from-blue-500 to-cyan-500" },
          { title: "Total Users", value: s.totalUsers ?? '-', icon: Users, color: "from-purple-500 to-pink-500" },
          { title: "Students", value: s.totalStudents ?? '-', icon: Users, color: "from-green-500 to-emerald-500" },
          { title: "Club Members", value: s.totalClubMembers ?? '-', icon: Star, color: "from-orange-500 to-red-500" }
        ]);

        // Event Stats (line chart)
        const computedStats = stats || (analytics?.monthly?.map(m => ({
          month: (m.month || '').slice(5),
          events: m.events,
          registrations: m.registrations,
          attendance: Math.round((m.registrations || 0) * 0.8)
        })) || []);
        setEventStats(computedStats);

        // Event Categories (pie chart)
        setCategoryData(categories || []);

        // Event Popularity (bar chart)
        setPopularityData(popularity || []);

        // Events List (for feedback overview)
        const evList = Array.isArray(events) ? events : (events?.events || []);
        setEventsList(evList);

        // Fetch feedback overview for events (pass list to avoid double fetching inside function)
        await fetchFeedbackOverview(evList);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
        addToast("Failed to load analytics data", "error");
      }
    };

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Styles helper for sentiment badge
  const sentimentBadgeClass = (sentiment) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/20 text-green-300";
      case "negative":
        return "bg-red-500/20 text-red-300";
      case "neutral":
        return "bg-yellow-500/20 text-yellow-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <style>{`
        @keyframes float {0%,100%{transform:translateY(0px) translateX(0px);}50%{transform:translateY(-20px) translateX(10px);} }
        @keyframes float-delayed {0%,100%{transform:translateY(0px) translateX(0px);}50%{transform:translateY(20px) translateX(-10px);} }
        @keyframes fadeIn {from{opacity:0;}to{opacity:1;} }
        @keyframes scaleIn {from{opacity:0;transform:scale(0.95);}to{opacity:1;transform:scale(1);} }
        @keyframes slideIn {from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);} }
        .animate-float{animation:float 6s ease-in-out infinite;}
        .animate-float-delayed{animation:float-delayed 8s ease-in-out infinite;}
        .animate-fadeIn{animation:fadeIn 0.3s ease-out forwards;}
        .animate-scaleIn{animation:scaleIn 0.3s ease-out forwards;}
        .animate-slideIn{animation:slideIn 0.3s ease-out forwards;}
        .delay-100{animation-delay:0.1s;opacity:0;}
        .delay-200{animation-delay:0.2s;opacity:0;}
        .delay-300{animation-delay:0.3s;opacity:0;}
        .delay-400{animation-delay:0.4s;opacity:0;}
      `}</style>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Analytics</h1>
              <p className="text-white/60">Comprehensive event insights and reports</p>
            </div>
          </div>

          <div className="flex items-center space-x-3" style={{ zIndex: 9999, position: 'relative' }}>
            {/* Export Options - Animated Inline Buttons */}
            <div className="flex items-center space-x-2">
              {showExportOptions && (
                <>
                  {[
                    { label: "Feedback", type: "feedback", icon: MessageSquare, color: "from-purple-500 to-pink-500", delay: "0ms" },
                    { label: "Stats", type: "summary", icon: TrendingUp, color: "from-blue-500 to-cyan-500", delay: "100ms" },
                    { label: "Popularity", type: "popularity", icon: Award, color: "from-yellow-500 to-orange-500", delay: "200ms" },
                    { label: "Categories", type: "categories", icon: BarChart3, color: "from-indigo-500 to-purple-500", delay: "300ms" },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          handleExport(item.type);
                          setShowExportOptions(false);
                        }}
                        className="flex items-center space-x-2 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 text-white font-medium px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 animate-slideIn"
                        style={{ animationDelay: item.delay, opacity: 0 }}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {/* Main Export Button */}
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className={`flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ${showExportOptions ? 'ring-2 ring-white/30' : ''}`}
              >
                <Download className="w-5 h-5" />
                <span>Export</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showExportOptions ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {summaryStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-green-500/20 transform hover:scale-105 animate-scaleIn ${getDelayClass(idx)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-1">{stat.title}</p>
                <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Event Statistics */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Event Statistics</h2>
                <p className="text-white/60 text-sm">Monthly overview</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={eventStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#fff' }} />
                  <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }} />
                  <Line type="monotone" dataKey="events" stroke="#3b82f6" strokeWidth={3} name="Events" />
                  <Line type="monotone" dataKey="registrations" stroke="#8b5cf6" strokeWidth={3} name="Registrations" />
                  <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={3} name="Attendance" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Event Categories</h2>
                <p className="text-white/60 text-sm">Distribution by type</p>
              </div>
            </div>
            <div className="w-full h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor:'rgba(15,23,42,0.9)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Event Popularity Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 animate-scaleIn delay-400">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Event Popularity</h2>
              <p className="text-white/60 text-sm">Top events by engagement</p>
            </div>
            <Award className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularityData}>
                <defs>
                  <linearGradient id="colorPopularity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" style={{ fontSize:'12px' }}/>
                <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize:'12px' }}/>
                <Tooltip contentStyle={{ backgroundColor:'rgba(15,23,42,0.9)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', color:'#fff'}} />
                <Legend wrapperStyle={{ color:'rgba(255,255,255,0.8)' }} />
                <Bar dataKey="popularity" fill="url(#colorPopularity)" radius={[8,8,0,0]} name="Popularity Score"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback Overview & Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback Overview */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-400">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Feedback Overview</h2>
                <p className="text-white/60 text-sm">Short per-event feedback & sentiment</p>
              </div>
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>

            {loadingFeedbackOverview ? (
              <div className="text-white/60">Loading feedback overview...</div>
            ) : feedbackError ? (
              <div className="text-red-400">{feedbackError}</div>
            ) : feedbackOverview.length === 0 ? (
              <div className="text-white/60">No feedback available yet.</div>
            ) : (
              <div className="space-y-4">
                {feedbackOverview.map((ev) => (
                  <div key={ev._id || ev.title} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <h3 className="text-white font-semibold">{ev.title}</h3>
                      <p className="text-white/60 text-sm mt-1">
                        {ev.sampleComments && ev.sampleComments.length > 0 ? `"${ev.sampleComments[0]}"` : <span className="italic">No sample comment</span>}
                      </p>
                      <p className="text-white/50 text-xs mt-2">
                        {ev.feedbackCount ?? 0} feedback items
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sentimentBadgeClass(ev.sentiment)}`}>
                        {ev.sentiment}
                      </span>
                      <div className="flex items-center space-x-1 mt-2 text-white/80">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span>{ev.avgRating ? Number(ev.avgRating).toFixed(1) : "-"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Reports */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-400">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Quick Reports</h2>
                <p className="text-white/60 text-sm">Generate custom reports</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { title: "Feedback Summary", desc: "Compiled user feedback", icon: MessageSquare, color: "from-purple-500 to-pink-500" }
              ].map((report, idx) => {
                const Icon = report.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (report.title === "Feedback Summary") {
                        setShowSummaryPopup(true);
                      }
                    }}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all duration-300 group flex items-center space-x-4"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${report.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-white font-semibold mb-1">{report.title}</h3>
                      <p className="text-white/60 text-sm">{report.desc}</p>
                    </div>
                    <Download className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Popup Modal */}
        {showSummaryPopup && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
            onClick={() => setShowSummaryPopup(false)}
          >
            <div
              className="w-full max-w-6xl max-h-[90vh] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <AIFeedbackSummary onClose={() => setShowSummaryPopup(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnalytics;