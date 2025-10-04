import { useEffect, useState } from "react";
import { Users, Plus, X, Mail, Phone, BookOpen, Calendar, Trash2, UserCircle } from "lucide-react";

function AdminMembers() {
  const [members, setMembers] = useState([
    {
      _id: "1",
      name: "John Doe",
      prn: "PRN12345",
      email: "john@college.edu",
      phone: "+91 9876543210",
      branch: "Computer Science",
      year: "3",
      role: "President"
    },
    {
      _id: "2",
      name: "Jane Smith",
      prn: "PRN12346",
      email: "jane@college.edu",
      phone: "+91 9876543211",
      branch: "Information Technology",
      year: "2",
      role: "Vice President"
    },
    {
      _id: "3",
      name: "Mike Johnson",
      prn: "PRN12347",
      email: "mike@college.edu",
      phone: "+91 9876543212",
      branch: "Electronics",
      year: "3",
      role: "Member"
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    prn: "",
    email: "",
    phone: "",
    branch: "",
    year: "",
    role: "Member"
  });

  // ✅ Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const newMember = {
      ...form,
      _id: Date.now().toString()
    };
    setMembers([...members, newMember]);
    setForm({ name: "", prn: "", email: "", phone: "", branch: "", year: "", role: "Member" });
    setShowForm(false);
  };

  // ✅ Delete member
  const handleDelete = (id) => {
    setMembers(members.filter(m => m._id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
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
        <div className="flex items-center justify-between mb-8 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Club Members</h1>
              <p className="text-white/60">{members.length} active members</p>
            </div>
          </div>
          
          {/* Add Member Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span className="hidden sm:inline">{showForm ? 'Cancel' : 'Add Member'}</span>
          </button>
        </div>

        {/* Add Member Form */}
        {showForm && (
          <div className="mb-8 animate-slideDown">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6">Add New Member</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">PRN</label>
                  <input
                    type="text"
                    placeholder="PRN12345"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={form.prn}
                    onChange={(e) => setForm({ ...form, prn: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="john@college.edu"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 1234567890"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Branch</label>
                  <input
                    type="text"
                    placeholder="Computer Science"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Year</label>
                  <select
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                  >
                    <option value="" className="bg-slate-800">Select Year</option>
                    <option value="1" className="bg-slate-800">1st Year</option>
                    <option value="2" className="bg-slate-800">2nd Year</option>
                    <option value="3" className="bg-slate-800">3rd Year</option>
                    <option value="4" className="bg-slate-800">4th Year</option>
                  </select>
                </div>

                <button
                  onClick={handleSubmit}
                  className="md:col-span-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, idx) => (
            <div
              key={member._id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-105 animate-scaleIn"
              style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
            >
              {/* Member Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <UserCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                    <span className="text-xs text-white/60">{member.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(member._id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500 rounded-lg transition-all duration-300 group"
                  title="Delete member"
                >
                  <Trash2 className="w-4 h-4 text-red-400 group-hover:text-white" />
                </button>
              </div>

              {/* Member Details */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-white/70">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm truncate">{member.email}</span>
                </div>
                
                {member.phone && (
                  <div className="flex items-center space-x-2 text-white/70">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{member.phone}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-white/70">
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{member.branch}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center space-x-2 text-white/70">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Year {member.year}</span>
                  </div>
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                    {member.prn}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {members.length === 0 && !showForm && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center animate-fadeIn">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl mb-6">
                <Users className="w-12 h-12 text-white/70" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Members Yet</h3>
              <p className="text-white/60 mb-6">Start by adding your first club member</p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Add First Member</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMembers;