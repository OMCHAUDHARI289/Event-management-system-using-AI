import React, { useEffect, useState } from "react";
import { Bar } from "recharts";
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, Calendar, CalendarCheck, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";
import { getAdminStats } from "../../services/adminService";

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    { title: "Total Users", value: "-", icon: Users, color: "from-blue-500 to-cyan-500", change: "", trend: "up" },
    { title: "Total Events", value: "-", icon: Calendar, color: "from-purple-500 to-pink-500", change: "", trend: "up" },
    { title: "Scheduled Events", value: "-", icon: CalendarCheck, color: "from-orange-500 to-red-500", change: "", trend: "up" },
    { title: "Payments Collected", value: "₹0", icon: DollarSign, color: "from-green-500 to-emerald-500", change: "", trend: "up" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        const next = [...stats];
        next[0].value = String(data?.users?.total ?? 0);
        next[1].value = String(data?.events?.total ?? 0);
        next[2].value = String(data?.events?.upcoming ?? 0);
        setStats(next);
      } catch (e) {
        console.error("Failed to load admin stats", e);
      }
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Example Chart Data
  const eventStats = [
    { month: "Jan", registrations: 150 },
    { month: "Feb", registrations: 200 },
    { month: "Mar", registrations: 180 },
    { month: "Apr", registrations: 250 },
    { month: "May", registrations: 220 },
    { month: "Jun", registrations: 300 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
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
        <div className="mb-8 animate-fadeInUp">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-white/60">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stat Cards */}
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
                  transform hover:scale-105 hover:-translate-y-2
                  animate-scaleIn delay-${idx * 100}
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl 
                    flex items-center justify-center shadow-lg
                  `}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center space-x-1 text-green-400 text-sm font-semibold">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{item.change}</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-1">{item.title}</p>
                <h2 className="text-3xl font-bold text-white">{item.value}</h2>
              </div>
            );
          })}
        </div>

        {/* Chart Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-fadeInUp delay-400">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Monthly Event Registrations</h2>
              <p className="text-white/60 text-sm">Track registration trends over time</p>
            </div>
            <div className="flex items-center space-x-2 text-white/60">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Last 6 months</span>
            </div>
          </div>
          
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventStats}>
                <defs>
                  <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '14px' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.6)"
                  style={{ fontSize: '14px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    color: '#fff'
                  }}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                />
                <Legend 
                  wrapperStyle={{ color: 'rgba(255,255,255,0.8)' }}
                />
                <Bar 
                  dataKey="registrations" 
                  fill="url(#colorRegistrations)" 
                  radius={[8, 8, 0, 0]}
                  name="Event Registrations"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Quick Stats Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-fadeInUp delay-400">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Active Users</span>
                <span className="text-white font-semibold">890</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '74%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Completed Events</span>
                <span className="text-white font-semibold">37</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Pending Approvals</span>
                <span className="text-white font-semibold">5</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-fadeInUp delay-400">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { action: "New user registered", time: "2 minutes ago", color: "from-blue-500 to-cyan-500" },
                { action: "Event 'Tech Fest' created", time: "1 hour ago", color: "from-purple-500 to-pink-500" },
                { action: "Payment received", time: "3 hours ago", color: "from-green-500 to-emerald-500" },
                { action: "Event 'Workshop' completed", time: "5 hours ago", color: "from-orange-500 to-red-500" },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${activity.color}`}></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{activity.action}</p>
                    <p className="text-white/50 text-xs">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;