import { useState, useEffect } from "react";
import { Trophy, Medal, Award, TrendingUp, Users, Calendar, Star, Crown, Zap, Target, ChevronUp, ChevronDown } from "lucide-react";
import { getLeaderboard } from "../../services/studentService";

function StudentLeaderboard() {
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [filterCategory, setFilterCategory] = useState("overall");
  const [currentUser, setCurrentUser] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const resp = await getLeaderboard(); // fetches normalized data
      setLeaderboardData(resp.leaderboard || []);
      setCurrentUser(resp.currentUser || null);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
      setLeaderboardData([]);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);


  useEffect(() => {
  const load = async () => {
    setLoading(true);
    try {
      const resp = await getLeaderboard();
      setLeaderboardData(resp.leaderboard || []);
      setCurrentUser(resp.currentUser || null);
    } catch (err) {
      console.error('Failed to load leaderboard', err);
      setLeaderboardData([]);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };
  load();
}, []);

 const stats = currentUser
  ? [
      { label: "Your Rank", value: `#${currentUser.rank}`, icon: Trophy, color: "from-yellow-500 to-orange-500" },
      { label: "Total Points", value: currentUser.points, icon: Star, color: "from-purple-500 to-pink-500" },
      { label: "Events Attended", value: currentUser.eventsAttended || 0, icon: Calendar, color: "from-blue-500 to-cyan-500" },
      { label: "Current Streak", value: currentUser.streak || "0 days", icon: Zap, color: "from-green-500 to-emerald-500" }
    ]
  : [];


  const getLevelColor = (level) => {
    switch(level) {
      case "Platinum": return "from-slate-400 to-slate-600";
      case "Gold": return "from-yellow-400 to-yellow-600";
      case "Silver": return "from-gray-300 to-gray-500";
      case "Bronze": return "from-orange-400 to-orange-600";
      default: return "from-purple-500 to-pink-500";
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case "up": return <ChevronUp className="w-4 h-4 text-green-400" />;
      case "down": return <ChevronDown className="w-4 h-4 text-red-400" />;
      default: return <div className="w-1 h-1 bg-white/40 rounded-full"></div>;
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400" />;
      case 2: return <Medal className="w-7 h-7 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-orange-400" />;
      default: return <span className="text-2xl font-bold text-white/60">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-float"></div>
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
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
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
        .animate-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(to right, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
          background-size: 1000px 100%;
        }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
      `}</style>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Leaderboard</h1>
              <p className="text-white/60">Compete with fellow students and climb the ranks</p>
            </div>
          </div>
        </div>

        {/* Your Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`
                  bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6
                  hover:bg-white/10 transition-all duration-300 cursor-pointer
                  hover:shadow-2xl hover:shadow-purple-500/20
                  transform hover:scale-105 animate-scaleIn delay-${idx * 100}
                `}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg mb-3`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <p className="text-white/60 text-xs sm:text-sm mb-1">{stat.label}</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</h2>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fadeIn">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all" className="bg-slate-800">All Time</option>
            <option value="month" className="bg-slate-800">This Month</option>
            <option value="week" className="bg-slate-800">This Week</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="overall" className="bg-slate-800">Overall</option>
            <option value="technical" className="bg-slate-800">Technical Events</option>
            <option value="cultural" className="bg-slate-800">Cultural Events</option>
            <option value="sports" className="bg-slate-800">Sports Events</option>
          </select>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-8 animate-scaleIn delay-200">
          <div className="grid grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-12">
              <div className="relative mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-4xl sm:text-5xl border-4 border-gray-400 shadow-2xl">
                  {leaderboardData[1]?.avatar || '👤'}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
              </div>
              <h3 className="text-white font-bold text-sm sm:text-base text-center mb-1">{leaderboardData[1]?.name || '--'}</h3>
              <p className="text-white/60 text-xs mb-2">{leaderboardData[1]?.points ?? 0} pts</p>
              <div className="bg-gradient-to-br from-gray-300 to-gray-500 rounded-t-2xl p-4 sm:p-6 w-full text-center">
                <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-white mx-auto" />
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-5xl sm:text-6xl border-4 border-yellow-500 shadow-2xl shadow-yellow-500/50 animate-shimmer">
                  {leaderboardData[0]?.avatar || '👤'}
                </div>
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 fill-yellow-400 animate-float" />
                </div>
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg text-center mb-1">{leaderboardData[0]?.name || '--'}</h3>
              <p className="text-white/60 text-sm mb-2">{leaderboardData[0]?.points ?? 0} pts</p>
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-t-2xl p-6 sm:p-8 w-full text-center">
                <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white mx-auto" />
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-16">
              <div className="relative mb-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-4xl sm:text-5xl border-4 border-orange-500 shadow-2xl">
                  {leaderboardData[2]?.avatar || '👤'}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
              </div>
              <h3 className="text-white font-bold text-sm sm:text-base text-center mb-1">{leaderboardData[2]?.name || '--'}</h3>
              <p className="text-white/60 text-xs mb-2">{leaderboardData[2]?.points ?? 0} pts</p>
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-t-2xl p-4 sm:p-6 w-full text-center">
                <Medal className="w-8 h-8 sm:w-10 sm:h-10 text-white mx-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Full Leaderboard */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-scaleIn delay-300">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white">Full Rankings</h2>
          </div>

          <div className="divide-y divide-white/10">
            {leaderboardData.map((user, idx) => (
              <div
                key={user._id || user.userId || `rank-${user.rank}-idx-${idx}`}
                className={`p-4 sm:p-6 hover:bg-white/5 transition-all duration-300 ${
                  user.isCurrentUser ? 'bg-purple-500/10 border-l-4 border-purple-500' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 sm:w-16 flex flex-col items-center">
                    {getRankIcon(user.rank)}
                    {getTrendIcon(user.trend)}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${getLevelColor(user.level)} rounded-full flex items-center justify-center text-2xl sm:text-3xl border-2 border-white/20 flex-shrink-0`}>
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-white font-bold text-sm sm:text-base truncate">{user.name}</h3>
                        {user.isCurrentUser && (
                          <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-xs sm:text-sm">{user.department}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(Array.isArray(user.achievements) ? user.achievements.slice(0, 2) : []).map((achievement, i) => (
                          <span key={i} className="text-xs bg-white/5 text-white/60 px-2 py-0.5 rounded">
                            {typeof achievement === 'object' ? achievement.title || achievement.name || 'Achievement' : achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-white font-bold text-lg">{user.points}</p>
                      <p className="text-white/60 text-xs">Points</p>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{user.eventsAttended}</p>
                      <p className="text-white/60 text-xs">Events</p>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{user.badges}</p>
                      <p className="text-white/60 text-xs">Badges</p>
                    </div>
                  </div>

                  {/* Mobile Stats */}
                  <div className="sm:hidden flex flex-col items-end space-y-1">
                    <p className="text-white font-bold text-lg">{user.points}</p>
                    <p className="text-white/60 text-xs">points</p>
                  </div>

                  {/* Level Badge */}
                  <div className="hidden lg:block">
                    <div className={`bg-gradient-to-r ${getLevelColor(user.level)} px-4 py-2 rounded-xl`}>
                      <p className="text-white font-bold text-sm">{user.level}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How Points Work */}
        <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-400">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span>How Points Work</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { action: "Attend Event", points: "+100" },
              { action: "Register Early", points: "+20" },
              { action: "Daily Login", points: "+10" },
              { action: "Give Feedback", points: "+15" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                <span className="text-white/80 text-sm">{item.action}</span>
                <span className="text-green-400 font-bold">{item.points}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLeaderboard;