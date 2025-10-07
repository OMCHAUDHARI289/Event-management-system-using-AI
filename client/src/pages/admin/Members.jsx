import { useState ,useEffect} from "react";
import { Users, Plus, X, Mail, Phone, BookOpen, Calendar, Trash2, UserCircle, Shield, Search, Filter, ChevronDown, Edit2, CheckCircle } from "lucide-react";
import {getClubMembers, getStudents, addMember, promoteStudent, deleteMember} from '../../services/adminService';

function AdminMembers() {
  const [view, setView] = useState("club"); // "club" or "students"
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const [clubMembers, setClubMembers] = useState([]);
  const [students, setStudents] = useState([]);

  const [promoteForm, setPromoteForm] = useState({
    position: "Member",
    branch: "",
    year: ""
  });

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" // default role
  });

  const positions = ["Member", "Volunteer"];

  // -------------------- Fetch Data on Mount --------------------
useEffect(() => {
  const fetchData = async () => {
    try {
      const membersRes = await getClubMembers();
      setClubMembers(membersRes || []); // <- extract the array
      const studentsRes = await getStudents();
      setStudents(studentsRes|| []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };
  fetchData();
}, []);


  // -------------------- Add Member --------------------
  const handleAddMember = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) return;

    try {
      const newUser = await addMember({
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
        role: addForm.role === 'club' ? 'clubMember' : 'student'
      });

      const created = newUser.user || newUser;
      if ((addForm.role === "club") || created.role === 'clubMember') setClubMembers([...clubMembers, created]);
      else setStudents([...students, created]);

      setAddForm({ name: "", email: "", password: "", role: "student" });
      setShowAddForm(false);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add user';
      console.error("Error adding user:", msg);
      alert(msg);
    }
  };

  // -------------------- Promote Student --------------------
  const handlePromote = async () => {
    if (!selectedStudent) return;

    try {
      const promoted = await promoteStudent(selectedStudent._id, {
        position: promoteForm.position,
        branch: promoteForm.branch,
        year: promoteForm.year
      });

      setClubMembers([...clubMembers, promoted]);
      setStudents(students.filter(s => s._id !== selectedStudent._id));
      setShowPromoteModal(false);
      setSelectedStudent(null);
      setPromoteForm({ position: "Member", branch: "", year: "" });
    } catch (err) {
      console.error("Error promoting student:", err);
    }
  };

  // -------------------- Delete Member --------------------
  const handleDelete = async (id) => {
    try {
      await deleteMember(id);
      setClubMembers(clubMembers.filter(m => m._id !== id));
    } catch (err) {
      console.error("Error deleting member:", err);
    }
  };

  // -------------------- Filter & Search --------------------
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (student.prn && student.prn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredClubMembers = filterRole === "all"
    ? clubMembers
    : clubMembers.filter(m => m.position === filterRole);

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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Member Management</h1>
              <p className="text-white/60">
                {view === "club" ? `${clubMembers.length} club members` : `${students.length} registered students`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {view === "club" && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>{showAddForm ? 'Cancel' : 'Add Member'}</span>
              </button>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-3 mb-8 animate-fadeIn">
          <button
            onClick={() => setView("club")}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
              ${view === "club"
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }
            `}
          >
            <Shield className="w-4 h-4" />
            <span>Club Members</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{clubMembers.length}</span>
          </button>
          
          <button
            onClick={() => setView("students")}
            className={`
              flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300
              ${view === "students"
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
              }
            `}
          >
            <Users className="w-4 h-4" />
            <span>All Students</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{students.length}</span>
          </button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
  <div className="mb-8 animate-slideDown">
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-6">Add New User</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Full Name */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Full Name *</label>
          <input
            type="text"
            placeholder="John Doe"
            value={addForm.name}
            onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Email *</label>
          <input
            type="email"
            placeholder="john@college.edu"
            value={addForm.email}
            onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Password *</label>
          <input
            type="password"
            placeholder="********"
            value={addForm.password}
            onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">Role *</label>
          <select
            value={addForm.role}
            onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          >
            <option value="student">Student</option>
            <option value="club">Club Member</option>
          </select>
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddMember}
          className="md:col-span-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
        >
          Add User
        </button>
      </div>
    </div>
  </div>
)}

        {/* Search and Filter for Students View */}
        {view === "students" && (
          <div className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or PRN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Filter for Club Members */}
        {view === "club" && (
          <div className="mb-6 flex items-center space-x-3 animate-fadeIn">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-slate-800">All Positions</option>
              {positions.map(pos => (
                <option key={pos} value={pos} className="bg-slate-800">{pos}</option>
              ))}
            </select>
          </div>
        )}

        {/* Club Members Grid */}
        {view === "club" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubMembers.map((member, idx) => (
              <div
                key={member._id}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-105 animate-scaleIn"
                style={{ animationDelay: `${idx * 50}ms`, opacity: 0 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <UserCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">{member.position}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="p-2 bg-red-500/20 hover:bg-red-500 rounded-lg transition-all duration-300 group"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 group-hover:text-white" />
                  </button>
                </div>

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
                    <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                      {member.prn}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Students Table */}
        {view === "students" && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden animate-scaleIn">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-white/80 font-semibold text-sm">Student</th>
                    <th className="text-left p-4 text-white/80 font-semibold text-sm">PRN</th>
                    <th className="text-left p-4 text-white/80 font-semibold text-sm">Branch</th>
                    <th className="text-left p-4 text-white/80 font-semibold text-sm">Year</th>
                    <th className="text-left p-4 text-white/80 font-semibold text-sm">Events</th>
                    <th className="text-left p-4 text-white/80 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredStudents.map((student, idx) => (
                    <tr key={student._id} className="hover:bg-white/5 transition-all">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <UserCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{student.name}</p>
                            <p className="text-white/60 text-sm">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-white/70">{student.prn}</td>
                      <td className="p-4 text-white/70">{student.branch}</td>
                      <td className="p-4 text-white/70">{student.year}</td>
                      <td className="p-4">
                        <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                          {student.eventsAttended} events
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setPromoteForm({
                              position: "Member",
                              branch: student.branch,
                              year: student.year
                            });
                            setShowPromoteModal(true);
                          }}
                          className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-all transform hover:scale-105"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Promote</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Promote Modal */}
        {showPromoteModal && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 max-w-md w-full animate-scaleIn">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Promote to Club Member</h3>
                <button
                  onClick={() => {
                    setShowPromoteModal(false);
                    setSelectedStudent(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <p className="text-white/60 text-sm mb-2">Student Details:</p>
                <p className="text-white font-semibold text-lg">{selectedStudent.name}</p>
                <p className="text-white/70 text-sm">{selectedStudent.email}</p>
                <p className="text-white/60 text-sm">{selectedStudent.prn}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Position *</label>
                  <select
                    value={promoteForm.position}
                    onChange={(e) => setPromoteForm({ ...promoteForm, position: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  >
                    {positions.map(pos => (
                      <option key={pos} value={pos} className="bg-slate-800">{pos}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Branch (Optional)</label>
                  <input
                    type="text"
                    value={promoteForm.branch}
                    onChange={(e) => setPromoteForm({ ...promoteForm, branch: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder={selectedStudent.branch}
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Year (Optional)</label>
                  <select
                    value={promoteForm.year}
                    onChange={(e) => setPromoteForm({ ...promoteForm, year: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  >
                    <option value="" className="bg-slate-800">Keep Current ({selectedStudent.year})</option>
                    <option value="1" className="bg-slate-800">1st Year</option>
                    <option value="2" className="bg-slate-800">2nd Year</option>
                    <option value="3" className="bg-slate-800">3rd Year</option>
                    <option value="4" className="bg-slate-800">4th Year</option>
                  </select>
                </div>

                <button
                  onClick={handlePromote}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Promote to Club Member</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty States */}
        {view === "club" && filteredClubMembers.length === 0 && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center animate-fadeIn">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl mb-6">
                <Users className="w-12 h-12 text-white/70" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Club Members</h3>
              <p className="text-white/60 mb-6">Add members or promote students to build your team</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>Add First Member</span>
              </button>
            </div>
          </div>
        )}

        {view === "students" && filteredStudents.length === 0 && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center animate-fadeIn">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl mb-6">
                <Search className="w-12 h-12 text-white/70" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No Students Found</h3>
              <p className="text-white/60">Try adjusting your search query</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminMembers;