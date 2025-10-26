import { useEffect, useRef, useState } from "react";
import {
  User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Star,
  TrendingUp, Edit2, Camera, Save, Settings, Lock, Trophy, Hash, Download, Flame, Brain, Target, Lightbulb
} from "lucide-react";
import { getMyProfile, updateProfile, uploadAvatar, uploadBanner, getLeaderboard } from "../../services/studentService";
import { generateMLPredictions } from "../../utils/mlPredictions";
import { achievementDefinitions, getAchievementStatus, getRarityColor } from "../../utils/achievementUtils";
import {useToast } from "../../pages/common/Toast";

function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [stats, setStats] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [mlPredictions, setMlPredictions] = useState(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const { addToast} = useToast();

  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    prn: "",
    department: "",
    year: "",
    joinDate: "",
    location: "",
    bio: "",
    rollNumber: "",
    semester: "",
    avatar: null,
    banner: null,
    achievements: []
  });

  // Dynamic Recent Activity - will be populated from real data
  const [recentActivity, setRecentActivity] = useState([]);

  // Dynamic Interests - will be populated from ML analysis
  const [interests, setInterests] = useState([]);

  // Fetch profile on mount
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getMyProfile();
        if (!mounted) return;

        const u = data || {};
        setProfile({
          name: u.name || "Student Name",
          email: u.email || "email@example.com",
          phone: u.phone || "+91 XXXXXXXXXX",
          prn: u.prn || u.studentId || "PRN000000",
          department: u.department || "Department",
          year: u.year || "Year",
          joinDate: u.joinDate || "Join Date",
          location: u.location || "Location",
          bio: u.bio || "Bio not provided",
          rollNumber: u.rollNumber || "Roll Number",
          semester: u.semester || "Semester",
          avatar: u.profileImage || u.image || null,
          banner: u.bannerImage || u.banner || null,
          achievements: u.achievements || []
        });

        // Fetch leaderboard stats
        const lb = await getLeaderboard();
        if (!mounted) return;

        const current = lb.currentUser || (Array.isArray(lb.leaderboard) ? lb.leaderboard.find(e => e.isCurrentUser) : null);
        const eventsAttended = current?.eventsAttended ?? current?.totalAttended ?? (current?.stats && current.stats.totalAttended) ?? 0;
        const points = current?.points ?? 0;
        const certificates = u.certificates?.length ?? 0;
        const rankLabel = current?.rank ? `#${current.rank}` : "N/A";
        const level = current?.level || 'Bronze';
        const streak = current?.streak ?? 0;
        const totalRegistrations = current?.totalRegistrations ?? 0;

        const leaderboardStats = {
          eventsAttended,
          points,
          level,
          streak,
          totalRegistrations
        };

        setLeaderboardData(leaderboardStats);

        setStats([
          {
            label: "Events Attended",
            value: eventsAttended,
            icon: Calendar,
            color: "from-blue-500 to-cyan-500"
          },
          {
            label: "Total Points",
            value: points,
            icon: Star,
            color: "from-purple-500 to-pink-500"
          },
          {
            label: "Certificates",
            value: certificates,
            icon: Award,
            color: "from-orange-500 to-red-500"
          },
          {
            label: "Current Rank",
            value: rankLabel,
            icon: Trophy,
            color: "from-yellow-500 to-orange-500"
          }
        ]);

        // Generate ML Predictions
        setLoadingPredictions(true);
        try {
          const predictions = await generateMLPredictions(leaderboardStats); // ✅ async call
          if (!mounted) return;
          setMlPredictions(predictions);
          
          // Extract interests from ML recommendations
          const mlInterests = predictions.recommendations?.map(rec => rec.category) || [];
          setInterests(mlInterests.length > 0 ? mlInterests : ["Technology", "Coding", "AI/ML", "Web Development", "Hackathons", "Innovation"]);
          
          // Generate dynamic recent activity based on ML insights
          const dynamicActivity = [
            { 
              type: "event", 
              title: `Attended ${eventsAttended} events this semester`, 
              date: "Current", 
              icon: Calendar 
            },
            { 
              type: "achievement", 
              title: `Current Level: ${level}`, 
              date: "Updated", 
              icon: Trophy 
            },
            { 
              type: "streak", 
              title: `${streak} day attendance streak`, 
              date: streak > 0 ? "Active" : "Inactive", 
              icon: Flame 
            },
            { 
              type: "prediction", 
              title: `Next level: ${predictions.nextLevel}`, 
              date: "AI Prediction", 
              icon: Brain 
            }
          ];
          setRecentActivity(dynamicActivity);
          
        } catch (err) {
          console.error("ML prediction failed:", err);
          addToast("Failed to generate AI predictions.", { type: "error" });
          // Fallback to default data
          setInterests(["Technology", "Coding", "AI/ML", "Web Development", "Hackathons", "Innovation"]);
          setRecentActivity([
            { type: "event", title: "Registered for Tech Fest 2025", date: "2 days ago", icon: Calendar },
            { type: "certificate", title: "Received certificate for AI Workshop", date: "5 days ago", icon: Award },
            { type: "achievement", title: "Unlocked 'Early Bird' badge", date: "1 week ago", icon: Trophy },
            { type: "rank", title: "Moved up in rank", date: "2 weeks ago", icon: TrendingUp }
          ]);
        } finally {
          if (mounted) setLoadingPredictions(false);
        }

    } catch (err) {
      console.error("Failed to load profile:", err);
      addToast("Failed to load profile data.", { type: "error" });
    } finally {
      if (mounted) setLoading(false);
    }
  };


    fetchProfile();
    
    // Set up real-time refresh every 5 minutes
    const interval = setInterval(() => {
      if (mounted) {
        fetchProfile();
        setLastUpdated(new Date());
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    setRefreshInterval(interval);
    
    return () => { 
      mounted = false; 
      if (interval) clearInterval(interval);
    };
  }, []);

  // Manual refresh function
  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await getMyProfile();
      const u = data || {};
      
      // Update profile with fresh data
      setProfile(prev => ({
        ...prev,
        name: u.name || prev.name,
        email: u.email || prev.email,
        phone: u.phone || prev.phone,
        prn: u.prn || u.studentId || prev.prn,
        department: u.department || prev.department,
        location: u.location || prev.location,
        bio: u.bio || prev.bio,
        avatar: u.profileImage || u.image || prev.avatar,
        banner: u.bannerImage || u.banner || prev.banner,
        achievements: u.achievements || prev.achievements
      }));

      // Refresh leaderboard and ML predictions
      const lb = await getLeaderboard();
      const current = lb.currentUser || (Array.isArray(lb.leaderboard) ? lb.leaderboard.find(e => e.isCurrentUser) : null);
      const eventsAttended = current?.eventsAttended ?? current?.totalAttended ?? 0;
      const points = current?.points ?? 0;
      const level = current?.level || 'Bronze';
      const streak = current?.streak ?? 0;
      const totalRegistrations = current?.totalRegistrations ?? 0;

      const leaderboardStats = { eventsAttended, points, level, streak, totalRegistrations };
      setLeaderboardData(leaderboardStats);

      // Refresh ML predictions
      const predictions = await generateMLPredictions(leaderboardStats);
      setMlPredictions(predictions);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to refresh data:", err);
      addToast("Failed to refresh data.", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (!profile.name || !profile.email) {
        addToast("Name and Email are required.", { type: "error" });
        setSaving(false);
        return;
      }

      const updates = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        prn: profile.prn,
        department: profile.department,
        location: profile.location,
        bio: profile.bio
      };

      const updated = await updateProfile(updates);
      const u = updated.user || updated || {};
      setProfile(prev => ({
        ...prev,
        name: u.name ?? prev.name,
        email: u.email ?? prev.email,
        phone: u.phone ?? prev.phone,
        prn: u.prn ?? prev.prn,
        department: u.department ?? prev.department,
        location: u.location ?? prev.location,
        bio: u.bio ?? prev.bio
      }));
      setIsEditing(false);
      addToast("Profile updated successfully!", { type: "success" });


    } catch (err) {
      console.error("Failed to update profile:", err);
      addToast("Failed to update profile.", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const onAvatarClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await uploadAvatar(file);
      const avatarUrl = res?.avatarUrl ?? res?.user?.profileImage ?? null;
      if (avatarUrl) setProfile(prev => ({ ...prev, avatar: avatarUrl + "?t=" + Date.now() }));
      addToast("Avatar uploaded successfully!", { type: "success" });
    } catch (err) {
      console.error("Avatar upload failed:", err);
      addToast("Avatar upload failed.", { type: "error" });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onBannerClick = () => {
    if (bannerInputRef.current) bannerInputRef.current.click();
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const res = await uploadBanner(file);
      const bannerUrl = res?.bannerUrl ?? res?.user?.bannerImage ?? null;
      if (bannerUrl) setProfile(prev => ({ ...prev, banner: bannerUrl + "?t=" + Date.now() }));
      addToast("Banner uploaded successfully!", { type: "success" });
    } catch (err) {
      console.error("Banner upload failed:", err);
      addToast("Banner upload failed.", { type: "error" });
    } finally {
      setBannerUploading(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading profile...</p>
        </div>
      </div>
    );
  }

  const avatarContent = profile.avatar ? (
    <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
  ) : (
    <div className="text-5xl sm:text-6xl select-none text-white">
      {(profile.name || "U").split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float-delayed"></div>
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
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Profile Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden mb-6">
          {/* Cover Banner */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500">
            {profile.banner && (
              <img src={profile.banner} alt="banner" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <button
              onClick={onBannerClick}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all"
            >
              {bannerUploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>
            <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 sm:-mt-20">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-2xl overflow-hidden">
                  {avatarContent}
                </div>
                <button
                  onClick={onAvatarClick}
                  className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  {avatarUploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Name & Details */}
              <div className="flex-1 mt-16 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
                      {mlPredictions && (
                        <div className="flex items-center space-x-1 bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>AI Active</span>
                        </div>
                      )}
                    </div>
                    <p className="text-white/60">{profile.department} {profile.department && profile.year ? '•' : ''} {profile.year}</p>
                    <p className="text-white/50 text-sm">{profile.prn}</p>
                    {lastUpdated && (
                      <p className="text-white/40 text-xs mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                    <button
                      onClick={refreshData}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                    >
                      <div className={`w-4 h-4 ${loading ? 'border-2 border-white/30 border-t-white rounded-full animate-spin' : ''}`}></div>
                      <span>Refresh</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                    </button>
                  </div>
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
            <div className="flex space-x-2 overflow-x-auto">
              {[
                { id: "profile", label: "About", icon: User },
                { id: "achievements", label: "Achievements", icon: Award },
                { id: "activity", label: "Activity", icon: TrendingUp },
                { id: "insights", label: "AI Insights", icon: Brain }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
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
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-60"
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
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-60"
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
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">PRN Number</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={profile.prn}
                        onChange={(e) => setProfile({ ...profile, prn: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Department</label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-60"
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
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all disabled:opacity-60"
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
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none disabled:opacity-60"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-6">Badges & Achievements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {achievementDefinitions.map((achievement, idx) => {
                    const status = getAchievementStatus(achievement, leaderboardData || {}, profile.achievements);
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl p-5 transition-all ${
                          status.earned
                            ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)} bg-opacity-20 border-2`
                            : 'bg-white/5 border border-white/10 opacity-60'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="text-4xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">{achievement.title}</h4>
                            <p className="text-white/60 text-sm mb-2">{achievement.desc}</p>
                            {status.earned ? (
                              <div className="flex items-center space-x-2">
                                <Award className="w-4 h-4 text-green-400" />
                                <span className="text-green-400 text-xs font-semibold">Earned • {status.date}</span>
                              </div>
                            ) : (
                              <div>
                                <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                                  <div 
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                    style={{ width: `${status.progress}%` }}
                                  ></div>
                                </div>
                                <p className="text-white/40 text-xs">{status.progress}% completed</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
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

            {/* AI Insights Tab */}
            {activeTab === "insights" && (
              <div className="space-y-6">
                {loadingPredictions ? (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="text-center py-12">
                      <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-white/60">Analyzing your data with AI...</p>
                    </div>
                  </div>
                ) : mlPredictions ? (
                  <>
                    {/* Performance Overview */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-xl font-bold text-white">AI Performance Analysis</h3>
                        </div>
                        <div className="flex items-center space-x-2 text-green-400 text-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Live Analysis</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-white/60 text-sm mb-2">Engagement Score</p>
                          <div className="flex items-end space-x-2">
                            <p className="text-3xl font-bold text-white">{mlPredictions.engagementScore}</p>
                            <p className="text-white/40 text-sm mb-1">/100</p>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${mlPredictions.engagementScore}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-white/60 text-sm mb-2">Attendance Rate</p>
                          <div className="flex items-end space-x-2">
                            <p className="text-3xl font-bold text-white">{mlPredictions.attendanceRate}</p>
                            <p className="text-white/40 text-sm mb-1">%</p>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                              style={{ width: `${mlPredictions.attendanceRate}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="bg-white/5 rounded-xl p-4">
                          <p className="text-white/60 text-sm mb-2">Avg Points/Event</p>
                          <div className="flex items-end space-x-2">
                            <p className="text-3xl font-bold text-white">{mlPredictions.avgPointsPerEvent}</p>
                            <p className="text-white/40 text-sm mb-1">pts</p>
                          </div>
                          <p className="text-xs mt-2 text-white/50">{mlPredictions.performanceTrend}</p>
                        </div>
                      </div>

                      {/* Dropout Risk Alert */}
                      <div className={`rounded-xl p-4 border-2 ${
                        mlPredictions.dropoutRisk === 'High' ? 'bg-red-500/10 border-red-500/30' :
                        mlPredictions.dropoutRisk === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-green-500/10 border-green-500/30'
                      }`}>
                        <div className="flex items-start space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            mlPredictions.dropoutRisk === 'High' ? 'bg-red-500/20' :
                            mlPredictions.dropoutRisk === 'Medium' ? 'bg-yellow-500/20' :
                            'bg-green-500/20'
                          }`}>
                            <Target className={`w-5 h-5 ${
                              mlPredictions.dropoutRisk === 'High' ? 'text-red-400' :
                              mlPredictions.dropoutRisk === 'Medium' ? 'text-yellow-400' :
                              'text-green-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">Engagement Risk: {mlPredictions.dropoutRisk}</h4>
                            <p className="text-white/60 text-sm">
                              {mlPredictions.dropoutRisk === 'High' && 'Consider attending more events to stay active in the community.'}
                              {mlPredictions.dropoutRisk === 'Medium' && 'You\'re doing well! Try maintaining your current streak.'}
                              {mlPredictions.dropoutRisk === 'Low' && 'Excellent! Keep up the great engagement!'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${
                              mlPredictions.dropoutRisk === 'High' ? 'text-red-400' :
                              mlPredictions.dropoutRisk === 'Medium' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>{mlPredictions.riskPercentage}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Level Prediction */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Level Progression Forecast</h3>
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-white/60 text-sm mb-1">Next Level</p>
                            <p className="text-2xl font-bold text-white">{mlPredictions.nextLevel}</p>
                          </div>
                          <Trophy className="w-12 h-12 text-yellow-400" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Points Needed:</span>
                            <span className="text-white font-semibold">{mlPredictions.pointsNeeded} pts</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">Estimated Events:</span>
                            <span className="text-white font-semibold">{mlPredictions.eventsNeeded} events</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Event Recommendations */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Lightbulb className="w-6 h-6 text-yellow-400" />
                          <h3 className="text-lg font-bold text-white">AI-Powered Event Recommendations</h3>
                        </div>
                        <button
                          onClick={() => {
                            setLoadingPredictions(true);
                            generateMLPredictions(leaderboardData).then(predictions => {
                              setMlPredictions(predictions);
                              setLoadingPredictions(false);
                            });
                          }}
                          className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                        >
                          Refresh Insights
                        </button>
                      </div>
                      <div className="space-y-4">
                        {mlPredictions.recommendations.map((rec, idx) => (
                          <div key={idx} className={`rounded-xl p-4 border-2 transition-all hover:scale-105 ${
                            rec.priority === 'high' ? 'bg-red-500/10 border-red-500/30' :
                            rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                            'bg-blue-500/10 border-blue-500/30'
                          }`}>
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="text-white font-semibold text-lg">{rec.category}</h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    rec.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                    rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-blue-500/20 text-blue-300'
                                  }`}>
                                    {rec.priority} priority
                                  </span>
                                </div>
                                <p className="text-white/60 text-sm mb-2">{rec.reason}</p>
                                {rec.eventTypes && (
                                  <div className="flex flex-wrap gap-1">
                                    {rec.eventTypes.map((type, typeIdx) => (
                                      <span key={typeIdx} className="bg-white/10 text-white/70 px-2 py-1 rounded text-xs">
                                        {type}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-white font-bold text-lg">{rec.confidence}%</span>
                                  <span className="text-white/60 text-xs">match</span>
                                </div>
                                <div className="w-20 bg-white/20 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all"
                                    style={{ width: `${rec.confidence}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Predicted Achievements */}
                    {mlPredictions.nextAchievements.length > 0 && (
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-white">AI Achievement Predictions</h3>
                          <div className="flex items-center space-x-2 text-green-400 text-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Live Predictions</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          {mlPredictions.nextAchievements.map((ach, idx) => (
                            <div key={idx} className={`rounded-xl p-4 border-2 transition-all hover:scale-105 ${
                              ach.category === 'participation' ? 'bg-blue-500/10 border-blue-500/30' :
                              ach.category === 'consistency' ? 'bg-orange-500/10 border-orange-500/30' :
                              ach.category === 'points' ? 'bg-purple-500/10 border-purple-500/30' :
                              ach.category === 'level' ? 'bg-yellow-500/10 border-yellow-500/30' :
                              'bg-green-500/10 border-green-500/30'
                            }`}>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="text-2xl">{ach.icon}</div>
                                  <div>
                                    <h4 className="text-white font-semibold text-lg">{ach.title}</h4>
                                    <p className="text-white/60 text-sm">{ach.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-white font-bold text-lg">{ach.probability}%</span>
                                    <span className="text-white/60 text-xs">likely</span>
                                  </div>
                                  <div className="w-16 bg-white/20 rounded-full h-1.5">
                                    <div 
                                      className="bg-gradient-to-r from-green-400 to-emerald-400 h-1.5 rounded-full transition-all"
                                      style={{ width: `${ach.probability}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2 text-white/60">
                                  <Calendar className="w-4 h-4" />
                                  <span>~{ach.daysEstimate} days</span>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  ach.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                  ach.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {ach.category}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <p className="text-white/60 text-center">No predictions available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Level & Streak Card */}
            {leaderboardData && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Progress</h3>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm">Level</span>
                      <span className="text-white font-bold">{leaderboardData.level}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (leaderboardData.points / 2500) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Flame className="w-5 h-5 text-orange-400" />
                      <span className="text-white font-semibold">{leaderboardData.streak} Day Streak</span>
                    </div>
                    <p className="text-white/60 text-xs">Keep attending events to maintain your streak!</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic AI-Powered Interests */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">AI-Detected Interests</h3>
                {mlPredictions && (
                  <div className="flex items-center space-x-2 text-green-400 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>ML Analysis</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, idx) => {
                  const isHighConfidence = mlPredictions?.recommendations?.some(rec => 
                    rec.category.toLowerCase().includes(interest.toLowerCase()) && rec.confidence > 80
                  );
                  return (
                    <span key={idx} className={`px-3 py-1 rounded-lg text-sm transition-all hover:scale-105 ${
                      isHighConfidence 
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-purple-500/20 text-purple-300'
                    }`}>
                      {interest}
                      {isHighConfidence && <span className="ml-1">✨</span>}
                    </span>
                  );
                })}
              </div>
              {mlPredictions && (
                <p className="text-white/50 text-xs mt-3">
                  Interests are dynamically generated based on your event participation patterns and AI analysis
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
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