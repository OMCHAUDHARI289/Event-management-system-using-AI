import { useState } from "react";
import { Calendar, Clock, MapPin, Users, Download, CheckCircle, XCircle, AlertCircle, Ticket, QrCode, Star, MessageSquare, FileText } from "lucide-react";

function StudentMyEvents() {
  const [activeTab, setActiveTab] = useState("upcoming");

  // Events Data
  const myEvents = {
    upcoming: [
      {
        id: 1,
        title: "Tech Fest 2025",
        date: "2025-10-15",
        time: "09:00 AM",
        venue: "Main Auditorium",
        category: "Technical",
        image: "🎪",
        registrationDate: "2025-09-20",
        ticketNumber: "TF2025-001234",
        qrCode: "QR12345",
        status: "confirmed",
        participants: 320,
        price: "Free",
        organizer: "Tech Club"
      },
      {
        id: 2,
        title: "AI Workshop",
        date: "2025-10-18",
        time: "02:00 PM",
        venue: "Seminar Hall",
        category: "Workshop",
        image: "🤖",
        registrationDate: "2025-10-01",
        ticketNumber: "AIW2025-005678",
        qrCode: "QR67890",
        status: "confirmed",
        participants: 65,
        price: "₹300",
        organizer: "AI Club"
      },
      {
        id: 3,
        title: "Sports Meet 2025",
        date: "2025-10-25",
        time: "08:00 AM",
        venue: "Sports Complex",
        category: "Sports",
        image: "⚽",
        registrationDate: "2025-10-03",
        ticketNumber: "SM2025-009876",
        qrCode: "QR45678",
        status: "pending",
        participants: 150,
        price: "₹100",
        organizer: "Sports Committee"
      }
    ],
    ongoing: [
      {
        id: 4,
        title: "Coding Hackathon",
        date: "2025-10-08",
        time: "10:00 AM",
        venue: "Computer Lab",
        category: "Competition",
        image: "💻",
        registrationDate: "2025-09-15",
        ticketNumber: "CH2025-002345",
        qrCode: "QR23456",
        status: "active",
        participants: 100,
        price: "₹200",
        organizer: "Coding Club",
        liveLink: "https://meet.google.com/abc-defg-hij"
      }
    ],
    completed: [
      {
        id: 5,
        title: "Cultural Night",
        date: "2025-09-20",
        time: "06:00 PM",
        venue: "Open Ground",
        category: "Cultural",
        image: "🎭",
        registrationDate: "2025-09-01",
        ticketNumber: "CN2025-003456",
        attended: true,
        participants: 850,
        price: "₹50",
        organizer: "Cultural Committee",
        rating: 4.8,
        certificateAvailable: true
      },
      {
        id: 6,
        title: "Photography Workshop",
        date: "2025-09-15",
        time: "03:00 PM",
        venue: "Art Room",
        category: "Workshop",
        image: "📷",
        registrationDate: "2025-08-20",
        ticketNumber: "PW2025-004567",
        attended: true,
        participants: 45,
        price: "₹250",
        organizer: "Photography Club",
        rating: 4.6,
        certificateAvailable: true
      },
      {
        id: 7,
        title: "Startup Pitch",
        date: "2025-09-10",
        time: "11:00 AM",
        venue: "Conference Hall",
        category: "Competition",
        image: "🚀",
        registrationDate: "2025-08-15",
        ticketNumber: "SP2025-005678",
        attended: false,
        participants: 80,
        price: "Free",
        organizer: "Entrepreneurship Cell",
        rating: null,
        certificateAvailable: false
      }
    ],
    cancelled: [
      {
        id: 8,
        title: "Music Concert",
        date: "2025-09-25",
        time: "07:00 PM",
        venue: "Main Stage",
        category: "Cultural",
        image: "🎵",
        registrationDate: "2025-09-05",
        ticketNumber: "MC2025-006789",
        cancelReason: "Venue unavailable due to weather conditions",
        refundStatus: "processed",
        participants: 500,
        price: "₹150",
        organizer: "Music Club"
      }
    ]
  };

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: myEvents.upcoming.length },
    { id: "ongoing", label: "Ongoing", count: myEvents.ongoing.length },
    { id: "completed", label: "Completed", count: myEvents.completed.length },
    { id: "cancelled", label: "Cancelled", count: myEvents.cancelled.length }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case "confirmed": return { text: "Confirmed", class: "bg-green-500/20 text-green-300" };
      case "pending": return { text: "Pending", class: "bg-yellow-500/20 text-yellow-300" };
      case "active": return { text: "Active Now", class: "bg-blue-500/20 text-blue-300 animate-pulse" };
      default: return { text: status, class: "bg-gray-500/20 text-gray-300" };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-float-delayed"></div>
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
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
      `}</style>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Events</h1>
          <p className="text-white/60">Manage your event registrations and tickets</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 animate-fadeIn">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 rounded-xl font-semibold transition-all duration-300
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              {tab.label} <span className="ml-2">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Upcoming Events */}
        {activeTab === "upcoming" && (
          <div className="space-y-6">
            {myEvents.upcoming.map((event, idx) => {
              const statusInfo = getStatusBadge(event.status);
              return (
                <div
                  key={event.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 animate-scaleIn"
                  style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Event Image */}
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-full lg:w-48 h-48 flex items-center justify-center text-7xl">
                      {event.image}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">{event.title}</h3>
                          <span className="text-white/60 text-sm">{event.category}</span>
                        </div>
                        <span className={`mt-2 sm:mt-0 ${statusInfo.class} px-4 py-2 rounded-full text-xs font-semibold uppercase`}>
                          {statusInfo.text}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2 text-white/70">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/70">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/70">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{event.venue}</span>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 mb-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-white/60 text-xs mb-1">Ticket Number</p>
                            <p className="text-white font-semibold text-sm">{event.ticketNumber}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs mb-1">Registered On</p>
                            <p className="text-white font-semibold text-sm">{new Date(event.registrationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs mb-1">Price Paid</p>
                            <p className="text-white font-semibold text-sm">{event.price}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-xs mb-1">Organizer</p>
                            <p className="text-white font-semibold text-sm">{event.organizer}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                          <Ticket className="w-4 h-4" />
                          <span>View Ticket</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-all">
                          <QrCode className="w-4 h-4" />
                          <span>QR Code</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-all">
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ongoing Events */}
        {activeTab === "ongoing" && (
          <div className="space-y-6">
            {myEvents.ongoing.map((event, idx) => (
              <div
                key={event.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-scaleIn"
                style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="text-white font-semibold">Event is Live Now!</span>
                  </div>
                  <span className="text-white/90 text-sm">Started at {event.time}</span>
                </div>
                
                <div className="flex flex-col lg:flex-row">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-full lg:w-48 h-48 flex items-center justify-center text-7xl">
                    {event.image}
                  </div>

                  <div className="flex-1 p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">{event.title}</h3>
                    
                    {event.liveLink && (
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-4">
                        <p className="text-white/80 text-sm mb-2">Join the event:</p>
                        <a 
                          href={event.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200 font-mono text-sm break-all"
                        >
                          {event.liveLink}
                        </a>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105">
                        <span>Join Event Now</span>
                      </button>
                      <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-all">
                        <Ticket className="w-4 h-4" />
                        <span>View Ticket</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Events */}
        {activeTab === "completed" && (
          <div className="space-y-6">
            {myEvents.completed.map((event, idx) => (
              <div
                key={event.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 animate-scaleIn"
                style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="bg-gradient-to-br from-gray-500 to-slate-600 w-full lg:w-48 h-48 flex items-center justify-center text-7xl opacity-70">
                    {event.image}
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{event.title}</h3>
                        <span className="text-white/60 text-sm">{event.category}</span>
                      </div>
                      {event.attended ? (
                        <div className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-full mt-2 sm:mt-0">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-xs font-semibold">ATTENDED</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-full mt-2 sm:mt-0">
                          <XCircle className="w-4 h-4" />
                          <span className="text-xs font-semibold">MISSED</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-white/70">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/70">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{event.venue}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/70">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{event.participants} participants</span>
                      </div>
                    </div>

                    {event.attended && (
                      <div className="bg-white/5 rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold mb-1">How was the event?</p>
                            {event.rating ? (
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 ${star <= event.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                                    />
                                  ))}
                                </div>
                                <span className="text-white/60 text-sm">({event.rating}/5)</span>
                              </div>
                            ) : (
                              <button className="text-purple-400 hover:text-purple-300 text-sm font-semibold">
                                Rate this event →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {event.certificateAvailable && (
                        <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                          <Download className="w-4 h-4" />
                          <span>Download Certificate</span>
                        </button>
                      )}
                      <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-all">
                        <MessageSquare className="w-4 h-4" />
                        <span>Give Feedback</span>
                      </button>
                      <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-all">
                        <FileText className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancelled Events */}
        {activeTab === "cancelled" && (
          <div className="space-y-6">
            {myEvents.cancelled.map((event, idx) => (
              <div
                key={event.id}
                className="bg-white/5 backdrop-blur-xl border border-red-500/30 rounded-2xl overflow-hidden animate-scaleIn"
                style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}
              >
                <div className="bg-red-500/20 border-b border-red-500/30 p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 font-semibold">Event Cancelled</span>
                </div>

                <div className="flex flex-col lg:flex-row">
                  <div className="bg-gradient-to-br from-red-500 to-red-600 w-full lg:w-48 h-48 flex items-center justify-center text-7xl opacity-50">
                    {event.image}
                  </div>

                  <div className="flex-1 p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">{event.title}</h3>
                    
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                      <p className="text-white/80 text-sm mb-1">Cancellation Reason:</p>
                      <p className="text-white font-medium">{event.cancelReason}</p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/60 text-xs mb-1">Ticket Number</p>
                          <p className="text-white font-semibold text-sm">{event.ticketNumber}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs mb-1">Refund Status</p>
                          <span className="inline-block bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                            {event.refundStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-all">
                      <FileText className="w-4 h-4" />
                      <span>View Refund Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {myEvents[activeTab].length === 0 && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center animate-fadeIn">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl mb-6">
                <Calendar className="w-12 h-12 text-white/70" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No {activeTab} Events</h3>
              <p className="text-white/60">You don't have any {activeTab} events at the moment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentMyEvents;