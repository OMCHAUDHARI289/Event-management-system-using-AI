import { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

// Toast Provider Component
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

// Individual Toast Component
function Toast({ id, message, type, duration, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const config = {
    success: {
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      iconColor: 'text-green-400'
    },
    error: {
      icon: XCircle,
      gradient: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      iconColor: 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      gradient: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      iconColor: 'text-yellow-400'
    },
    info: {
      icon: Info,
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    }
  };

  const { icon: Icon, gradient, bgColor, borderColor, iconColor } = config[type] || config.info;

  return (
    <div
      className={`
        pointer-events-auto
        bg-white/5 backdrop-blur-xl border ${borderColor}
        rounded-xl p-4 shadow-2xl
        flex items-start gap-3 min-w-[320px] max-w-md
        transform transition-all duration-300
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        hover:scale-[1.02] hover:shadow-green-500/20
      `}
      style={{
        animation: isExiting ? 'slideOut 0.3s ease-out forwards' : 'slideIn 0.3s ease-out forwards'
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>

      {/* Icon */}
      <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Message */}
      <div className="flex-1 pt-1.5">
        <p className="text-white text-sm leading-relaxed">{message}</p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className="text-white/40 hover:text-white transition-colors flex-shrink-0 p-1 hover:bg-white/10 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Demo Component
export default function ToastDemo() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-float-delayed"></div>
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

        <div className="relative z-10 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Toast Notifications</h1>
              <p className="text-white/60">Glassmorphic toast system matching your analytics theme</p>
            </div>

            {/* Demo Buttons */}
            <ToastDemoButtons />

            {/* Usage Instructions */}
            <div className="mt-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Usage Instructions</h2>
              
              <div className="space-y-4 text-white/80 text-sm">
                <div>
                  <h3 className="text-white font-semibold mb-2">1. Wrap your app with ToastProvider:</h3>
                  <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                    <code className="text-green-400">{`import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ToastProvider>
      {/* Your app components */}
    </ToastProvider>
  );
}`}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">2. Use the useToast hook in your components:</h3>
                  <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                    <code className="text-green-400">{`import { useToast } from './components/Toast';

function YourComponent() {
  const { addToast } = useToast();

  const handleSuccess = () => {
    addToast('Operation completed successfully!', 'success');
  };

  const handleError = () => {
    addToast('Something went wrong!', 'error', 5000);
  };

  return (
    <button onClick={handleSuccess}>
      Show Toast
    </button>
  );
}`}</code>
                  </pre>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">3. Toast Types:</h3>
                  <ul className="list-disc list-inside space-y-1 text-white/70">
                    <li><span className="text-green-400">success</span> - For successful operations</li>
                    <li><span className="text-red-400">error</span> - For errors and failures</li>
                    <li><span className="text-yellow-400">warning</span> - For warnings and alerts</li>
                    <li><span className="text-blue-400">info</span> - For informational messages</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-white font-semibold mb-2">4. Parameters:</h3>
                  <ul className="list-disc list-inside space-y-1 text-white/70">
                    <li><span className="text-purple-400">message</span> - The text to display</li>
                    <li><span className="text-purple-400">type</span> - 'success' | 'error' | 'warning' | 'info' (default: 'info')</li>
                    <li><span className="text-purple-400">duration</span> - Time in ms before auto-dismiss (default: 4000)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}

function ToastDemoButtons() {
  const { addToast } = useToast();

  const demos = [
    {
      label: 'Success',
      type: 'success',
      message: 'Data exported successfully!',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Error',
      type: 'error',
      message: 'Failed to load analytics data',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      label: 'Warning',
      type: 'warning',
      message: 'Your session will expire in 5 minutes',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      label: 'Info',
      type: 'info',
      message: 'New feedback summary available',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {demos.map((demo, idx) => (
        <button
          key={idx}
          onClick={() => addToast(demo.message, demo.type)}
          className={`bg-gradient-to-r ${demo.gradient} hover:opacity-90 text-white font-semibold px-6 py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}
        >
          {demo.label} Toast
        </button>
      ))}
    </div>
  );
}
