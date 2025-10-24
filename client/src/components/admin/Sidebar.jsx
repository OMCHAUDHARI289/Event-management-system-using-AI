import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, BarChart3, UserCircle, Menu, X, ChevronRight, Bell, Search, Mail } from 'lucide-react';

export default function DashboardSidebar({ isOpen: isOpenProp, setIsOpen: setIsOpenProp }) {
  const [activeItem, setActiveItem] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.replace('/admin/', '') || 'dashboard';
    // If path contains further segments, take the first segment
    const first = path.split('/')[0];
    setActiveItem(first);
  }, [location.pathname]);
  const [localOpen, setLocalOpen] = useState(false);
  const isControlled = typeof isOpenProp !== 'undefined' && typeof setIsOpenProp === 'function';
  const isOpen = isControlled ? isOpenProp : localOpen;
  const setIsOpen = isControlled ? setIsOpenProp : setLocalOpen;
  const [hoveredItem, setHoveredItem] = useState(null);
  const [user, setUser] = useState({ name: 'Admin', email: 'admin@example.com' });

  useEffect(() => {
  const raw = localStorage.getItem('user');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      setUser({
        name: parsed.name || 'Admin',
        email: parsed.email || 'admin@example.com'
      });
    } catch {}
  }
}, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500' },
    { id: 'members', label: 'Members', icon: Users, color: 'from-purple-500 to-pink-500' },
    { id: 'events', label: 'Events', icon: Calendar, color: 'from-orange-500 to-red-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-green-500 to-emerald-500' },
    { id: 'profile', label: 'Profile', icon: UserCircle, color: 'from-indigo-500 to-purple-500' },
    { id: 'attendance', label: 'Attendace', icon: Mail, color: 'from-pink-500 to-rose-500' }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-transparent backdrop-blur-lg border-0 rounded-xl p-3 text-white hover:bg-transparent focus:outline-none transition-all duration-300"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-40
        w-80 bg-transparent backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col p-6">
          

          {/* Search Bar */}
          <div className="mb-6 animate-fadeIn delay-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent border-0 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 space-y-2 perspective-container">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              const isHovered = hoveredItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    // navigate to the admin route for this item
                    navigate(`/admin/${item.id}`);
                  }}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`
                    w-full h-20 group relative overflow-hidden bg-transparent hover:bg-transparent focus:outline-none border-0 rounded-xl
                    animate-slideIn delay-${(index + 2) * 100}
                  `}
                >
                  <div className={`
                    card-3d relative
                    flex items-center space-x-4 px-4 py-3.5 rounded-xl
                    transition-all duration-300
                    ${isActive ? 'active' : ''}
                    ${isActive 
                      ? 'bg-gradient-to-r ' + item.color + ' shadow-lg shadow-purple-500/30' 
                      : 'bg-transparent hover:bg-transparent'
                    }
                  `}>
                    {/* Animated Background Gradient */}
                    <div className={`
                      absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 
                      transition-opacity duration-300 rounded-xl
                      ${isHovered && !isActive ? 'opacity-20' : ''}
                    `}></div>

                    {/* Icon Container with 3D Effect */}
                    <div className={`
                      relative z-10 flex items-center justify-center
                      w-10 h-10 rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'bg-white/20 shadow-lg' 
                        : 'bg-transparent group-hover:bg-transparent'
                      }
                      ${isHovered || isActive ? 'scale-110 rotate-3' : ''}
                    `}>
                      <Icon className={`
                        w-5 h-5 transition-all duration-300
                        ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
                      `} />
                    </div>

                    {/* Label */}
                    <span className={`
                      relative z-10 font-medium transition-all duration-300
                      ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}
                    `}>
                      {item.label}
                    </span>

                    {/* Arrow Indicator */}
                    <ChevronRight className={`
                      relative z-10 w-5 h-5 ml-auto transition-all duration-300
                      ${isActive 
                        ? 'text-white opacity-100 translate-x-0' 
                        : 'text-white/40 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                      }
                    `} />

                    {/* Shine Effect */}
                    <div className={`
                      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      bg-gradient-to-r from-transparent via-white/10 to-transparent
                      transform -skew-x-12 translate-x-full group-hover:translate-x-[-200%]
                      transition-transform duration-1000
                    `}></div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* User Profile Card */}
          <div className="mt-6 animate-fadeIn delay-500">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group h-20">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <UserCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{user.name}</h3>
                  <p className="text-xs text-white/60">{user.email}</p>
                </div>
                <Bell className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 animate-fadeIn"
        />
      )}
    </>
  );
}