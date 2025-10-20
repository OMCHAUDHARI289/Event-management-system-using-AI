import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { X, Calendar, Clock, MapPin, User, Mail, Phone, GraduationCap, Ticket } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const TicketPDFGenerator = forwardRef(({ ticketData }, ref) => {
  const ticketRef = useRef();

  // Expose downloadPDF to parent
  useImperativeHandle(ref, () => ({
    downloadPDF: async () => {
      if (!ticketRef.current) return;
      const canvas = await html2canvas(ticketRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${ticketData.eventTitle || "ticket"}.pdf`);
    },
  }));

  if (!ticketData) return null;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const formatTime = (timeString) => {
    try {
      return new Date(timeString).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return timeString || "";
    }
  };

  return (
    <div ref={ticketRef} className="w-[400px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 rounded-3xl border border-white/10 shadow-2xl">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-4">
        <Ticket className="w-6 h-6 text-white" />
        <h2 className="text-2xl font-bold">Event Ticket</h2>
      </div>

      {/* Event Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-center mb-4">
        <div className="text-5xl mb-2">{ticketData.eventImage || "🎫"}</div>
        <h3 className="text-2xl font-bold mb-1">{ticketData.eventTitle}</h3>
        <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-semibold">
          {ticketData.category}
        </span>
      </div>

      {/* Ticket Number */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center mb-4">
        <p className="text-white/60 text-sm mb-1">Ticket Number</p>
        <p className="text-white text-xl font-bold font-mono">{ticketData.ticketNumber}</p>
      </div>

      {/* Event Details */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-4">
        <h4 className="text-white font-bold text-lg mb-3 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-purple-400" />
          <span>Event Details</span>
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-white/80">
            <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <span>{formatDate(ticketData.date)}</span>
          </div>
          <div className="flex items-center space-x-2 text-white/80">
            <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <span>{ticketData.time}</span>
          </div>
          <div className="flex items-center space-x-2 text-white/80">
            <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0" />
            <span>{ticketData.venue}</span>
          </div>
          {ticketData.organizer && (
            <div className="flex items-center space-x-2 text-white/80">
              <User className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span>{ticketData.organizer}</span>
            </div>
          )}
        </div>
      </div>

      {/* Attendee Info */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-4">
        <h4 className="text-white font-bold text-lg mb-3 flex items-center space-x-2">
          <User className="w-5 h-5 text-pink-400" />
          <span>Attendee</span>
        </h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-white/80">
            <User className="w-5 h-5 text-pink-400" />
            <span>{ticketData.userName}</span>
          </div>
          <div className="flex items-center space-x-2 text-white/80">
            <Mail className="w-5 h-5 text-pink-400" />
            <span>{ticketData.email}</span>
          </div>
          {ticketData.phone && (
            <div className="flex items-center space-x-2 text-white/80">
              <Phone className="w-5 h-5 text-pink-400" />
              <span>{ticketData.phone}</span>
            </div>
          )}
          {ticketData.department && (
            <div className="flex items-center space-x-2 text-white/80">
              <GraduationCap className="w-5 h-5 text-pink-400" />
              <span>{ticketData.department}</span>
            </div>
          )}
          {ticketData.year && (
            <div className="flex items-center space-x-2 text-white/80">
              <GraduationCap className="w-5 h-5 text-pink-400" />
              <span>{ticketData.year}</span>
            </div>
          )}
        </div>
      </div>

      {/* Registration Details */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-4">
        <h4 className="text-white font-bold text-lg mb-2">Registration</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-white/60 text-xs">Registered On</p>
            <p className="text-white font-semibold">{formatTime(ticketData.registeredAt)}</p>
          </div>
          <div>
            <p className="text-white/60 text-xs">Amount Paid</p>
            <p className="text-white font-semibold">₹{ticketData.price || ticketData.amount || 0}</p>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-yellow-200 text-sm">
        ⚠️ Please carry a valid ID card along with this ticket. Take a screenshot for offline access.
      </div>
    </div>
  );
});

export default TicketPDFGenerator;
