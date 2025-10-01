import React, { useState } from 'react';
import { Mail, Lock, Calendar, ArrowRight, GraduationCap } from 'lucide-react';
import { loginUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import ICEM from '../assets/ICEM.jpg';

export default function CollegeEventLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
      // store JWT and user info
      localStorage.setItem('user', JSON.stringify(data));
      console.log('Login successful:', data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err?.message || err.response?.data?.message || err);
      alert(err?.message || err.response?.data?.message || 'Login failed');
    }
  };
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col lg:flex-row">
      {/* Background Image with Blur - College Building */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${ICEM})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px) brightness(0.7)',
          transform: 'scale(1.1)'
        }}
      />
      
      {/* Animated Gradient Overlay */}
      <div 
        className="absolute inset-0 z-0 transition-all duration-1000"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.5), rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5))',
          animation: 'gradientShift 8s ease infinite',
        }}
      />

      <style>{`
        @keyframes gradientShift {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 0.8; }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
        }
        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
        .delay-500 { animation-delay: 0.5s; opacity: 0; }
      `}</style>

      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden relative z-10 w-full pt-8 pb-4 px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 mb-3 animate-float">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1 animate-fadeInUp delay-100">
          Indira College Of Enigineering <br />And Management
        </h1>
        <p className="text-white/80 text-sm animate-fadeInUp delay-200">Event Management System</p>
      </div>

      {/* Left Side - College Info */}
      <div className="hidden lg:flex relative z-10 w-full lg:w-1/2 items-center justify-center p-8 lg:p-16">
        <div className="max-w-lg">
          <div className="animate-fadeInLeft delay-100">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 mb-6 animate-float">
              <GraduationCap className="w-14 h-14 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 animate-fadeInLeft delay-200">
            Indira College Of Engineering <br />And Management
          </h1>
          
          <p className="text-xl text-white/90 mb-6 animate-fadeInLeft delay-300">
            Event Management System
          </p>
          
          <div className="space-y-4 animate-fadeInLeft delay-400">
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <p>Organize and manage college events seamlessly</p>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <p>Track attendance and participation</p>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <p>Connect students and faculty</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="w-full max-w-md">
          {/* Glassmorphism Login Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10 animate-fadeInRight delay-200">
            <div className="mb-6 lg:mb-8 animate-scaleIn delay-300">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Welcome Back</h2>
              </div>
              <p className="text-white/70 text-sm sm:text-base">Sign in to continue to your dashboard</p>
            </div>

            <div className="space-y-5 lg:space-y-6">
              {/* Email Input */}
              <div className="animate-fadeInUp delay-400">
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-purple-300">
                    <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-white/50" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl py-2.5 lg:py-3 pl-10 lg:pl-12 pr-4 text-white text-sm lg:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    placeholder="student@college.edu"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="animate-fadeInUp delay-500">
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-purple-300">
                    <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-white/50" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl py-2.5 lg:py-3 pl-10 lg:pl-12 pr-4 text-white text-sm lg:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between animate-fadeInUp delay-500">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-400 transition-all"
                  />
                  <span className="ml-2 text-xs sm:text-sm text-white/80 group-hover:text-white transition-colors">Remember me</span>
                </label>
                <button className="text-xs sm:text-sm text-white/80 hover:text-white transition-colors duration-300">
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white font-semibold py-3 lg:py-3.5 rounded-lg lg:rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 group animate-fadeInUp delay-500">
                <span className="text-sm sm:text-base">Sign In</span>
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 lg:my-8 flex items-center animate-fadeInUp delay-500">
              <div className="flex-1 border-t border-white/20"></div>
              <span className="px-4 text-white/60 text-xs sm:text-sm">or continue with</span>
              <div className="flex-1 border-t border-white/20"></div>
            </div>

            {/* Social Login */}
            <div className="flex space-x-3 sm:space-x-4 animate-fadeInUp delay-500">
              <button className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg lg:rounded-xl py-2.5 lg:py-3 text-white text-sm sm:text-base hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                Google
              </button>
              <button className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg lg:rounded-xl py-2.5 lg:py-3 text-white text-sm sm:text-base hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                Microsoft
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center mt-6 lg:mt-8 animate-fadeInUp delay-500">
              <p className="text-white/70 text-xs sm:text-sm">
                Don't have an account?{' '}
                <button type="button" onClick={() => navigate('/register')} className="text-white font-semibold hover:underline transition-all duration-300">
                  Register Now
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 lg:mt-6 animate-fadeInUp delay-500">
            <p className="text-white/60 text-xs sm:text-sm">
              © 2025 ICEM . All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}