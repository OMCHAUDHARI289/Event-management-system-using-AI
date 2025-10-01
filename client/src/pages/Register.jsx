import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Calendar, ArrowRight, GraduationCap, BookOpen, Users } from 'lucide-react';
import icemBg from '../assets/ICEM.jpg';
import { registerUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export default function CollegeEventRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    studentId: '',
    department: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return alert('Passwords do not match');
    }
    if (!formData.agreeTerms) {
      return alert('You must agree to terms and conditions');
    }

    try {
  // backend expects `name` field; map fullName -> name
  const payload = { ...formData, name: formData.fullName };
  delete payload.fullName;
  const data = await registerUser(payload);
      localStorage.setItem('user', JSON.stringify(data));
      console.log('Registration successful:', data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err.response?.data?.message || err.message || err);
      alert(err.response?.data?.message || err.message || 'Registration failed');
    }
  };
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col lg:flex-row">
      {/* Background Image with Blur - College Campus */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${icemBg})`,
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
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(139, 92, 246, 0.5), rgba(219, 39, 119, 0.5))',
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
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
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
        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
        .delay-500 { animation-delay: 0.5s; opacity: 0; }
        .delay-600 { animation-delay: 0.6s; opacity: 0; }
        .delay-700 { animation-delay: 0.7s; opacity: 0; }
      `}</style>

      {/* Mobile Header - Only visible on mobile */}
      <div className="lg:hidden relative z-10 w-full pt-8 pb-4 px-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 mb-3 animate-float">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-1 animate-fadeInUp delay-100">
          Indira College Of Engineering <br />And Management
        </h1>
        <p className="text-white/80 text-sm animate-fadeInUp delay-200">Event Management System</p>
      </div>

      {/* Left Side - College Info (Desktop Only) */}
      <div className="hidden lg:flex relative z-10 w-full lg:w-2/5 items-center justify-center p-8 lg:p-16">
        <div className="max-w-lg">
          <div className="animate-fadeInLeft delay-100">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 mb-6 animate-float">
              <GraduationCap className="w-14 h-14 text-white" />
            </div>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 animate-fadeInLeft delay-200">
            Join Our<br />Community
          </h1>

          <p className="text-xl text-white/90 mb-8 animate-fadeInLeft delay-300">
            Become part of Indira College's vibrant event ecosystem
          </p>

          <div className="flex flex-col space-y-4">
            <div className="flex items-start space-x-4 group">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 group-hover:bg-white/30 transition-all duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Community</h3>
                <p className="text-white/80 text-sm">Connect with students and faculty members</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 group">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 group-hover:bg-white/30 transition-all duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Resources</h3>
                <p className="text-white/80 text-sm">Access event materials and certificates</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="relative z-10 w-full lg:w-3/5 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-4 lg:py-8 overflow-y-auto">
        <div className="w-full max-w-2xl my-4 lg:my-8">
          {/* Glassmorphism Registration Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10 animate-fadeInRight delay-200">
            <div className="mb-6 lg:mb-8 animate-scaleIn delay-300">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create Account</h2>
              <p className="text-white/70 text-sm sm:text-base">Fill in your details to get started</p>
            </div>

            <div className="space-y-4 lg:space-y-5">
              {/* Full Name */}
              <div className="animate-fadeInUp delay-400">
                <label className="block text-white/90 text-sm font-medium mb-2">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
                    <User className="w-4 h-4 lg:w-5 lg:h-5 text-white/50 group-focus-within:text-purple-300 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl py-2.5 lg:py-3 pl-10 lg:pl-12 pr-4 text-white text-sm lg:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email and Phone - Side by Side on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                <div className="animate-fadeInUp delay-500">
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
                      <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-white/50 group-focus-within:text-purple-300 transition-colors" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl py-2.5 lg:py-3 pl-10 lg:pl-12 pr-4 text-white text-sm lg:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                      placeholder="john@college.edu"
                    />
                  </div>
                </div>

                <div className="animate-fadeInUp delay-500">
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
                      <Phone className="w-4 h-4 lg:w-5 lg:h-5 text-white/50 group-focus-within:text-purple-300 transition-colors" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl py-2.5 lg:py-3 pl-10 lg:pl-12 pr-4 text-white text-sm lg:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>
              </div>

              {/* Student ID and Department - Side by Side on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                <div className="animate-fadeInUp delay-600">
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl py-2.5 lg:py-3 px-4 text-white text-sm lg:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    placeholder="STU2025001"
                  />
                </div>

                <div className="animate-fadeInUp delay-600">
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl py-2.5 lg:py-3 px-4 text-white text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                  >
                    <option value="" className="bg-gray-800">Select Department</option>
                    <option value="cse" className="bg-gray-800">Computer Science</option>
                    <option value="ece" className="bg-gray-800">Electronics & Communication</option>
                    <option value="me" className="bg-gray-800">Mechanical Engineering</option>
                    <option value="ce" className="bg-gray-800">Civil Engineering</option>
                    <option value="it" className="bg-gray-800">Information Technology</option>
                    <option value="eee" className="bg-gray-800">Electrical Engineering</option>
                  </select>
                </div>
              </div>

              {/* Password Fields - Side by Side on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
                <div className="animate-fadeInUp delay-700">
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-white/50 group-focus-within:text-purple-300 transition-colors" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl py-2.5 lg:py-3 pl-10 lg:pl-12 pr-4 text-white text-sm lg:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="animate-fadeInUp delay-700">
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
                      <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-white/50 group-focus-within:text-purple-300 transition-colors" />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl py-2.5 lg:py-3 pl-10 lg:pl-12 pr-4 text-white text-sm lg:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="animate-fadeInUp delay-700">
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleChange}
                    className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-400 transition-all flex-shrink-0"
                  />
                  <span className="ml-2 lg:ml-3 text-xs sm:text-sm text-white/80 group-hover:text-white transition-colors">
                    I agree to the{' '}
                    <button className="text-purple-300 hover:text-purple-200 font-semibold underline">
                      Terms and Conditions
                    </button>
                    {' '}and{' '}
                    <button className="text-purple-300 hover:text-purple-200 font-semibold underline">
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 lg:py-3.5 rounded-lg lg:rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 group animate-fadeInUp delay-700"
              >
                <span className="text-sm sm:text-base">Create Account</span>
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-6 lg:mt-8 animate-fadeInUp delay-700">
              <p className="text-white/70 text-xs sm:text-sm">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/')} className="text-white font-semibold hover:underline transition-all duration-300">
                  Sign In
                </button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 lg:mt-6 animate-fadeInUp delay-700">
            <p className="text-white/60 text-xs sm:text-sm">
              © 2025 ICEM . All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}