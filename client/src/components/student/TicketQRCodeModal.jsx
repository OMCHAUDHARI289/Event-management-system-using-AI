// components/student/TicketQRCodeModal.jsx
import { useState, useEffect } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import QRCode from "qrcode";

export default function TicketQRCodeModal({ isOpen, onClose, ticket }) {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState("waiting");

  useEffect(() => {
    if (isOpen && ticket?.ticketNumber) {
      setLoading(true);
      setAttendanceStatus("waiting");

      QRCode.toDataURL(ticket.ticketNumber, {
        width: 160,
        margin: 2,
        color: {
          dark: "#7C3AED",
          light: "#f8fafc",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, ticket]);

  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-12 px-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl max-w-sm w-full border border-white/10 shadow-2xl animate-scaleIn">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-xl font-bold text-white">Attendance QR</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">

          {/* Event Info */}
          <div className="text-center">
            <h3 className="text-lg font-bold text-white">{ticket.eventTitle || ticket.title}</h3>
            <p className="text-white/60 text-xs">{ticket.venue}</p>
          </div>

          {/* QR Code Box */}
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center w-48 h-48 border-4 border-purple-500 rounded-xl">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-1" />
                <p className="text-purple-500 text-xs">Generating QR...</p>
              </div>
            ) : (
              <div
                className="w-48 h-48 rounded-xl flex items-center justify-center p-2"
                style={{
                  background: "linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)",
                  borderRadius: "20px",
                }}
              >
                <img
                  src={qrCodeUrl}
                  alt="Ticket QR Code"
                  className="w-full h-full bg-white p-1 rounded-lg"
                  style={{ filter: "drop-shadow(0 0 6px rgba(124, 58, 237, 0.7))" }}
                />
              </div>
            )}
          </div>

          {/* Ticket Number & Name */}
            <div className="text-center mb-4">
              <p className="text-white font-bold mb-1">Ticket #{ticket.ticketNumber}</p>
              <p className="text-white text-sm">{ticket.userName}</p>
            </div>

          {/* Instructions */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-2">
            <p className="text-purple-200 text-xs text-center font-medium">
              📱 Show this QR code to the event organizer for attendance marking
            </p>
          </div>

          {/* Status Section */}
          <div className="space-y-2">
            {attendanceStatus === "waiting" && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <div className="absolute inset-0 border-4 border-purple-400/30 rounded-full animate-ping"></div>
                  <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                </div>
                <p className="text-white/60 text-xs font-medium">Waiting for scan...</p>
                <p className="text-white/40 text-2xs mt-1">Keep this QR ready</p>
              </div>
            )}

            {attendanceStatus === "success" && (
              <div className="bg-green-500/20 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 text-center animate-successPulse">
                <div className="relative w-12 h-12 mx-auto mb-1">
                  <CheckCircle className="w-12 h-12 text-green-400" />
                  <div className="absolute inset-0 border-4 border-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <p className="text-green-200 text-sm font-bold">Attendance Marked! ✓</p>
                <p className="text-green-300/80 text-xs mt-1">Checked in successfully</p>
              </div>
            )}
          </div>
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
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
        .animate-successPulse { animation: successPulse 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
