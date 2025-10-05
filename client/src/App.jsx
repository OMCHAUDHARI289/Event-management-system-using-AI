import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";
import AnimatedCursor from "./components/Cursor";

// Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMembers from "./pages/admin/Members";
import AdminEvents from "./pages/admin/Events";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminProfile from "./pages/admin/Profile";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/student/Dashboard";
import StudentAllEvents from "./pages/student/AllEvents";
import StudentMyEvents from "./pages/student/MyEvents";
import StudentLeaderboard from "./pages/student/Leaderboard";
import StudentNotifications from "./pages/student/Notifications";
import StudentProfile from "./pages/student/Profile";
import StudentFeedback from "./pages/student/Feedback";

// Simple Auth simulation
// Helper: decode JWT payload (simple, no external lib)
function getToken() {
  return localStorage.getItem('token');
}

function decodeTokenRole(token) {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // base64url -> base64
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // pad with '='
    while (base64.length % 4) base64 += '=';
    const decoded = JSON.parse(atob(base64));
    return decoded.role || null;
  } catch (e) {
    return null;
  }
}

// Route guard component
function RequireAuth({ children, allowedRoles = [] }) {
  const token = getToken();
  if (!token) return <Navigate to="/auth/login" replace />;
  const role = decodeTokenRole(token);
  if (!role) return <Navigate to="/auth/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
}

function App() {
  return (
  <>
    <AnimatedCursor />
    <Routes>
       
        {/* Auth Routes */}
        <Route path="/auth">
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* Student Routes (require student role) */}
        <Route path="/student/*" element={
          <RequireAuth allowedRoles={["student"]}>
            <StudentLayout />
          </RequireAuth>
        }>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="allevents" element={<StudentAllEvents />} />
          <Route path="myevents" element={<StudentMyEvents />} />
          <Route path="leaderboard" element={<StudentLeaderboard />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="feedback" element={<StudentFeedback />} />
        </Route>

        {/* Admin Routes (require admin or clubMember role) */}
        <Route path="/admin/*" element={
          <RequireAuth allowedRoles={["admin","clubMember"]}>
            <AdminLayout />
          </RequireAuth>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="profile" element={<AdminProfile />} />
        </Route>

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
