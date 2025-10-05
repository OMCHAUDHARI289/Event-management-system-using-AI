import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Star, TrendingUp, Edit2, Camera, Save, Settings, Bell, Lock, Trophy, Target, Zap, Download } from "lucide-react";

function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john.doe@college.edu",
    phone: "+91 9876543210",
    prn: "PRN2025001234",
    department: "Computer Science",
    year: "3rd Year",
    joinDate: "August 2023",
    location: "Mumbai, Maharashtra",
    bio: "Passionate about technology and innovation. Love participating in hackathons and tech events. Always eager to learn new things!",
    rollNumber: "CSE/2023/001",
    semester: "5th Semester"
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    eventReminders: true,
    newsletter: true
  });

  // Stats
  const stats = [
    { label: "Events Attended", value: 16, icon: Calendar, color: "from-blue-500 to-cyan-500" },
    { label: "Total Points", value: 1750, icon: Star, color: "from-purple-500 to-pink-500" },
    { label: "Certificates", value: 12, icon: Award, color: "from-orange-500 to-red-500" },
    { label: "Current Rank", value: "#10", icon: Trophy, color: "from-yellow-500 to-orange-500" }
  ];

  // Badges & Achievements
  const achievements = [
    { 
      title: "Event Explorer", 
      desc: "Attended 10+ events", 
      icon: "🎯", 
      earned: true,
      date: "Sept 2025",
      rarity: "rare"
    },
    { 
      title: "Early Bird", 
      desc: "Registered within 24hrs", 
      icon: "🐦", 
      earned: true,
      date: "Oct 2025",
      rarity: "common"
    },
    { 
      title: "Tech Enthusiast", 
      desc: "Attended 5 tech events", 
      icon: "💡", 
      earned: false,
      progress: 60,
      rarity: "uncommon"
    },
    { 
      title: "Perfect Attendance", 
      desc: "100% attendance rate", 
      icon: "⭐", 
      earned: false,
      progress: 85,
      rarity: "epic"
    },
    { 
      title: "Team Player", 
      desc: "Participated in 3 team events", 
      icon: "🤝", 
      earned: true,
      date: "Sept 2025",
      rarity: "common"
    },
    { 
      title: "Cultural Star", 
      desc: "Attended 5 cultural events", 
      icon: "🎭", 
      earned: false,
      progress: 40,
      rarity: "rare"
    }
  ];

  // Recent Activity
  const recentActivity = [
    { 
      type: "event", 
      title: "Registered for Tech Fest 2025", 
      date: "2 days ago",
      icon: Calendar
    },
    { 
      type: "certificate", 
      title: "Received certificate for AI Workshop", 
      date: "5 days ago",
      icon: Award
    },
    { 
      type: "achievement", 
      title: "Unlocked 'Early Bird' badge", 
      date: "1 week ago",
      icon: Trophy
    },
    { 
      type: "rank", 
      title: "Moved up to rank #10", 
      date: "2 weeks ago",
      icon: TrendingUp
    }
  ];

  // Interests
  const interests = [
    "Technology", "Coding", "AI/ML", "Web Development", 
    "Hackathons", "Photography", "Music", "Sports"
  ];

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case "common": return "from-gray-400 to-gray-600";
      case "uncommon": return "from-green-400 to-green-600";
      case "rare": return "from-blue-400 to-blue-600";
      case "epic": return "from-purple-400 to-purple-600";
      case "legendary": return "from-yellow-400 to-orange-600";
      default: return "from-gray-400 to-gray-600";
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
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
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-6 animate-fadeIn">
          {/* Cover Image */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 relative">
            <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-all">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 sm:-mt-20">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-6xl sm:text-7xl border-4 border-slate-900 shadow-2xl">
                  👤
                </div>
                <button className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Name & Details */}
              <div className="flex-1 mt-16 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
                    <p className="text-white/60">{profile.department} • {profile.year}</p>
                    <p className="text-white/50 text-sm">{profile.prn}</p>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="mt-4 sm:mt-0 flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div key={idx} className="bg-white/5 rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon className="w-4 h-4 text-white/60" />
                          <p className="text-white/60 text-xs">{stat.label}</p>
                        </div>
                        <p className="text-white font-bold text-lg">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex space-x-2 animate-fadeIn">
              {[
                { id: "profile", label: "About", icon: User },
                { id: "achievements", label: "Achievements", icon: Award },
                { id: "activity", label: "Activity", icon: TrendingUp }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                      ${activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* About Tab */}
            {activeTab === "profile" && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn">
                <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">PRN Number</label>
                    <input
                      type="text"
                      value={profile.prn}
                      disabled
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white opacity-60 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Department</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={profile.department}
                        disabled
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white opacity-60 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/80 text-sm font-medium mb-2">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!isEditing}
                      rows="4"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn">
                <h3 className="text-xl font-bold text-white mb-6">Badges & Achievements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievements.map((achievement, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-5 transition-all ${
                        achievement.earned
                          ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} bg-opacity-20 border-2`
                          : 'bg-white/5 border border-white/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold mb-1">{achievement.title}</h4>
                          <p className="text-white/60 text-sm mb-2">{achievement.desc}</p>
                          {achievement.earned ? (
                            <div className="flex items-center space-x-2">
                              <Award className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-xs font-semibold">Earned • {achievement.date}</span>
                            </div>
                          ) : (
                            <div>
                              <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                  style={{ width: `${achievement.progress}%` }}
                                ></div>
                              </div>
                              <p className="text-white/40 text-xs">{achievement.progress}% completed</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn">
                <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => {
                    const Icon = activity.icon;
                    return (
                      <div key={idx} className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium mb-1">{activity.title}</p>
                          <p className="text-white/50 text-sm">{activity.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Interests */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-100">
              <h3 className="text-lg font-bold text-white mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, idx) => (
                  <span key={idx} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg text-sm">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-200">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all text-left">
                  <Download className="w-5 h-5 text-white/60" />
                  <span className="text-white text-sm">Download Certificates</span>
                </button>
                <button className="w-full flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all text-left">
                  <Settings className="w-5 h-5 text-white/60" />
                  <span className="text-white text-sm">Account Settings</span>
                </button>
                <button className="w-full flex items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 transition-all text-left">
                  <Lock className="w-5 h-5 text-white/60" />
                  <span className="text-white text-sm">Privacy Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;