import React from "react";
import { Calendar, Users, CheckCircle, TrendingUp, Award, Clock, BarChart3, UserCheck, DollarSign, Star } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ClubDashboard = () => {
  // Quick Stats
  const stats = [
    { 
      title: "Total Events", 
      value: "45", 
      change: "+8 this month",
      trend: "up",
      icon: Calendar, 
      color: "from-blue-500 to-cyan-500" 
    },
    { 
      title: "Club Members", 
      value: "12", 
      change: "+3 new",
      trend: "up",
      icon: Users, 
      color: "from-purple-500 to-pink-500" 
    },
    { 
      title: "Total Registrations", 
      value: "1,248", 
      change: "+156 this week",
      trend: "up",
      icon: UserCheck, 
      color: "from-orange-500 to-red-500" 
    },
    { 
      title: "Avg. Attendance", 
      value: "87%", 
      change: "+5% from last month",
      trend: "up",
      icon: CheckCircle, 
      color: "from-green-500 to-emerald-500" 
    },
  ];

  // Event Statistics Data
  const eventStats = [
    { month: "Jan", events: 3, registrations: 150, attendance: 130 },
    { month: "Feb", events: 5, registrations: 220, attendance: 190 },
    { month: "Mar", events: 4, registrations: 180, attendance: 160 },
    { month: "Apr", events: 6, registrations: 280, attendance: 245 },
    { month: "May", events: 4, registrations: 160, attendance: 140 },
    { month: "Jun", events: 7, registrations: 320, attendance: 280 },
  ];

  // Event Categories
  const categoryData = [
    { name: "Technical", value: 18, color: "#3b82f6" },
    { name: "Cultural", value: 12, color: "#8b5cf6" },
    { name: "Sports", value: 8, color: "#f97316" },
    { name: "Workshop", value: 7, color: "#10b981" }
  ];

  // Upcoming Events
  const upcomingEvents = [
    {
      id: 1,
      title: "Tech Fest 2025",
      date: "Oct 15, 2025",
      time: "09:00 AM",
      venue: "Main Auditorium",
      registrations: 320,
      capacity: 500,
      status: "upcoming"
    },
    {
      id: 2,
      title: "Coding Hackathon",
      date: "Oct 20, 2025",
      time: "10:00 AM",
      venue: "Computer Lab",
      registrations: 100,
      capacity: 100,
      status: "full"
    },
    {
      id: 3,
      title: "Cultural Night",
      date: "Oct 25, 2025",
      time: "06:00 PM",
      venue: "Open Ground",
      registrations: 650,
      capacity: 1000,
      status: "upcoming"
    }
  ];

  // Recent Activities
  const recentActivities = [
    { action: "New event created: AI Workshop", time: "2 hours ago", icon: Calendar, color: "text-blue-400" },
    { action: "3 new members joined the club", time: "5 hours ago", icon: Users, color: "text-purple-400" },
    { action: "Tech Fest reached 300 registrations", time: "1 day ago", icon: TrendingUp, color: "text-green-400" },
    { action: "Sports Meet event completed", time: "2 days ago", icon: CheckCircle, color: "text-orange-400" },
  ];

  // Top Performers
  const topPerformers = [
    { name: "Priya Sharma", role: "President", eventsManaged: 15, rating: 4.9 },
    { name: "Rahul Verma", role: "Vice President", eventsManaged: 12, rating: 4.8 },
    { name: "Ananya Desai", role: "Secretary", eventsManaged: 10, rating: 4.7 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed"></div>
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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
      `}</style>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Club Dashboard</h1>
          <p className="text-white/60">Welcome back! Here's your club overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((item, idx) => {
            const Icon = item.icon;
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
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 text-green-400 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-1">{item.title}</p>
                <h2 className="text-3xl font-bold text-white mb-2">{item.value}</h2>
                <p className="text-white/50 text-xs">{item.change}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Event Trends */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Event Trends</h2>
                <p className="text-white/60 text-sm">Monthly overview</p>
              </div>
              <BarChart3 className="w-5 h-5 text-purple-400" />
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

          {/* Event Categories */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Event Distribution</h2>
                <p className="text-white/60 text-sm">By category</p>
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

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Events */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-400">
            <h2 className="text-xl font-bold text-white mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold mb-1">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-white/60 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-semibold
                      ${event.status === 'full' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}
                    `}>
                      {event.status === 'full' ? 'FULL' : 'OPEN'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">{event.venue}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm font-semibold">{event.registrations}/{event.capacity}</span>
                      <div className="w-24 bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${(event.registrations / event.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-400">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivities.map((activity, idx) => {
                  const Icon = activity.icon;
                  return (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{activity.action}</p>
                        <p className="text-white/40 text-xs">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-400">
              <h2 className="text-xl font-bold text-white mb-4">Top Performers</h2>
              <div className="space-y-4">
                {topPerformers.map((performer, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{performer.name}</p>
                      <p className="text-white/60 text-xs">{performer.role}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-white text-xs font-semibold">{performer.rating}</span>
                      </div>
                      <p className="text-white/60 text-xs">{performer.eventsManaged} events</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDashboard;