import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, MapPin, User, Mail, Phone, GraduationCap, Ticket } from 'lucide-react';

function TicketModal({ isOpen, onClose, ticketData }) {
  if (!isOpen || !ticketData) return null;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const formatTime = (timeString) => {
    try { return new Date(timeString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); } catch { return timeString || ''; }
  };

  const modal = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center py-8 px-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-white/10 shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <Ticket className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Event Ticket</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-center">
            <div className="text-4xl mb-3">{ticketData.eventImage || '🎫'}</div>
            <h3 className="text-2xl font-bold text-white mb-1">{ticketData.eventTitle}</h3>
            <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-semibold">{ticketData.category}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-3 text-center">
            <p className="text-white/60 text-xs mb-1">Ticket Number</p>
            <p className="text-white text-lg font-bold font-mono">{ticketData.ticketNumber}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <h4 className="text-white font-bold text-sm mb-3 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span>Event Details</span>
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-white/80">
                <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-white/60 text-xs">Date</p>
                  <p className="text-white font-semibold text-sm">{formatDate(ticketData.date)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-white/60 text-xs">Time</p>
                  <p className="text-white font-semibold text-sm">{ticketData.time}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <MapPin className="w-5 h-5 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-white/60 text-xs">Venue</p>
                  <p className="text-white font-semibold text-sm">{ticketData.venue}</p>
                </div>
              </div>
              {ticketData.organizer && (
                <div className="flex items-center space-x-3 text-white/80">
                  <User className="w-5 h-5 text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-white/60 text-xs">Organizer</p>
                    <p className="text-white font-semibold text-sm">{ticketData.organizer}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <h4 className="text-white font-bold text-sm mb-3 flex items-center space-x-2">
              <User className="w-5 h-5 text-pink-400" />
              <span>Attendee Information</span>
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-white/80">
                <User className="w-5 h-5 text-pink-400 flex-shrink-0" />
                <div>
                  <p className="text-white/60 text-xs">Full Name</p>
                  <p className="text-white font-semibold text-sm">{ticketData.userName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-white/80">
                <Mail className="w-5 h-5 text-pink-400 flex-shrink-0" />
                <div>
                  <p className="text-white/60 text-xs">Email</p>
                  <p className="text-white font-semibold text-sm break-all">{ticketData.email}</p>
                </div>
              </div>
              {ticketData.phone && (
                <div className="flex items-center space-x-3 text-white/80">
                  <Phone className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  <div>
                    <p className="text-white/60 text-xs">Phone</p>
                    <p className="text-white font-semibold">{ticketData.phone}</p>
                  </div>
                </div>
              )}
              {ticketData.department && (
                <div className="flex items-center space-x-3 text-white/80">
                  <GraduationCap className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  <div>
                    <p className="text-white/60 text-xs">Department</p>
                    <p className="text-white font-semibold">{ticketData.department}</p>
                  </div>
                </div>
              )}
              {ticketData.year && (
                <div className="flex items-center space-x-3 text-white/80">
                  <GraduationCap className="w-5 h-5 text-pink-400 flex-shrink-0" />
                  <div>
                    <p className="text-white/60 text-xs">Year</p>
                    <p className="text-white font-semibold">{ticketData.year}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-3">
            <h4 className="text-white font-bold text-sm mb-3">Registration Details</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-white/60 text-xs mb-1">Registered On</p>
                <p className="text-white font-semibold text-sm">{formatTime(ticketData.registeredAt)}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Amount Paid</p>
                <p className="text-white font-semibold text-sm">₹{ticketData.price || ticketData.amount || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
            <p className="text-yellow-200 text-xs">⚠️ Please carry a valid ID card along with this ticket. Take a screenshot for offline access.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export default TicketModal;
