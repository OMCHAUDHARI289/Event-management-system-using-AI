import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Star, MessageSquare, Download, Calendar, Users, Eye, ThumbsUp, Award } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAnalytics } from "../../services/adminService";

function AdminAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const [eventStats, setEventStats] = useState([]);

  // Event Popularity Data
  const popularityData = [
    { name: "Tech Fest", popularity: 95, registrations: 500 },
    { name: "Hackathon", popularity: 88, registrations: 420 },
    { name: "Cultural Night", popularity: 92, registrations: 850 },
    { name: "Sports Meet", popularity: 75, registrations: 300 },
    { name: "AI Workshop", popularity: 82, registrations: 280 }
  ];

  // Category Distribution
  const categoryData = [
    { name: "Technical", value: 35, color: "#3b82f6" },
    { name: "Cultural", value: 28, color: "#8b5cf6" },
    { name: "Sports", value: 20, color: "#f97316" },
    { name: "Workshop", value: 17, color: "#10b981" }
  ];

  // Feedback Data
  const feedbackData = [
    {
      id: 1,
      event: "Tech Fest 2025",
      rating: 4.8,
      comments: 45,
      sentiment: "positive",
      highlights: ["Great organization", "Excellent speakers", "Well managed"]
    },
    {
      id: 2,
      event: "Coding Hackathon",
      rating: 4.5,
      comments: 38,
      sentiment: "positive",
      highlights: ["Challenging problems", "Good prizes", "Fun experience"]
    },
    {
      id: 3,
      event: "Cultural Night",
      rating: 4.9,
      comments: 72,
      sentiment: "positive",
      highlights: ["Amazing performances", "Great venue", "Well organized"]
    },
    {
      id: 4,
      event: "Sports Meet",
      rating: 4.2,
      comments: 28,
      sentiment: "neutral",
      highlights: ["Good competition", "Could improve timing", "Nice facilities"]
    }
  ];

  // Summary Stats
  const [summaryStats, setSummaryStats] = useState([
    { title: "Total Events", value: "-", change: "", trend: "up", icon: Calendar, color: "from-blue-500 to-cyan-500" },
    { title: "Total Users", value: "-", change: "", trend: "up", icon: Users, color: "from-purple-500 to-pink-500" },
    { title: "Students", value: "-", change: "", trend: "up", icon: Users, color: "from-green-500 to-emerald-500" },
    { title: "Club Members", value: "-", change: "", trend: "up", icon: Star, color: "from-orange-500 to-red-500" }
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAnalytics();
        const months = (data?.monthly || []).map(m => ({
          month: m.month.slice(5),
          events: m.events,
          registrations: m.registrations,
          attendance: Math.round((m.registrations || 0) * 0.8)
        }));
        setEventStats(months);
        const next = [...summaryStats];
        next[0].value = String(data?.summary?.totalEvents ?? 0);
        next[1].value = String(data?.summary?.totalUsers ?? 0);
        next[2].value = String(data?.summary?.totalStudents ?? 0);
        next[3].value = String(data?.summary?.totalClubMembers ?? 0);
        setSummaryStats(next);
      } catch (e) {
        console.error('Failed to load analytics', e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
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
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="week" className="bg-slate-800">Last Week</option>
              <option value="month" className="bg-slate-800">Last Month</option>
              <option value="year" className="bg-slate-800">Last Year</option>
            </select>
            <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {summaryStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`
                  bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6
                  hover:bg-white/10 transition-all duration-300 cursor-pointer
                  hover:shadow-2xl hover:shadow-green-500/20
                  transform hover:scale-105 animate-scaleIn delay-${idx * 100}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 text-green-400 text-sm font-semibold">
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

        {/* Charts Row 1 */}
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
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
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
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                  />
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
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
                <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }} />
                <Bar dataKey="popularity" fill="url(#colorPopularity)" radius={[8, 8, 0, 0]} name="Popularity Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback & Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Feedback Summary */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-400">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Event Feedback</h2>
                <p className="text-white/60 text-sm">Recent ratings and reviews</p>
              </div>
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-4">
              {feedbackData.map((feedback) => (
                <div key={feedback.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{feedback.event}</h3>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-semibold">{feedback.rating}</span>
                        </div>
                        <span className="text-white/40">•</span>
                        <div className="flex items-center space-x-1 text-white/60">
                          <MessageSquare className="w-4 h-4" />
                          <span>{feedback.comments} comments</span>
                        </div>
                      </div>
                    </div>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${feedback.sentiment === 'positive' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}
                    `}>
                      {feedback.sentiment}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {feedback.highlights.map((highlight, idx) => (
                      <span key={idx} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
                { title: "Attendance Report", desc: "Complete attendance tracking", icon: Users, color: "from-blue-500 to-cyan-500" },
                { title: "Revenue Report", desc: "Financial overview and analysis", icon: TrendingUp, color: "from-green-500 to-emerald-500" },
                { title: "Feedback Summary", desc: "Compiled user feedback", icon: MessageSquare, color: "from-purple-500 to-pink-500" },
                { title: "Event Performance", desc: "Detailed event metrics", icon: BarChart3, color: "from-orange-500 to-red-500" }
              ].map((report, idx) => {
                const Icon = report.icon;
                return (
                  <button
                    key={idx}
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
      </div>
    </div>
  );
}

export default AdminAnalytics;