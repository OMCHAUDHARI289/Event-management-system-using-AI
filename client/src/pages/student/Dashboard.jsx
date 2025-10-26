// src/pages/student/StudentDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Clock, MapPin, Users, Award, CheckCircle, XCircle, Search, Ticket
} from "lucide-react";
import { getStudentEvents, getMyEvents, getMyProfile } from "../../services/studentService";
import { achievementDefinitions, getAchievementStatus, getRarityColor } from "../../utils/achievementUtils";
import {useToast} from"../../pages/common/Toast";

function StudentDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]); // all events from API
  const [achievementsFromServer, setAchievementsFromServer] = useState([]);
  const [loading, setLoading] = useState(true);
  const addToast=useToast();
  const navigate = useNavigate();

  // dedupe helper
  const uniqueById = (arr = []) => {
    const map = new Map();
    for (const it of arr) {
      if (!it || !it.id) continue;
      if (!map.has(it.id)) map.set(it.id, it);
    }
    return Array.from(map.values());
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [eventsRes, myRes, profileRes] = await Promise.allSettled([
          getStudentEvents(),
          getMyEvents(),
          getMyProfile()
        ]);

        // all events (raw)
        let events = [];
        if (eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value)) {
          events = eventsRes.value.map(e => ({
            id: e._id || e.id,
            title: e.title,
            date: e.date,
            time: e.time,
            venue: e.venue,
            category: e.category || e.type || "General",
            // do NOT use external image links — we'll render a placeholder
            capacity: e.capacity ?? 0,
            registered: e.registrations ?? 0,
            price: e.price ? `${e.price}` : 'Free',
          }));
        }

        // normalize my events (registrations)
        let myEventsFlat = [];
        if (myRes.status === "fulfilled") {
          const myData = myRes.value;
          if (myData && typeof myData === 'object' && myData.myEvents) {
            const g = myData.myEvents;
            myEventsFlat = [
              ...(Array.isArray(g.upcoming) ? g.upcoming : []),
              ...(Array.isArray(g.ongoing) ? g.ongoing : []),
              ...(Array.isArray(g.completed) ? g.completed : []),
              ...(Array.isArray(g.cancelled) ? g.cancelled : []),
            ];
          } else if (Array.isArray(myData)) {
            myEventsFlat = myData;
          } else if (myData && Array.isArray(myData.events)) {
            myEventsFlat = myData.events;
          } else if (Array.isArray(myData.myEvents)) {
            myEventsFlat = myData.myEvents;
          }
        }

        const normalizedRegistered = myEventsFlat
          .map(e => {
            const ev = e.eventId || e;
            const id = ev?._id || ev?.id || e?._id || e?.id;
            const statusRaw = (ev?.status || e?.status || '').toString().toLowerCase();
            const status = statusRaw === 'past' ? 'completed' : (statusRaw || 'upcoming');
            return {
              id,
              title: ev?.title || e?.title || 'Untitled Event',
              date: ev?.date || e?.date,
              time: ev?.time || e?.time || '',
              venue: ev?.venue || e?.venue || '',
              status,
              category: ev?.category || e?.category || 'General',
              participants: ev?.registrations ?? ev?.participants ?? 0,
              attended: Boolean(e?.attended || ev?.attended)
            };
          })
          .filter(it => it && it.id);

        const dedupRegistered = uniqueById(normalizedRegistered)
          .sort((a, b) => {
            const da = a.date ? new Date(a.date) : 0;
            const db = b.date ? new Date(b.date) : 0;
            return db - da; // newest first
          });

        const dedupAllEvents = uniqueById(events)
          .sort((a, b) => {
            const da = a.date ? new Date(a.date) : 0;
            const db = b.date ? new Date(b.date) : 0;
            return da - db; // soonest first
          });

        if (!mounted) return;
        setRegisteredEvents(dedupRegistered);
        setAllEvents(dedupAllEvents);

        // achievements from profile
        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setAchievementsFromServer(Array.isArray(profileRes.value.achievements) ? profileRes.value.achievements : []);
        } else {
          setAchievementsFromServer([]);
        }
      } catch (err) {
        
        console.error("Error loading dashboard data:", err);
        addToast({ title: "Error loading dashboard data", description: err.message, status: "error" });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  // Real events attended overall (from registrations)
  const eventsAttended = useMemo(() => registeredEvents.filter(e => e.attended).length, [registeredEvents]);

  // Upcoming events based on ALL events (future date)
  const now = useMemo(() => new Date(), []);
  const upcomingEventsList = useMemo(() => {
    return allEvents.filter(ev => {
      if (!ev.date) return false;
      const d = new Date(ev.date);
      return d > new Date(); // strictly future
    }).sort((a,b) => new Date(a.date) - new Date(b.date));
  }, [allEvents]);

  const upcomingEventsCount = upcomingEventsList.length;

  // certificates -> try to count certificates from achievements or profile structure
  const certificatesEarned = useMemo(() => {
    if (!Array.isArray(achievementsFromServer)) return 0;
    return achievementsFromServer.filter(a => (a.type === 'certificate' || (a.category && a.category === 'certificate'))).length;
  }, [achievementsFromServer]);

  // Recent lists limited to 4
  const recentRegistered = useMemo(() => {
    const filtered = registeredEvents.filter(e => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (e.title || '').toLowerCase().includes(q) || (e.category || '').toLowerCase().includes(q);
    }).filter(e => filterStatus === 'all' ? true : (e.status === filterStatus));
    return filtered.slice(0, 4);
  }, [registeredEvents, searchQuery, filterStatus]);

  const recentAvailable = useMemo(() => {
    const filtered = upcomingEventsList.filter(e => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (e.title || '').toLowerCase().includes(q) || (e.category || '').toLowerCase().includes(q);
    });
    return filtered.slice(0, 4);
  }, [upcomingEventsList, searchQuery]);

  // Achievements: top 5
  const topFiveAchievements = useMemo(() => {
    const rendered = achievementDefinitions.map(def => {
      const status = getAchievementStatus(def, {}, achievementsFromServer || []);
      return { def, status };
    });

    rendered.sort((a, b) => {
      if ((a.status.earned ? 1 : 0) !== (b.status.earned ? 1 : 0)) return (b.status.earned ? 1 : 0) - (a.status.earned ? 1 : 0);
      return (b.status.progress || 0) - (a.status.progress || 0);
    });

    return rendered.slice(0, 5);
  }, [achievementsFromServer]);

  // Quick stats
  const attendanceRate = useMemo(() => {
    const total = registeredEvents.length;
    if (!total) return 0;
    return Math.round((eventsAttended / total) * 100);
  }, [registeredEvents, eventsAttended]);

  const eventsThisMonth = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    return registeredEvents.filter(e => {
      if (!e.date) return false;
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    }).length;
  }, [registeredEvents]);

  const participationScore = useMemo(() => {
    const total = registeredEvents.length;
    if (!total) return 0;
    const score = Math.round(((eventsAttended / total) * 10) * 10) / 10;
    return score;
  }, [registeredEvents, eventsAttended]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Events Attended", value: eventsAttended, icon: CheckCircle, color: "from-blue-500 to-cyan-500" },
    { label: "Upcoming Events", value: upcomingEventsCount, icon: Calendar, color: "from-purple-500 to-pink-500" },
    { label: "Certificates Earned", value: certificatesEarned, icon: Award, color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0);}50%{transform:translateY(-20px);} }
        @keyframes float-delayed { 0%,100%{transform:translateY(0);}50%{transform:translateY(20px);} }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Welcome back 👋</h1>
              <p className="text-white/60">Here's what's happening with your events</p>
            </div>
            <div />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                  <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">My Events</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {recentRegistered.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-white/60">
                  You have no registered events.
                </div>
              ) : recentRegistered.map((event, idx) => (
                <div key={`${event.id}-${idx}`} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:shadow-2xl">
                  <div className="flex flex-col sm:flex-row">
                    {/* placeholder visual (no external image) */}
                    <div className={`w-full sm:w-32 h-32 flex items-center justify-center text-4xl ${event.status === 'completed' ? 'bg-gradient-to-br from-gray-600 to-slate-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
                      <div className="text-white/90"><Ticket className="w-8 h-8" /></div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                          <span className="text-white/60 text-sm">{event.category}</span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${event.status === 'ongoing' ? 'bg-green-500/20 text-green-300' : event.status === 'completed' ? 'bg-gray-500/20 text-gray-300' : 'bg-purple-500/20 text-purple-300'}`}>
                          {event.status || 'upcoming'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center space-x-2 text-white/70">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/70">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{event.time || 'TBA'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/70">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm">{event.venue || 'Online'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-white/60">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{event.participants} participants</span>
                        </div>
                        {event.status === "completed" ? (
                          event.attended ? (
                            <button className="flex items-center space-x-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-lg">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-semibold">Attended</span>
                            </button>
                          ) : (
                            <button className="flex items-center space-x-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-lg">
                              <XCircle className="w-4 h-4" />
                              <span className="text-sm font-semibold">Missed</span>
                            </button>
                          )
                        ) : (
                          <button onClick={() => navigate(`/student/events/${event.id}`)} className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg">
                            <Ticket className="w-4 h-4" />
                            <span className="text-sm font-semibold">View Ticket</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Upcoming Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentAvailable.length === 0 ? (
                  <div className="text-white/60">No upcoming events.</div>
                ) : recentAvailable.map((event, idx) => (
                  <div key={`${event.id}-${idx}`} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:shadow-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-white">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">{event.category}</span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">{event.title}</h3>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2 text-white/60 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span>{event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-white/60 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{event.venue || 'Online'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">{event.registered}/{event.capacity} registered</span>
                      <span className="text-green-400 font-semibold">{event.price}</span>
                    </div>
                    <button onClick={() => navigate(`/student/events/${event.id}`)} className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-2 rounded-lg">
                      Register / View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Top Achievements</h3>
                <Award className="w-5 h-5 text-yellow-400" />
              </div>

              <div className="grid grid-cols-1 gap-3">
                {topFiveAchievements.length === 0 ? (
                  <p className="text-white/60 text-sm">No achievements yet.</p>
                ) : topFiveAchievements.map(({ def, status }, idx) => (
                  <div key={`${def.id || def.title}-${idx}`} className={`p-3 rounded-xl transition-all ${status.earned ? `bg-gradient-to-r ${getRarityColor(def.rarity)} bg-opacity-20 border-2` : 'bg-white/5 border border-white/10 opacity-80'}`}>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{def.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-semibold text-sm">{def.title}</h4>
                          {status.earned ? (
                            <span className="text-green-300 text-xs font-semibold">Earned • {status.date || 'unknown'}</span>
                          ) : (
                            <span className="text-white/40 text-xs">{status.progress ?? 0}%</span>
                          )}
                        </div>
                        <p className="text-white/60 text-xs mt-1">{def.desc}</p>

                        {!status.earned && (
                          <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                            <div style={{ width: `${status.progress ?? 0}%` }} className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3 text-white/70 text-sm">
                <div className="flex items-center justify-between">
                  <span>Attendance Rate</span>
                  <span>{attendanceRate}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: `${attendanceRate}%` }} />
                </div>

                <div className="flex items-center justify-between">
                  <span>Events This Month</span>
                  <span>{eventsThisMonth}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Participation Score</span>
                  <span>{participationScore}/10</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${(participationScore / 10) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white/80">Download Certificates</button>
                <button className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white/80">Share Profile</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
