import { useState, useEffect, useRef } from "react";
import { Calendar, Clock, MapPin, Users, Download, CheckCircle, XCircle, AlertCircle, Ticket, QrCode, Star, MessageSquare, FileText } from "lucide-react";
import TicketModal from '../../components/student/TicketModal';
import { getMyEvents } from "../../services/studentService";
import { useReactToPrint } from "react-to-print";
import TicketPDFGenerator from "../../components/student/TicketPDFGenerator"; // adjust path
import TicketQRCodeModal from "../../components/student/TicketQRCodeModal";
import StudentFeedbackModal from "../../components/student/StudentFeedbackModal";


function StudentMyEvents() {
  const [activeTab, setActiveTab] = useState("upcoming");  
  const [myEvents, setMyEvents] = useState({ upcoming: [], ongoing: [], completed: [], cancelled: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const ticketRef = useRef();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRegId, setFeedbackRegId] = useState(null);




  // Centralized fetch + normalize function so callers (effect, callbacks) get the same data shape
  const fetchMyEvents = async () => {
    try {
      const data = await getMyEvents();

      // If backend returns object with myEvents property
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (data.myEvents) {
          setMyEvents(data.myEvents);
          return;
        }
        // If it's already the grouped events object
        setMyEvents(data);
        return;
      }

      // If backend returns array (fallback), normalize into grouped object
      const list = Array.isArray(data) ? data : [];
      const now = new Date();
      const grouped = { upcoming: [], ongoing: [], completed: [], cancelled: [] };

      list.forEach((e) => {
        const eventDate = e.date ? new Date(e.date) : null;
        const base = {
          id: e._id || e.id,
          title: e.title,
          date: e.date,
          time: e.time || '',
          venue: e.venue || '',
          category: e.category || '',
          image: e.image || '🎫',
          registrationDate: (e.registeredAt || new Date()).toString(),
          ticketNumber: e.ticketNumber || e._id,
          qrCode: e._id ? `QR${String(e._id).slice(-6)}` : '',
          status: e.status || 'confirmed',
          participants: e.registrations || 0,
          price: e.price || 0,
          organizer: e.organizer || '',
          liveLink: e.liveLink || null,
          attended: e.attended,
          registrationId: e.registrationId || e._id || null,
          rating: e.rating,
        };

        if (e.status && e.status.toLowerCase() === 'cancelled') {
          grouped.cancelled.push(base);
        } else if (eventDate) {
          const sameDay = eventDate.toDateString() === now.toDateString();
          if (sameDay) grouped.ongoing.push(base);
          else if (eventDate > now) grouped.upcoming.push(base);
          else grouped.completed.push(base);
        } else {
          grouped.upcoming.push(base);
        }
      });

      setMyEvents(grouped);
    } catch (err) {
      console.error('Failed to load my events', err);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

const handleOpenQR = (event) => {
  setSelectedTicket({
    ticketNumber: event.ticketNumber,
    eventTitle: event.title,
    date: event.date,
    time: event.time,
    venue: event.venue,
    userName: event.userName || event.fullName,
  });
  setQrModalOpen(true);
};

const handleOpenFeedback = (registrationId) => {
  setFeedbackRegId(registrationId);
  setFeedbackModalOpen(true);
};


  // Ensure counts are safe even if myEvents was set to an unexpected shape
  const upcomingCount = Array.isArray(myEvents?.upcoming) ? myEvents.upcoming.length : 0;
  const ongoingCount = Array.isArray(myEvents?.ongoing) ? myEvents.ongoing.length : 0;
  const completedCount = Array.isArray(myEvents?.completed) ? myEvents.completed.length : 0;
  const cancelledCount = Array.isArray(myEvents?.cancelled) ? myEvents.cancelled.length : 0;

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: upcomingCount },
    { id: "ongoing", label: "Ongoing", count: ongoingCount },
    { id: "completed", label: "Completed", count: completedCount },
    { id: "cancelled", label: "Cancelled", count: cancelledCount }
  ];

  // Active list for the current tab (safe fallback to array)
  const activeList = Array.isArray(myEvents?.[activeTab]) ? myEvents[activeTab] : [];

  const getStatusBadge = (status) => {
    switch(status) {
      case "confirmed": return { text: "Confirmed", class: "bg-green-500/20 text-green-300" };
      case "pending": return { text: "Pending", class: "bg-yellow-500/20 text-yellow-300" };
      case "active": return { text: "Active Now", class: "bg-blue-500/20 text-blue-300 animate-pulse" };
      default: return { text: status, class: "bg-gray-500/20 text-gray-300" };
    }
  };

  const handleViewTicket = (event) => {
  setSelectedTicket({
    ticketNumber: event.ticketNumber,
    qrCode: event.qrCode,
    eventTitle: event.title,
    eventImage: event.image,
    date: event.date,
    time: event.time,
    venue: event.venue,
    category: event.category,
    price: event.price,
    organizer: event.organizer,
    userName: event.userName || event.fullName,  // from backend
    email: event.email,
    phone: event.phone,
    department: event.department,
    year: event.year,
    registeredAt: event.registrationDate,
  });
  setIsModalOpen(true);
};

 const myTicket = {
    ticketNumber: "EVT456",
    eventTitle: "Diwali Workshop",
    userName: "Om Patil",
    email: "om@example.com",
    phone: "9876543210",
    date: "30 Oct 2025",
    time: "5:00 PM",
    venue: "Auditorium",
    category: "Cultural",
    price: "$30",
    organizer: "College Org",
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
            {(Array.isArray(myEvents?.upcoming) ? myEvents.upcoming : []).map((event, idx) => {
              const statusInfo = getStatusBadge(event.status);
              return (
                <div
                  key={event.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 animate-scaleIn"
                  style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Event Image */}
                     {/* Event Image */}
      <div className="w-full lg:w-48 h-48 overflow-hidden rounded-2xl">
        <img 
          src={event.image || '👌'} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
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
                        <button onClick={() => handleViewTicket(event)} className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                          <Ticket className="w-4 h-4" />
                          <span>View Ticket</span>
                        </button>
                        <button onClick={() => ticketRef.current?.downloadPDF()} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-all">
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
            {(Array.isArray(myEvents?.ongoing) ? myEvents.ongoing : []).map((event, idx) => (
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
                  <div className="w-full lg:w-48 h-48 overflow-hidden rounded-2xl">
        <img 
          src={event.image || '👌'} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
      </div>

                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{event.title}</h3>
                        <span className="text-white/60 text-sm">{event.category}</span>
                      </div>
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
                      <button onClick={() => handleOpenQR(event)} className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                        <QrCode className="w-4 h-4" />
                        <span>QR Code</span>
                      </button>
                      <button onClick={() => handleViewTicket(event)} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-all">
                        <Ticket className="w-4 h-4" />
                        <span>View Ticket</span>
                      </button>
                      <button onClick={() => handleDownload(event)} className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-all">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
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
            {(Array.isArray(myEvents?.completed) ? myEvents.completed : []).map((event, idx) => (
              <div
                key={event.id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 animate-scaleIn"
                style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="w-full lg:w-48 h-48 overflow-hidden rounded-2xl">
                    <img
                      src={event.image || 'https://via.placeholder.com/400x400?text=Event'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
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
                          <p className="text-white/60 text-xs mb-1">Participants</p>
                          <p className="text-white font-semibold text-sm">{event.participants}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-xs mb-1">Organizer</p>
                          <p className="text-white font-semibold text-sm">{event.organizer}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {event.certificateAvailable && (
                        <button className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                          <Download className="w-4 h-4" />
                          <span>Download Certificate</span>
                        </button>
                      )}
                      {!event.rating && event.attended && (
  <button
    onClick={() => handleOpenFeedback(event.registrationId || event._id)} // pass registrationId
    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-all"
  >
    <MessageSquare className="w-4 h-4" />
    <span>Give Feedback</span>
  </button>
)}
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
            {(Array.isArray(myEvents?.cancelled) ? myEvents.cancelled : []).map((event, idx) => (
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
                  <div className="w-full lg:w-48 h-48 overflow-hidden rounded-2xl">
                    <img
                      src={event.image || 'https://via.placeholder.com/400x400?text=Event'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{event.title}</h3>
                        <span className="text-white/60 text-sm">{event.category}</span>
                      </div>
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
                    
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                      <p className="text-white/80 text-sm mb-1">Cancellation Reason:</p>
                      <p className="text-white font-medium">{event.cancelReason}</p>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 mb-4">
                      <div className="grid grid-cols-2 gap-4">
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
  {(Array.isArray(activeList) && activeList.length === 0) && (
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
        {/* Ticket Modal */}
        <TicketModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          ticketData={selectedTicket}
        />
        {/* Hidden printable area for download: render off-screen so it doesn't appear in layout */}
        <div aria-hidden="true" style={{ position: 'absolute', left: -10000, top: 0 }}>
          <TicketPDFGenerator ref={ticketRef} ticketData={selectedTicket || myTicket} />
        </div>
        <TicketQRCodeModal
  isOpen={qrModalOpen}
  onClose={() => setQrModalOpen(false)}
  ticket={selectedTicket}
/>
<StudentFeedbackModal
  isOpen={feedbackModalOpen}
  onClose={() => setFeedbackModalOpen(false)}
  registrationId={feedbackRegId}
  onFeedbackSubmitted={fetchMyEvents}
/>

      </div>
    </div>
  );
}

export default StudentMyEvents;