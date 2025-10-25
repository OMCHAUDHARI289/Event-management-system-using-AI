import { useState, useEffect } from "react";
import { Calendar, Plus, X, Clock, MapPin, Users, Trash2, Edit, Eye, Filter } from "lucide-react";
import { getEvents as getAllAdminEvents, createEvent, deleteEvent, uploadEventImage, getEventRegistrations } from "../../services/adminService";
import ViewEventModal from "../../components/admin/ViewEventModal";
import AdminEditEventModal from "../../components/admin/AdminEditEventModal";

function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    image: "",
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    capacity: "",
    price: "",
    category: "Technical",
  });
  const [viewEvent, setViewEvent] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Compute status based on current date and event date/time
  const getEventStatus = (event) => {
    const now = new Date();
    
    // Parse the event date properly
    const eventDateOnly = new Date(event.date);
    const [hours, minutes] = (event.time || "00:00").split(":");
    const eventDateTime = new Date(eventDateOnly);
    eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // If event date/time is in the past
    if (eventDateTime < now) return "past";
    
    // If event is today (between today's start and end)
    if (eventDateTime >= todayStart && eventDateTime <= todayEnd) return "ongoing";
    
    // Otherwise it's in the future
    return "upcoming";
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const data = await getAllAdminEvents();
      setEvents(data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Create event
  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.venue) {
      alert('Please fill Title, Date and Venue');
      return;
    }
    if (!form.capacity) {
      alert('Please provide event capacity');
      return;
    }
    try {
      const payload = {
        ...form,
        registrations: 0,
        status: "upcoming",
        price: Number(form.price || 0),
        capacity: Number(form.capacity || 0),
      };
      await createEvent(payload);
      setForm({ image: "", title: "", description: "", date: "", time: "", venue: "", capacity: "", price: "", category: "Technical" });
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      console.error("Error creating event:", err);
      alert(err?.response?.data?.message || 'Error creating event');
    }
  };

  const handleViewEvent = async (event) => {
    setViewEvent(event);
    try {
      const data = await getEventRegistrations(event._id);
      setRegistrations(Array.isArray(data) ? data : (data && data.registrations ? data.registrations : []));
      setIsViewModalOpen(true);
    } catch (err) {
      console.error("Failed to load registrations:", err);
      setRegistrations([]);
      setIsViewModalOpen(true);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadEventImage(file);
      setForm({ ...form, image: url });
      alert("Image uploaded successfully!");
    } catch (err) {
      alert("Image upload failed");
    }
  };

  // Delete event
  const handleDelete = async (id) => {
    try {
      await deleteEvent(id);
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  // Helpers
  const getStatusColor = (status) => {
    switch (status) {
      case "ongoing": return "from-green-500 to-emerald-500";
      case "upcoming": return "from-blue-500 to-cyan-500";
      case "past": return "from-gray-500 to-slate-500";
      default: return "from-purple-500 to-pink-500";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ongoing": return "bg-green-500/20 text-green-300";
      case "upcoming": return "bg-blue-500/20 text-blue-300";
      case "past": return "bg-gray-500/20 text-gray-300";
      default: return "bg-purple-500/20 text-purple-300";
    }
  };

  const filteredEvents =
    filter === "all"
      ? events.map(e => ({ ...e, computedStatus: getEventStatus(e) }))
      : events.filter((e) => getEventStatus(e) === filter).map(e => ({ ...e, computedStatus: getEventStatus(e) }));

  const eventCounts = {
    all: events.length,
    upcoming: events.filter((e) => getEventStatus(e) === "upcoming").length,
    ongoing: events.filter((e) => getEventStatus(e) === "ongoing").length,
    past: events.filter((e) => getEventStatus(e) === "past").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float-delayed"></div>
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
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
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
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }
      `}</style>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Events</h1>
              <p className="text-white/60">{events.length} total events</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span>{showForm ? 'Cancel' : 'Create Event'}</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 animate-fadeIn">
          {[
            { key: "all", label: "All Events", count: eventCounts.all },
            { key: "upcoming", label: "Upcoming", count: eventCounts.upcoming },
            { key: "ongoing", label: "Ongoing", count: eventCounts.ongoing },
            { key: "past", label: "Past", count: eventCounts.past }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`
                px-6 py-3 rounded-xl font-semibold transition-all duration-300
                ${filter === tab.key 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                }
              `}
            >
              {tab.label} <span className="ml-2 text-sm">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Add Event Form */}
        {showForm && (
          <div className="mb-8 animate-slideDown">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Create New Event</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">Event Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-white/70"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">Event Title</label>
                  <input
                    type="text"
                    placeholder="Tech Fest 2025"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                  <textarea
                    placeholder="Event description..."
                    rows="3"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Venue</label>
                  <input
                    type="text"
                    placeholder="Main Auditorium"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Capacity</label>
                  <input
                    type="number"
                    placeholder="500"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="0 for Free"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">Category</label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Technical" className="bg-slate-800">Technical</option>
                    <option value="Cultural" className="bg-slate-800">Cultural</option>
                    <option value="Sports" className="bg-slate-800">Sports</option>
                    <option value="Workshop" className="bg-slate-800">Workshop</option>
                    <option value="Competition" className="bg-slate-800">Competition</option>
                  </select>
                </div>

                <button
                  onClick={handleSubmit}
                  className="md:col-span-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, idx) => {
            const currentStatus = event.computedStatus || getEventStatus(event);
            return (
              <div
                key={event._id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 transform hover:scale-105 animate-scaleIn"
                style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
              >
                {/* Event Header with Gradient */}
                <div className={`bg-gradient-to-r ${getStatusColor(currentStatus)} p-6 relative`}>
                  <div className="absolute top-4 right-4">
                    <span className={`${getStatusBadge(currentStatus)} px-3 py-1 rounded-full text-xs font-semibold uppercase`}>
                      {currentStatus}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 pr-20">{event.title}</h3>
                  <span className="text-white/80 text-sm">{event.category}</span>
                </div>

                {/* Event Body */}
                <div className="p-6 space-y-4">
                  <p className="text-white/70 text-sm line-clamp-2">{event.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-white/70">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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

                  {/* Registration Progress */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>Registrations</span>
                      </span>
                      <span className="text-white font-semibold text-sm">{event.registrations}/{event.capacity}</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${getStatusColor(currentStatus)} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${(event.registrations / event.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button onClick={() => { handleViewEvent(event) }} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </button>
                    {currentStatus !== "past" && (
                    <button onClick={() => {setSelectedEvent(event); setEditModalOpen(true);}} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2">
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                    )}
                    <button 
                      onClick={() => handleDelete(event._id)}
                      className="bg-red-500/20 hover:bg-red-500 border border-red-500/30 text-red-400 hover:text-white p-2 rounded-lg transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center animate-fadeIn">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl mb-6">
                <Calendar className="w-12 h-12 text-white/70" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No {filter !== 'all' ? filter : ''} Events</h3>
              <p className="text-white/60 mb-6">
                {filter === 'all' ? 'Start by creating your first event' : `No ${filter} events found`}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Event</span>
                </button>
              )}
            </div>
          </div>
        )}
    
        <ViewEventModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          event={viewEvent}
          registrations={registrations}
        />
        <AdminEditEventModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          event={selectedEvent}
          onUpdated={(updatedEvent) => {
            setEvents((prev) =>
              prev.map((ev) => (ev._id === updatedEvent._id ? updatedEvent : ev))
            );
          }}
        />
      </div>
    </div>
  );
}

export default AdminEvents;