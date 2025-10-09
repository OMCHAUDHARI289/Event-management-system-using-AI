import { useEffect, useMemo, useState } from "react";
import { getStudentEvents, getMyEvents } from "../../services/studentService";
import { Calendar, Clock, MapPin, Users, Award, TrendingUp, CheckCircle, XCircle, Bell, Search, Filter, Star, Ticket } from "lucide-react";

function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [events, my] = await Promise.all([
          getStudentEvents(),
          getMyEvents().catch(() => [])
        ]);
        // normalize
        setAvailableEvents(events.map(e => ({
          id: e._id,
          title: e.title,
          date: e.date,
          time: e.time,
          venue: e.venue,
          category: e.category,
          image: "🎫",
          capacity: e.capacity,
          registered: e.registrations,
          price: "Free"
        })));
        setRegisteredEvents((my || []).map(e => ({
          id: e._id,
          title: e.title,
          date: e.date,
          time: e.time,
          venue: e.venue,
          status: e.status === 'past' ? 'completed' : e.status,
          category: e.category,
          image: "📌",
          participants: e.registrations,
          attended: e.status === 'past'
        })));
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const attended = registeredEvents.filter(e => e.attended).length;
    const upcoming = availableEvents.filter(e => new Date(e.date) > new Date()).length;
    return [
      { label: "Events Attended", value: attended, icon: CheckCircle, color: "from-blue-500 to-cyan-500" },
      { label: "Upcoming Events", value: upcoming, icon: Calendar, color: "from-purple-500 to-pink-500" },
      { label: "Certificates Earned", value: attended, icon: Award, color: "from-orange-500 to-red-500" },
    ];
  }, [registeredEvents, availableEvents]);

  // Achievements
  const achievements = [
    { title: "Event Explorer", desc: "Attended 10+ events", icon: "🎯", earned: true },
    { title: "Early Bird", desc: "Registered within 24hrs", icon: "🐦", earned: true },
    { title: "Tech Enthusiast", desc: "Attended 5 tech events", icon: "💡", earned: false },
    { title: "Perfect Attendance", desc: "100% attendance rate", icon: "⭐", earned: false }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case "ongoing": return "from-green-500 to-emerald-500";
      case "upcoming": return "from-blue-500 to-cyan-500";
      case "completed": return "from-gray-500 to-slate-500";
      default: return "from-purple-500 to-pink-500";
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "ongoing": return "bg-green-500/20 text-green-300";
      case "upcoming": return "bg-blue-500/20 text-blue-300";
      case "completed": return "bg-gray-500/20 text-gray-300";
      default: return "bg-purple-500/20 text-purple-300";
    }
  };

  const filteredEvents = filterStatus === "all" 
    ? registeredEvents 
    : registeredEvents.filter(e => e.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
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
      `}</style>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Welcome back, John! 👋</h1>
              <p className="text-white/60">Here's what's happening with your events</p>
            </div>
            <button className="relative p-3 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl hover:bg-white/10 transition-all">
              <Bell className="w-6 h-6 text-white" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`
                  bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6
                  hover:bg-white/10 transition-all duration-300 cursor-pointer
                  hover:shadow-2xl hover:shadow-purple-500/20
                  transform hover:scale-105 animate-scaleIn delay-${idx * 100}
                `}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - My Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-100">
              <h2 className="text-xl font-bold text-white mb-4">My Events</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all" className="bg-slate-800">All Events</option>
                  <option value="upcoming" className="bg-slate-800">Upcoming</option>
                  <option value="ongoing" className="bg-slate-800">Ongoing</option>
                  <option value="completed" className="bg-slate-800">Completed</option>
                </select>
              </div>
            </div>

            {/* Registered Events List */}
            <div className="space-y-4">
              {filteredEvents.map((event, idx) => (
                <div
                  key={event.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 animate-scaleIn"
                  style={{ animationDelay: `${(idx + 2) * 100}ms`, opacity: 0 }}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Event Icon/Image */}
                    <div className={`bg-gradient-to-br ${getStatusColor(event.status)} w-full sm:w-32 h-32 flex items-center justify-center text-6xl`}>
                      {event.image}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                          <span className="text-white/60 text-sm">{event.category}</span>
                        </div>
                        <span className={`${getStatusBadge(event.status)} px-3 py-1 rounded-full text-xs font-semibold uppercase`}>
                          {event.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center space-x-2 text-white/70">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/70">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/70">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{event.venue}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-white/60">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{event.participants} participants</span>
                        </div>
                        {event.status === "completed" ? (
                          event.attended ? (
                            <button className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-semibold">Attended</span>
                            </button>
                          ) : (
                            <button className="flex items-center space-x-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-lg">
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm font-semibold">Missed</span>
                            </button>
                          )
                        ) : (
                          <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                            <Ticket className="w-4 h-4" />
                            <span className="text-sm font-semibold">View Ticket</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Available Events to Register */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-300">
              <h2 className="text-xl font-bold text-white mb-4">Available Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableEvents.map((event, idx) => (
                  <div
                    key={event.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl mb-2">{event.image}</div>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">{event.category}</span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">{event.title}</h3>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2 text-white/60 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/60 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">{event.registered}/{event.capacity} registered</span>
                      <span className="text-green-400 font-semibold">{event.price}</span>
                    </div>
                    <button className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 rounded-lg transition-all transform hover:scale-105">
                      Register Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Achievements & Activity */}
          <div className="lg:col-span-1 space-y-6">
            {/* Achievements */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Achievements</h2>
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="space-y-3">
                {achievements.map((achievement, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl transition-all ${
                      achievement.earned
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                        : 'bg-white/5 border border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-sm">{achievement.title}</h3>
                        <p className="text-white/60 text-xs">{achievement.desc}</p>
                      </div>
                      {achievement.earned && (
                        <CheckCircle className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-300">
              <h2 className="text-xl font-bold text-white mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Attendance Rate</span>
                  <span className="text-white font-semibold">92%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Events This Month</span>
                  <span className="text-white font-semibold">8</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/70">Participation Score</span>
                  <span className="text-white font-semibold">8.5/10</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-400">
              <h2 className="text-xl font-bold text-white mb-4">Upcoming Deadlines</h2>
              <div className="space-y-3">
                {[
                  { event: "Tech Fest Registration", days: 2 },
                  { event: "Workshop Payment", days: 5 },
                  { event: "Sports Meet Signup", days: 7 }
                ].map((deadline, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white text-sm">{deadline.event}</span>
                    <span className="text-orange-400 text-xs font-semibold">{deadline.days}d left</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;