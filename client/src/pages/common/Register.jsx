import React, { useState, useRef } from 'react';
import { Mail, Lock, User, ArrowRight, GraduationCap, BookOpen, Users } from 'lucide-react';
import icemBg from '../../assets/ICEM.jpg';
import { registerUser } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../common/Toast';

export default function CollegeEventRegister() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // to avoid spamming same toast repeatedly
  const lastToastRef = useRef({}); // { fieldName: lastMessage }
  const lastPasswordStrengthRef = useRef('');

  // simple validators
  const emailIsValid = (email = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordStrength = (pwd = '') => {
    if (!pwd) return '';
    // strong if >=10 and has upper+lower+digit+symbol
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
    if (pwd.length >= 10 && hasUpper && hasLower && hasDigit && hasSymbol) return 'Strong';
    if (pwd.length >= 6) return 'Medium';
    return 'Weak';
  };

  // validate a single field and return message (or empty string)
  const validateField = (name, value, fullState = formData) => {
    const v = (val) => (typeof val === 'string' ? val.trim() : val);

    switch (name) {
      case 'fullName':
        if (!v(value)) return 'Full name is required';
        if (v(value).length < 3) return 'Full name must be at least 3 characters';
        return '';
      case 'email':
        if (!v(value)) return 'Email is required';
        if (!emailIsValid(v(value))) return 'Enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Confirm password is required';
        if (value !== fullState.password) return 'Passwords do not match';
        return '';
      case 'agreeTerms':
        if (!value) return 'You must agree to Terms and Conditions';
        return '';
      default:
        return '';
    }
  };

  // validate all fields — sets errors state and returns boolean
  const validateAll = (data = formData) => {
    const newErrors = {};
    ['fullName', 'email', 'password', 'confirmPassword', 'agreeTerms'].forEach((field) => {
      const msg = validateField(field, data[field], data);
      if (msg) newErrors[field] = msg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // update function that does live validation + toast (no spam)
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    const updated = { ...formData, [name]: newValue };
    setFormData(updated);

    // live validate this field
    const message = validateField(name, newValue, updated);

    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });

    // show toast only when an error appears (or when strength changes)
    if (message) {
      if (lastToastRef.current[name] !== message) {
        addToast(message);
        lastToastRef.current[name] = message;
      }
    } else {
      // clear last toast marker when field becomes valid
      if (lastToastRef.current[name]) delete lastToastRef.current[name];
    }

    // password strength toasts (live but only when strength changes)
    if (name === 'password') {
      const strength = passwordStrength(newValue);
      const last = lastPasswordStrengthRef.current;
      if (strength && strength !== last) {
        addToast(`Password strength: ${strength}`);
        lastPasswordStrengthRef.current = strength;
      } else if (!strength) {
        lastPasswordStrengthRef.current = '';
      }
      // also revalidate confirmPassword because password changed
      const confirmMsg = validateField('confirmPassword', updated.confirmPassword, updated);
      setErrors((prev) => {
        const next = { ...prev };
        if (confirmMsg) next.confirmPassword = confirmMsg;
        else delete next.confirmPassword;
        return next;
      });
      if (confirmMsg && lastToastRef.current['confirmPassword'] !== confirmMsg) {
        addToast(confirmMsg);
        lastToastRef.current['confirmPassword'] = confirmMsg;
      } else if (!confirmMsg) delete lastToastRef.current['confirmPassword'];
    }
  };

  // also validate on blur to ensure user gets immediate feedback if they tab out
  const handleBlur = (e) => {
    const { name } = e.target;
    const message = validateField(name, formData[name], formData);
    if (message && lastToastRef.current[name] !== message) {
      addToast(message);
      lastToastRef.current[name] = message;
    }
    // update errors object
    setErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  // derived: is the form currently valid?
  const isFormValid =
    formData.fullName.trim() &&
    formData.email.trim() &&
    formData.password &&
    formData.confirmPassword &&
    formData.agreeTerms &&
    Object.keys(errors).length === 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // final validation before submit
    if (!validateAll()) {
      addToast('Please fix the form errors before submitting');
      return;
    }

    setLoading(true);
    try {
      const name = formData.fullName.trim();
      const email = formData.email.trim();
      const password = formData.password;

      const result = await registerUser({ name, email, password });

      console.log('User registered successfully:', result);
      addToast('User registered successfully!');
      // Save token & user info to localStorage for auto-login
      localStorage.setItem('studentToken', result.token);
      localStorage.setItem('studentUser', JSON.stringify(result.user));

      addToast('Registration successful! Redirecting...');
      navigate('/student/dashboard');
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Registration failed';
      console.error('Registration error:', message);
      addToast(message);
    } finally {
      setLoading(false);
    }
  };

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
                    onBlur={handleBlur}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl py-2.5 lg:py-3 pl-10 lg:pl-12 pr-4 text-white text-sm lg:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email Address - Full Width */}
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
                    onBlur={handleBlur}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg lg:rounded-xl py-2.5 lg:py-3 pl-10 lg:pl-12 pr-4 text-white text-sm lg:text-base placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                    placeholder="john@college.edu"
                  />
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
                      onBlur={handleBlur}
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
                      onBlur={handleBlur}
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
                    onBlur={handleBlur}
                    className="w-4 h-4 lg:w-5 lg:h-5 mt-0.5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-2 focus:ring-purple-400 transition-all flex-shrink-0"
                  />
                  <span className="ml-2 text-white/90 text-xs sm:text-sm">
                    I agree to the{' '}
                    <span className="text-purple-300 hover:text-purple-200 font-semibold underline cursor-pointer">
                      Terms and Conditions
                    </span>
                    {' '}and{' '}
                    <span className="text-purple-300 hover:text-purple-200 font-semibold underline cursor-pointer">
                      Privacy Policy
                    </span>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                className={`w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold py-3 lg:py-3.5 rounded-lg lg:rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 group animate-fadeInUp delay-700 ${(!isFormValid || loading) ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className="text-sm sm:text-base">{loading ? 'Registering...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-6 lg:mt-8 animate-fadeInUp delay-700">
              <p className="text-white/70 text-xs sm:text-sm">
                Already have an account?{' '}
                <span
                  onClick={() => navigate('/auth/login')}
                  className="text-white font-semibold hover:underline transition-all duration-300 cursor-pointer"
                >
                  Sign In
                </span>
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
