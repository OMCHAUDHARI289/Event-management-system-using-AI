import { useState, useEffect, useRef } from "react";
import { useToast } from '../../pages/common/Toast';
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Shield,
  Lock,
  Camera,
  Save,
  Edit2,
  LogOut,
  Award,
  Activity,
} from "lucide-react";
import { getAdminProfile, updateAdminProfile, changeAdminPassword } from "../../services/adminService";
import { uploadAvatar } from "../../services/studentService";

/**
 * AdminProfile
 * - Uses getAdminProfile() to fetch personal info (no leaderboard).
 * - Calls updateProfile(updates) to persist editable fields.
 * - Handles avatar upload via uploadAvatar(file).
 *
 * Note: updateProfile service must accept a single `updates` object
 * and return the updated user object (or an object containing it).
 */

function AdminProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [avatarRefreshKey, setAvatarRefreshKey] = useState(0); // force re-render of <img> when new avatar uploaded
// Security form state
  const [securityForm, setSecurityForm] = useState({
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const { addToast } = useToast();
  const [profile, setProfile] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    role: "Admin",
    department: "",
    joinDate: "", // human readable
    joinDateRaw: null, // ISO / timestamp from server if available
    location: "",
    bio: "",
    profileImage: "",
    eventsOrganized: 0,
    totalParticipants: 0,
    avgRating: 0,
  });

  // -- helper: format ISO/date to readable
  const formatDate = (value) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return d.toLocaleDateString();
    } catch {
      return String(value);
    }
  };

  // Fetch profile on mount
  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getAdminProfile(); // expected to return the admin object
        if (!mounted) return;

        // Some backends return { user } or { admin } — normalize
        const u = data?.user || data?.admin || data || {};

        setProfile({
          id: u._id || u.id || null,
          name: u.name || "Admin Name",
          email: u.email || "admin@example.com",
          phone: u.phone || "",
          role: u.role || "Admin",
          department: u.department || "",
          joinDate: u.joinDate ? formatDate(u.joinDate) : (u.createdAt ? formatDate(u.createdAt) : ""),
          joinDateRaw: u.joinDate || u.createdAt || null,
          location: u.location || "",
          bio: u.bio || "",
          profileImage: u.profileImage || u.avatar || "",
          eventsOrganized: u.eventsOrganized || 0,
          totalParticipants: u.totalParticipants || 0,
          avgRating: u.avgRating || 0,
        });
      } catch (err) {
        addToast("Failed to load admin profile:", err);
        console.error("Failed to fetch admin profile:", err);
        // optional: show toast/alert
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // Avatar upload handler
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    try {
      // uploadAvatar should return something like { avatarUrl, user } or { avatarUrl }
      const res = await uploadAvatar(file);

      // Accept multiple possible response shapes
      const avatarUrl =
        res?.avatarUrl ||
        res?.data?.avatarUrl ||
        res?.data?.avatar ||
        res?.avatar ||
        res?.user?.profileImage ||
        res?.user?.avatar ||
        null;

      if (avatarUrl) {
        setProfile((p) => ({ ...p, profileImage: avatarUrl }));
        // force img cache bust
        setAvatarRefreshKey((k) => k + 1);
        addToast("Avatar uploaded successfully!", "success");
      } else {
        console.warn("uploadAvatar returned unexpected response:", res);
        addToast("Avatar uploaded but server response was unexpected. Check console.", "error");
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      addToast("Failed to upload avatar.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Save handler — send only allowed fields
  // Save handler — send only allowed fields
const handleSave = async () => {
  // Prevent saving while avatar is uploading
  if (uploading) {
    addToast("Please wait for the avatar upload to complete before saving.", "warning");
    return;
  }

  try {
    // Only send editable fields to backend
    const allowed = (({ name, email, phone, department, location, bio, profileImage }) => ({
      name,
      email,
      phone,
      department,
      location,
      bio,
      profileImage,
    }))(profile);

    // updateProfile service returns updated user or { user: ... } or empty object
    const updatedUser = await updateAdminProfile(allowed) || {};

    // Normalize backend shapes
    const u = updatedUser.user || updatedUser.admin || updatedUser || {};

    setProfile((prev) => ({
      ...prev,
      name: u.name ?? prev.name,
      email: u.email ?? prev.email,
      phone: u.phone ?? prev.phone,
      department: u.department ?? prev.department,
      location: u.location ?? prev.location,
      bio: u.bio ?? prev.bio,
      profileImage: u.profileImage ?? prev.profileImage,
      // Safe joinDate handling
      joinDate: u.joinDate ? formatDate(u.joinDate) : (u.createdAt ? formatDate(u.createdAt) : prev.joinDate),
      joinDateRaw: u.joinDate || u.createdAt || prev.joinDateRaw,
    }));

    setIsEditing(false);
    addToast("Profile updated successfully!", "success");
  } catch (err) {
    console.error("Failed to update profile:", err);
    addToast("Failed to update profile. See console for details.", "error");
  }
};



  // UI skeleton — mostly unchanged but wired to profile state and handleSave
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-20px) translateX(10px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(20px) translateX(-10px); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
      `}</style>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Profile</h1>
              <p className="text-white/60">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                    {profile.profileImage ? (
                      // add refresh key to bust cache when avatar changes
                      <img
                        key={avatarRefreshKey}
                        src={`${profile.profileImage}${avatarRefreshKey ? `?t=${avatarRefreshKey}` : ""}`}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <UserCircle className="w-20 h-20 text-white" />
                    )}
                  </div>

                  <button
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    aria-label="Upload avatar"
                  >
                    <Camera className="w-5 h-5 text-white" />
                  </button>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{profile.name}</h2>
                <p className="text-white/60 mb-1">{profile.role}</p>
                <div className="flex items-center space-x-2 text-white/50 text-sm mb-4">
                  <Shield className="w-4 h-4" />
                  <span>Administrator</span>
                </div>

                <button
                  onClick={() => setIsEditing((s) => !s)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/70 text-sm">Member Since</span>
                  </div>
                  <span className="text-white font-semibold">{profile.joinDate || "—"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/70 text-sm">Events Organized</span>
                  </div>
                  <span className="text-white font-semibold">{profile.eventsOrganized}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/70 text-sm">Average Rating</span>
                  </div>
                  <span className="text-white font-semibold">{profile.avgRating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex space-x-2 mb-6 animate-fadeIn">
              {[
                { id: "profile", label: "Profile", icon: UserCircle },
                { id: "security", label: "Security", icon: Lock },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === "profile" && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-200">
                <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Department</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={profile.department}
                        onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                        onChange={(e) => setProfile((p) => ({ ...p, location: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Member Since</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="text"
                        value={profile.joinDate || ""}
                        disabled
                        className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 opacity-60 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white/80 text-sm font-medium mb-2">Bio</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                      disabled={!isEditing}
                      rows="4"
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-scaleIn delay-200">
    <h3 className="text-xl font-bold text-white mb-6">Change Password</h3>

    <div className="space-y-4">
      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">Current Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="password"
            placeholder="Enter current password"
            value={securityForm.currentPassword}
            onChange={(e) => setSecurityForm((s) => ({ ...s, currentPassword: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="password"
            placeholder="Enter new password (min 8 chars)"
            value={securityForm.newPassword}
            onChange={(e) => setSecurityForm((s) => ({ ...s, newPassword: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-white/80 text-sm font-medium mb-2">Confirm New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="password"
            placeholder="Confirm new password"
            value={securityForm.confirmPassword}
            onChange={(e) => setSecurityForm((s) => ({ ...s, confirmPassword: e.target.value }))}
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={async () => {
            // Basic client-side checks
            if (changingPassword) return;
            if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
              addToast("Please fill all password fields.", "warning");
              return;
            }
            if (securityForm.newPassword !== securityForm.confirmPassword) {
              addToast("New password and confirmation do not match.", "error");
              return;
            }
            if (securityForm.newPassword.length < 8) {
              addToast("New password must be at least 8 characters.", "warning");
              return;
            }
            if (securityForm.newPassword === securityForm.currentPassword) {
              if (!confirm("New password is same as current password — still proceed?")) return;
            }

            try {
              setChangingPassword(true);
              const payload = {
                currentPassword: securityForm.currentPassword,
                newPassword: securityForm.newPassword
              };

              const res = await changeAdminPassword(payload);
              // expected server response: { message: 'Password changed' } or similar
              addToast(res?.message || "Password changed successfully!", "success");
              setSecurityForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } catch (err) {
             addToast("Failed to change password. See console for details.", "error");
              console.error("Change password failed:", err);
              // Prefer showing server message if available
              const serverMsg = err?.response?.data?.message || err?.message || "Failed to change password";
              addToast(serverMsg, "error");
            } finally {
              setChangingPassword(false);
            }
          }}
          disabled={changingPassword}
          className={`flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ${changingPassword ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <Save className="w-4 h-4" />
          <span>{changingPassword ? "Updating..." : "Update Password"}</span>
        </button>
      </div>

     <div className="mt-6 pt-6 border-t border-white/10">
  <button
    onClick={() => {
      localStorage.removeItem("token"); // remove auth token
      addToast("Logged out successfully!", "success"); // optional toast
      window.location.href = "/auth/login"; // redirect to login
    }}
    className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
  >
    <LogOut className="w-5 h-5" />
    <span className="font-semibold">Logout</span>
  </button>
</div>

    </div>
  </div>
)}

          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
