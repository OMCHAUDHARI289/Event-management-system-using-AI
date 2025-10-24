import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Bell, Wifi, Gauge, HelpCircle, LogOut, ChevronDown, Settings } from 'lucide-react';
import { getMyProfile } from '../../services/studentService';

export default function ModernHeader({ onLogoClick }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profile, setProfile] = useState(null);

  const [notifications] = useState([
    { id: 1, text: 'New member joined', time: '5m ago', unread: true },
    { id: 2, text: 'Event updated successfully', time: '1h ago', unread: true },
    { id: 3, text: 'System maintenance scheduled', time: '2h ago', unread: false }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch {}
    };
    fetchProfile();
  }, []);

  const { displayName, initials, email } = useMemo(() => {
    const name = profile?.name || 'Student';
    const mail = profile?.email || '';
    const init = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(s => s[0]?.toUpperCase() || '')
      .join('') || 'ST';
    return { displayName: name, initials: init, email: mail };
  }, [profile]);

  const buttonBase = "flex items-center justify-center p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-300 border border-white/10 hover:border-white/20 text-white";

  return (
    <header className="relative bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-white/10 backdrop-blur-xl pl-0 lg:pl-80">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-0 left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <style>{`
        @keyframes float {0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
        @keyframes pulse-slow {0%,100%{opacity:0.3;transform:scale(1);}50%{opacity:0.5;transform:scale(1.05);}}
        @keyframes slideDown {from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}
        .animate-float{animation:float 4s ease-in-out infinite;}
        .animate-pulse-slow{animation:pulse-slow 3s ease-in-out infinite;}
        .animate-slideDown{animation:slideDown 0.2s ease-out forwards;}
      `}</style>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Title */}
          <button
            onClick={() => onLogoClick && onLogoClick()}
            className={`${buttonBase} flex items-center space-x-3 flex-shrink-0`}
            aria-label="Toggle sidebar"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300">
                ICEM Event Hub
              </h1>
            </div>
          </button>

          {/* Right Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
            {/* Home - hidden on mobile */}
            <button onClick={() => navigate('/student/dashboard')} className={`hidden sm:flex ${buttonBase}`}>
              <Home className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="ml-2 text-sm font-medium text-white/70">Home</span>
            </button>

            {/* Network */}
            <div className={`${buttonBase} cursor-pointer`}>
              <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <span className="hidden md:inline ml-2 text-sm font-medium text-white/70">Online</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* Speed */}
            <div className={`${buttonBase} cursor-pointer`}>
              <Gauge className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <span className="hidden md:inline ml-2 text-sm font-medium text-white/70">Fast</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className={buttonBase}
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slideDown z-50">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    <p className="text-xs text-white/60">{unreadCount} unread messages</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-4 hover:bg-white/5 cursor-pointer border-b border-white/5 ${n.unread ? 'bg-purple-500/5' : ''}`}>
                        <p className="text-sm text-white/90">{n.text}</p>
                        <p className="text-xs text-white/50 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FAQ */}
            <button className={buttonBase}>
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Settings */}
            <button className={buttonBase}>
              <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className={`${buttonBase} flex items-center space-x-2`}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-sm sm:text-base font-bold text-white">{initials}</span>
                </div>
                <span className="hidden sm:inline text-sm font-medium text-white/90">{displayName}</span>
                <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slideDown z-50">
                  <div className="p-4 border-b border-white/10">
                    <p className="text-sm font-semibold text-white">{displayName}</p>
                    <p className="text-xs text-white/60">{email}</p>
                  </div>
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors flex items-center space-x-3">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors flex items-center space-x-3">
                      <HelpCircle className="w-4 h-4" />
                      <span>Help & FAQ</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-white/10">
                    <button
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center space-x-3 rounded-lg"
                      onClick={() => { localStorage.clear(); navigate('/auth/login'); }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Click outside */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowNotifications(false); setShowUserMenu(false); }}
        />
      )}
    </header>
  );
}
