import { useState, useEffect, useRef } from "react";
import { X, Camera, CheckCircle, XCircle, AlertCircle, Loader2, User, Ticket } from "lucide-react";
import { markAttendance } from "../../services/adminService";

function QRScannerModal({ isOpen, onClose, eventId }) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualTicket, setManualTicket] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setScanning(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setScanResult({ 
        status: 'error', 
        message: 'Camera access denied. Please allow camera permissions.' 
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

const handleManualScan = async () => {
  if (!manualTicket) return;
  setLoading(true);

  try {
    const res = await markAttendance(manualTicket);

    if (res.success) {
      setScanResult({ status: 'success', studentData: res.studentData });
    } else if (res.status === 'duplicate') {
      setScanResult({ status: 'duplicate', studentData: res.studentData });
    } else {
      setScanResult({ status: 'error', message: res.message });
    }
  } catch (err) {
    console.error(err);
    setScanResult({ status: 'error', message: 'Unable to connect to server' });
  } finally {
    setLoading(false);
    setManualTicket("");
  }
};


  const handleScanAgain = () => {
    setScanResult(null);
    setScanning(true);
  };

  const handleClose = () => {
    stopCamera();
    setScanResult(null);
    setManualTicket("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl max-w-lg w-full border border-white/10 shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center space-x-3">
            <Camera className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Scan QR Code</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Camera View / Results */}
          {!scanResult ? (
            <div className="space-y-4">
              {/* Camera Preview */}
              <div className="relative bg-black rounded-2xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Scanning Overlay */}
                {scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-4 border-white/50 w-64 h-64 rounded-2xl relative">
                      <div className="absolute inset-0 border-4 border-purple-500 rounded-2xl animate-pulse"></div>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-scan"></div>
                    </div>
                  </div>
                )}

                {/* Loading Overlay */}
                {loading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-3" />
                      <p className="text-white text-sm">Verifying ticket...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                <p className="text-purple-200 text-sm text-center font-medium">
                  📷 Position the QR code within the frame to scan
                </p>
              </div>

              {/* Manual Entry */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                <p className="text-white/60 text-xs mb-3 text-center">Or enter ticket number manually:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualTicket}
                    onChange={(e) => setManualTicket(e.target.value)}
                    placeholder="Enter ticket number"
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                  />
                  <button
                    onClick={handleManualScan}
                    disabled={loading || !manualTicket}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition-all"
                  >
                    Scan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Scan Result */
            <div className="space-y-4">
              {/* Success Result */}
              {scanResult.status === 'success' && (
                <div className="bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 animate-successPulse">
                  <div className="text-center mb-6">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <CheckCircle className="w-20 h-20 text-green-400" />
                      <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <h3 className="text-2xl font-bold text-green-200 mb-1">Attendance Marked!</h3>
                    <p className="text-green-300/80 text-sm">Student checked in successfully</p>
                  </div>

                  {/* Student Details */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-white/60 text-xs">Student Name</p>
                        <p className="text-white font-semibold">{scanResult.studentData.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Ticket className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-white/60 text-xs">Ticket Number</p>
                        <p className="text-white font-semibold font-mono">{scanResult.studentData.ticketNumber}</p>
                      </div>
                    </div>
                    {scanResult.studentData.department && (
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <div>
                          <p className="text-white/60 text-xs">Department & Year</p>
                          <p className="text-white font-semibold">{scanResult.studentData.department} - {scanResult.studentData.year}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Result */}
              {scanResult.status === 'error' && (
                <div className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 text-center animate-errorShake">
                  <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-200 mb-2">Scan Failed</h3>
                  <p className="text-red-300/80 text-sm">{scanResult.message || 'Invalid ticket or already marked'}</p>
                </div>
              )}

              {/* Duplicate Entry */}
              {scanResult.status === 'duplicate' && (
                <div className="bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-6 text-center">
                  <AlertCircle className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-yellow-200 mb-2">Already Checked In</h3>
                  <p className="text-yellow-300/80 text-sm">This student has already marked attendance</p>
                  
                  {scanResult.studentData && (
                    <div className="mt-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3">
                      <p className="text-white font-semibold">{scanResult.studentData.name}</p>
                      <p className="text-white/60 text-xs">Ticket: {scanResult.studentData.ticketNumber}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleScanAgain}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105"
              >
                Scan Next QR Code
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes successPulse {
          0% { opacity: 0; transform: scale(0.95); }
          50% { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        .animate-successPulse {
          animation: successPulse 0.5s ease-out forwards;
        }
        .animate-errorShake {
          animation: errorShake 0.5s ease-out forwards;
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

// Example usage
export default function App() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-8">Club Member Scanner</h1>
        <button
          onClick={() => setIsScannerOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 mx-auto"
        >
          <Camera className="w-5 h-5" />
          <span>Open Scanner</span>
        </button>
      </div>

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
}