import { useState } from "react";
import { X, Calendar, Clock, MapPin, Users, Search, Download, CheckCircle, XCircle, Mail, Phone, TrendingUp } from "lucide-react";

export default function ViewEventModal({ isOpen, onClose, event, registrations = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("all"); // all, attended, not-attended

  if (!isOpen || !event) return null;

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch =
      reg.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAttendance =
      attendanceFilter === "all" ||
      (attendanceFilter === "attended" && reg.attended) ||
      (attendanceFilter === "not-attended" && !reg.attended);

    return matchesSearch && matchesAttendance;
  });

  // Stats
  const totalRegistered = registrations.length;
  const totalAttended = registrations.filter(r => r.attended).length;
  const attendancePercentage = totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(1) : 0;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl animate-scaleIn">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Event Details</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Event Info */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

              {/* Event Image */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl overflow-hidden aspect-square flex items-center justify-center">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-8xl">🎫</span>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    event.status === 'ongoing' ? 'bg-green-500/20 text-green-300' :
                    event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-gray-500/20 text-gray-300'
                  }`}>
                    {event.status?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Event Details */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-2">{event.title}</h3>
                  <span className="inline-block bg-white/10 px-3 py-1 rounded-full text-white/80 text-sm">
                    {event.category}
                  </span>
                </div>

                <p className="text-white/70 text-sm leading-relaxed">
                  {event.description || 'No description provided'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center space-x-3 text-white/70">
                    <Calendar className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-white/60 text-xs">Date</p>
                      <p className="text-white font-semibold">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  {/* Time */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center space-x-3 text-white/70">
                    <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-white/60 text-xs">Time</p>
                      <p className="text-white font-semibold">{event.time}</p>
                    </div>
                  </div>
                  {/* Venue */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center space-x-3 text-white/70">
                    <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-white/60 text-xs">Venue</p>
                      <p className="text-white font-semibold">{event.venue}</p>
                    </div>
                  </div>
                  {/* Capacity */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center space-x-3 text-white/70">
                    <Users className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-white/60 text-xs">Capacity</p>
                      <p className="text-white font-semibold">{event.registrations}/{event.capacity}</p>
                    </div>
                  </div>
                </div>

                {/* Entry Fee */}
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Entry Fee</span>
                    <span className="text-2xl font-bold text-white">{event.price > 0 ? `₹${event.price}` : 'FREE'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Registered */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Total Registered</p>
                <p className="text-2xl font-bold text-white">{totalRegistered}</p>
              </div>
            </div>
            {/* Attended */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Total Attended</p>
                <p className="text-2xl font-bold text-white">{totalAttended}</p>
              </div>
            </div>
            {/* Not Attended */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Not Attended</p>
                <p className="text-2xl font-bold text-white">{totalRegistered - totalAttended}</p>
              </div>
            </div>
            {/* Attendance Rate */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-white/60 text-xs">Attendance Rate</p>
                <p className="text-2xl font-bold text-white">{attendancePercentage}%</p>
              </div>
            </div>
          </div>

          {/* Registrations */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h3 className="text-xl font-bold text-white">Registrations ({filteredRegistrations.length})</h3>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by name, ticket..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Filter */}
                <select
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="all" className="bg-slate-800">All</option>
                  <option value="attended" className="bg-slate-800">Attended</option>
                  <option value="not-attended" className="bg-slate-800">Not Attended</option>
                </select>

                {/* Export */}
                <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filteredRegistrations.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left text-white/80 text-xs font-semibold uppercase tracking-wider px-6 py-4">Student Name</th>
                      <th className="text-left text-white/80 text-xs font-semibold uppercase tracking-wider px-6 py-4">Ticket Number</th>
                      <th className="text-left text-white/80 text-xs font-semibold uppercase tracking-wider px-6 py-4">Department & Year</th>
                      <th className="text-left text-white/80 text-xs font-semibold uppercase tracking-wider px-6 py-4">Contact</th>
                      <th className="text-center text-white/80 text-xs font-semibold uppercase tracking-wider px-6 py-4">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredRegistrations.map((reg, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {reg.fullName?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-white font-medium">{reg.fullName}</span>
                        </td>
                        <td className="px-6 py-4"><span className="text-white/70 font-mono text-sm">{reg.ticketNumber}</span></td>
                        <td className="px-6 py-4 text-white/70 text-sm">
                          <p>{reg.department || 'N/A'}</p>
                          <p className="text-white/50 text-xs">{reg.year || ''}</p>
                        </td>
                        <td className="px-6 py-4 text-white/70 text-sm space-y-1">
                          {reg.email && <div className="flex items-center space-x-2"><Mail className="w-3 h-3" /><span className="text-xs">{reg.email}</span></div>}
                          {reg.phone && <div className="flex items-center space-x-2"><Phone className="w-3 h-3" /><span className="text-xs">{reg.phone}</span></div>}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {reg.attended ? (
                            <span className="inline-flex items-center space-x-1 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                              <CheckCircle className="w-3 h-3" /> <span>Attended</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-xs font-semibold">
                              <XCircle className="w-3 h-3" /> <span>Not Attended</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Users className="w-16 h-16 text-white/20 mb-4" />
                  <p className="text-white/60 text-lg font-medium">No registrations found</p>
                  <p className="text-white/40 text-sm">{searchTerm || attendanceFilter !== 'all' ? 'Try adjusting your filters' : 'No students have registered yet'}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
