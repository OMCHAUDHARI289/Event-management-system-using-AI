import { useState, useEffect } from "react";
import {
  Users, Plus, X, Mail, Phone, BookOpen, Calendar, Trash2, UserCircle,
  Shield, Search, Filter, CheckCircle
} from "lucide-react";
import {
  getClubMembers,
  getStudents,
  addMember,
  promoteStudent,
  demoteClubMember,
  deleteClubMember,
  deleteStudent
} from '../../services/adminService';
import DeletePopup from "../common/ConfirmModel.jsx";
import { useToast } from "../../pages/common/Toast";  

function AdminMembers() {
  const [view, setView] = useState("club");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const { addToast } = useToast();
  const [clubMembers, setClubMembers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, type: "", name: "" });
  const [demotePopupOpen, setDemotePopupOpen] = useState(false);
  const [demoteTarget, setDemoteTarget] = useState(null);

  const [promoteForm, setPromoteForm] = useState({ position: "Member" });

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "clubMember|Member"
  });

  const roles = [
    { value: "student", label: "Student" },
    { value: "clubMember|Member", label: "Club Member" },
    { value: "clubMember|Volunteer", label: "Volunteer" }
  ];
  
  const positions = ["Member", "Volunteer"];

  const getId = (itemOrId) => {
    if (!itemOrId) return null;
    if (typeof itemOrId === "string" || typeof itemOrId === "number") return String(itemOrId);
    const id = itemOrId._id ?? itemOrId.id;
    return id ? String(id) : null;
  };

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('Fetching club members...');
      const members = await getClubMembers(); // already an array
      console.log('Club members response:', members);
      setClubMembers(members);

      const students = await getStudents();
      setStudents(students || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      addToast('Error fetching members or students', 'error');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);


  const handleAddMember = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) return;
    try {
      // Parse role and position
      const [role, position] = addForm.role.includes('|') 
        ? addForm.role.split('|') 
        : [addForm.role, undefined];

      const newUser = await addMember({
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
        role: role,
        position: position
      });

      const created = newUser.user || newUser;

      // Refresh data from server
      const membersRes = await getClubMembers();
      setClubMembers(membersRes.members || []);

      const studentsRes = await getStudents();
      setStudents(studentsRes.students || studentsRes || []);

      setAddForm({ name: "", email: "", password: "", role: "clubMember|Member" });
      setShowAddForm(false);
      addToast(`${created.name} added successfully!`, 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to add user';
      console.error("Error adding user:", msg);
      addToast(msg, 'error');
    }
  };

  const handlePromote = async () => {
    if (!selectedStudent) return;
    const id = getId(selectedStudent);
    if (!id) {
      console.error("Promote attempted with missing id", selectedStudent);
      addToast("Cannot promote: missing student id.", "error");
      return;
    }
    try {
      const promoted = await promoteStudent(id, {
        position: promoteForm.position
      });
      const newMember = promoted.user || promoted;
      setClubMembers(prev => [...prev, newMember]);
      setStudents(prev => prev.filter(s => getId(s) !== id));
      setShowPromoteModal(false);
      setSelectedStudent(null);
      addToast(`${newMember.name} promoted to ${promoteForm.position} successfully!`, 'success');
      setPromoteForm({ position: "Member" });
    } catch (err) {
      console.error("Error promoting student:", err);
      addToast('Failed to promote student', 'error');
    }
  };

  const handleDemote = async (member) => {
    const id = getId(member);
    if (!id) {
      addToast("Cannot demote: missing member ID.", "error");
      return;
    }
    try {
      const demotedStudent = await demoteClubMember(id);
      setClubMembers(prev => prev.filter(m => getId(m) !== id));
      setStudents(prev => [...prev, demotedStudent]);
      addToast(`${demotedStudent.name} demoted to student successfully!`, 'success');
    } catch (err) {
      console.error("Failed to demote member:", err);
      addToast("Failed to demote member.", "error");
    }
  };

  const handleDemoteConfirmed = async () => {
    if (!demoteTarget) return;
    await handleDemote(demoteTarget);
    setDemotePopupOpen(false);
    setDemoteTarget(null);
  };

  const openDeletePopup = (itemOrId, type, name) => {
    const id = getId(itemOrId);
    if (!id) {
      addToast("Cannot delete: missing item id.", "error");
      return;
    }
    setDeleteTarget({ id, type, name });
    setDeletePopupOpen(true);
    addToast(`${deleteTarget.name} deleted successfully!`, 'success');
  };

  const handleDeleteConfirmed = async () => {
    const { id, type } = deleteTarget;
    if (!id) return;

    try {
      if (type === "club") {
        await deleteClubMember(id);
        setClubMembers(prev => prev.filter(m => getId(m) !== id));
      } else if (type === "student") {
        await deleteStudent(id);
        setStudents(prev => prev.filter(s => getId(s) !== id));
      }
    } catch (err) {
      console.error("Error deleting member:", err);
      addToast("Failed to delete user", "error");
    } finally {
      setDeletePopupOpen(false);
      setDeleteTarget({ id: null, type: "", name: "" });
    }
  };

  const filteredStudents = students.filter(student =>
    (String(student.name || "")).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (String(student.email || "")).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (String(student.prn || "")).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClubMembers = clubMembers
  .filter(member => {
    const position = (member.position || 'Member').toLowerCase();
    return filterRole === 'all' || position === filterRole.toLowerCase();
  })
  .filter(member => {
    return member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           member.email.toLowerCase().includes(searchQuery.toLowerCase());
  });


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(-20px) translateX(10px);} }
        @keyframes float-delayed { 0%,100%{transform:translateY(0) translateX(0)} 50%{transform:translateY(20px) translateX(-10px);} }
        .animate-float{animation:float 6s ease-in-out infinite}
        .animate-float-delayed{animation:float-delayed 8s ease-in-out infinite}
        .animate-fadeIn{animation:fadeIn 0.28s ease-out forwards}
        .animate-slideDown{animation:slideDown 0.36s ease-out forwards}
        .animate-scaleIn{animation:scaleIn 0.28s ease-out forwards}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:none}}@keyframes scaleIn{from{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}
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
            <button onClick={() => setShowAddForm(prev => !prev)} className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{showAddForm ? 'Cancel' : 'Add User'}</span>
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex space-x-3 mb-8 animate-fadeIn">
          <button onClick={() => setView("club")} className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${view === "club" ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'}`}>
            <Shield className="w-4 h-4" />
            <span>Club Members</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{clubMembers.length}</span>
          </button>

          <button onClick={() => setView("students")} className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${view === "students" ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'}`}>
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
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Full Name *</label>
                  <input type="text" placeholder="John Doe" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Email *</label>
                  <input type="email" placeholder="john@college.edu" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Password *</label>
                  <input type="password" placeholder="********" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">Role *</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  >
                    {roles.map(r => (
                      <option key={r.value} value={r.value} className="bg-slate-800">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button onClick={handleAddMember} className="md:col-span-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  Add User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search (students) */}
        {view === "students" && (
          <div className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input type="text" placeholder="Search students by name, email, or PRN..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
            </div>
          </div>
        )}

        {/* Filter (club) */}
        {view === "club" && (
          <div className="mb-6 flex items-center space-x-3 animate-fadeIn">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all" className="bg-slate-800">All Positions</option>
              <option value="member" className="bg-slate-800">Member</option>
              <option value="volunteer" className="bg-slate-800">Volunteer</option>
            </select>
          </div>
        )}

        {/* Club Members Grid */}
        {view === "club" && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              </div>
            ) : filteredClubMembers.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">No club members found</p>
                <p className="text-white/40 text-sm mt-2">Add members or adjust your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubMembers.map((member, idx) => {
              const key = getId(member) ?? `club-${idx}-${(member.email||member.name||'').replace(/\s+/g,'-')}`;
              const memberId = getId(member);
              return (
                <div
                  key={key}
                  className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 animate-scaleIn"
                  style={{ animationDelay: `${idx * 40}ms`, opacity: 0 }}
                >
                  {/* Delete button */}
                  <button
                    onClick={() => openDeletePopup(member, "club", member.name)}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-lg z-10 ${memberId ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-white/5 cursor-not-allowed opacity-50'} flex items-center justify-center border border-red-500/10 transition-colors`}
                    aria-label={`Delete ${member.name}`}
                    disabled={!memberId}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>

                  {/* Member Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <UserCircle className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                        {member.position || 'Member'}
                      </span>
                    </div>
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

                    {member.branch && (
                      <div className="flex items-center space-x-2 text-white/70">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{member.branch}</span>
                      </div>
                    )}

                    {(member.year || member.prn) && (
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        {member.year && (
                          <div className="flex items-center space-x-2 text-white/70">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Year {member.year}</span>
                          </div>
                        )}
                        {member.prn && (
                          <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">{member.prn}</span>
                        )}
                      </div>
                    )}

                    {/* Demote button */}
                    <button
                      onClick={() => { setDemoteTarget(member); setDemotePopupOpen(true); }}
                      className="w-full flex items-center justify-center space-x-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 font-semibold px-4 py-2 rounded-lg mt-3 transition-all transform hover:scale-105"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Demote</span>
                    </button>
                  </div>
                </div>
              );
            })}
              </div>
            )}
          </>
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
                    <th className="text-left p-4 text-white/80 font-semibold text-sm">Phone</th>
                    <th className="text-left p-4 text-white/80 font-semibold text-sm">Events</th>
                    <th className="text-left p-4 text-white/80 font-semibold text-sm">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredStudents.map((student, idx) => {
                    const key = getId(student) ?? `student-${idx}-${(student.prn||student.email||student.name||'').toString().replace(/\s+/g,'-')}`;
                    const studentId = getId(student);
                    return (
                      <tr key={key} className="hover:bg-white/5 transition-all">
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
                        <td className="p-4 text-white/70">{student.branch || student.department}</td>
                        <td className="p-4 text-white/70">{student.phone}</td>
                        <td className="p-4">
                          <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                            {student.eventsAttended ?? 0} events
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <button onClick={() => { setSelectedStudent(student); setPromoteForm({ position: "Member" }); setShowPromoteModal(true); }} className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                              <Shield className="w-4 h-4" />
                              <span>Promote</span>
                            </button>
                            
                            <button
                              onClick={() => openDeletePopup(student, "student", student.name)}
                              className={`w-10 h-10 rounded-lg ${studentId ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-white/5 cursor-not-allowed opacity-50'} flex items-center justify-center border border-red-500/10 transition-colors`}
                              aria-label={`Delete ${student.name}`}
                              disabled={!studentId}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
                <button onClick={() => { setShowPromoteModal(false); setSelectedStudent(null); }} className="p-2 hover:bg-white/10 rounded-lg transition-all">
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
                  <select value={promoteForm.position} onChange={(e) => setPromoteForm({ ...promoteForm, position: e.target.value })} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all">
                    {positions.map(pos => <option key={pos} value={pos} className="bg-slate-800">{pos}</option>)}
                  </select>
                </div>

                <div className="flex gap-4 mt-4">
                  <button onClick={handlePromote} className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <CheckCircle className="w-5 h-5" />
                    <span>Promote</span>
                  </button>
                  <button onClick={() => { setShowPromoteModal(false); setSelectedStudent(null); }} className="flex-1 flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all">
                    <X className="w-5 h-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Popups */}
        <DeletePopup
          isOpen={deletePopupOpen}
          onClose={() => setDeletePopupOpen(false)}
          onConfirm={handleDeleteConfirmed}
          itemName={deleteTarget.name || 'item'}
        />
        <DeletePopup
          isOpen={demotePopupOpen}
          onClose={() => setDemotePopupOpen(false)}
          onConfirm={handleDemoteConfirmed}
          itemName={demoteTarget?.name || "member"}
          confirmText="Demote"
        />
      </div>
    </div>
  );
}

export default AdminMembers;