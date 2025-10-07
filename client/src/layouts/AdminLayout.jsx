// src/layouts/AdminLayout.jsx
import React, { useState } from "react";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";
import { Outlet } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
      {/* Animated Background Elements (global for admin area) */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
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
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
        .delay-500 { animation-delay: 0.5s; opacity: 0; }
        .delay-600 { animation-delay: 0.6s; opacity: 0; }
        
        .perspective-container {
          perspective: 1000px;
        }
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .card-3d:hover {
          transform: translateZ(20px) rotateY(5deg);
        }
        .card-3d.active {
          transform: translateZ(30px) scale(1.05);
        }
      `}</style>

      {/* Content wrapper: keep background (animated/gradient) separate from UI layers */}
      <div className="relative z-10 w-full">
        {/* Sidebar (fixed) - controlled from layout so Header can toggle it */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Header fixed at top and brought in front of the sidebar (header z-50 > sidebar z-40) */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <Header onLogoClick={() => setIsSidebarOpen(v => !v)} />
        </div>

        {/* Main Content - add top padding for header height and shift right on large screens to clear fixed sidebar */}
  <div className={`ml-0 ${isSidebarOpen ? 'lg:ml-80' : 'lg:ml-0'} flex flex-col  transition-all duration-300`}>
            <div className="relative z-30 -mt-[57%] lg:-mt-[57%] bg-slate-900/50 backdrop-blur-xl border border-white/5 w-full transition-all duration-300">
              <Outlet />
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
