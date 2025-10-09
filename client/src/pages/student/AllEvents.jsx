import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Users, Search, Filter, Star, Ticket, Heart, Share2, TrendingUp, Award, Zap } from "lucide-react";
import { getStudentEvents } from "../../services/studentService";
import { useNavigate } from "react-router-dom";

function StudentAllEvents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [viewMode, setViewMode] = useState("grid");

  const [events, setEvents] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        const list = await getStudentEvents();
        setEvents(list.map(e => ({
          id: e._id,
          title: e.title,
          description: e.description || "",
          date: e.date,
          time: e.time,
          venue: e.venue,
          category: e.category,
          image: "🎫",
          capacity: e.capacity,
          registered: e.registrations,
          price: e.price || 0,
          rating: 4.7,
          trending: false,
          featured: false,
          tags: []
        })));
      } catch (e) {
        // ignore
      }
    };
    load();
  }, []);

  const categories = [
    { id: "all", label: "All Events", icon: Calendar },
    { id: "Technical", label: "Technical", icon: Zap },
    { id: "Cultural", label: "Cultural", icon: Star },
    { id: "Sports", label: "Sports", icon: Award },
    { id: "Workshop", label: "Workshop", icon: Users },
    { id: "Competition", label: "Competition", icon: TrendingUp }
  ];

  const filteredEvents = events
    .filter(event => 
      (categoryFilter === "all" || event.category === categoryFilter) &&
      (searchQuery === "" || event.title.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "date") return new Date(a.date) - new Date(b.date);
      if (sortBy === "popular") return b.registered - a.registered;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

  const getAvailabilityColor = (registered, capacity) => {
    const percentage = (registered / capacity) * 100;
    if (percentage >= 90) return "text-red-400";
    if (percentage >= 70) return "text-orange-400";
    return "text-green-400";
  };
const navigate = useNavigate();

   const handleRegisterClick = (id) => {
    navigate(`/student/register/${id}`); // ✅ open register page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed"></div>
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Discover Events</h1>
          <p className="text-white/60">Explore and register for exciting events happening at your college</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 animate-fadeIn">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search events by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="date" className="bg-slate-800">Sort by Date</option>
              <option value="popular" className="bg-slate-800">Most Popular</option>
              <option value="rating" className="bg-slate-800">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 animate-fadeIn">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setCategoryFilter(category.id)}
                className={`
                  flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
                  ${categoryFilter === category.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* Featured Events Banner */}
        {categoryFilter === "all" && (
          <div className="mb-8 animate-scaleIn">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <span>Featured Events</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.filter(e => e.featured).slice(0, 2).map((event, idx) => (
                <div
                  key={event.id}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-105 animate-scaleIn"
                  style={{ animationDelay: `${idx * 100}ms`, opacity: 0 }}
                >
                  <div className="relative">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-48 flex items-center justify-center text-8xl">
                      {event.image}
                    </div>
                    <div className="absolute top-4 right-4 bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-slate-900" />
                      <span>Featured</span>
                    </div>
                    {event.trending && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Trending</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-white/70 text-sm mb-4">{event.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-400">{event.price}</span>
                      <button  onClick={() => handleRegisterClick(event.id)} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105">
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Events Grid */}
        <div className="mb-4 flex items-center justify-between animate-fadeIn">
          <h2 className="text-2xl font-bold text-white">
            {categoryFilter === "all" ? "All Events" : `${categoryFilter} Events`}
            <span className="text-white/60 text-lg ml-2">({filteredEvents.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, idx) => (
            <div
              key={event.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-105 animate-scaleIn"
              style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
            >
              {/* Event Header */}
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 h-40 flex items-center justify-center text-6xl">
                {event.image}
                {event.trending && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>Trending</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-all">
                    <Heart className="w-4 h-4 text-white" />
                  </button>
                  <button className="bg-white/20 backdrop-blur-sm p-2 rounded-lg hover:bg-white/30 transition-all">
                    <Share2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{event.title}</h3>
                  <div className="flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-yellow-400 text-xs font-semibold">{event.rating}</span>
                  </div>
                </div>

                <span className="inline-block text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full mb-3">
                  {event.category}
                </span>

                <p className="text-white/60 text-sm mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-white/70 text-sm">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70 text-sm">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-white/70 text-sm">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-white/5 text-white/60 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/60 text-xs">Availability</span>
                    <span className={`text-xs font-semibold ${getAvailabilityColor(event.registered, event.capacity)}`}>
                      {event.registered}/{event.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-white font-bold text-lg">{event.price}</span>
                  <button onClick={() => handleRegisterClick(event.id)} className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                    <Ticket className="w-4 h-4" />
                    <span>Register</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center animate-fadeIn">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl mb-6">
                <Search className="w-12 h-12 text-white/70" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Events Found</h3>
              <p className="text-white/60 mb-6">Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentAllEvents;