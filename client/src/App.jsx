import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import StudentLayout from "./layouts/StudentLayout";
import ClubLayout from "./layouts/ClubLayout";
import AnimatedCursor from "./components/Cursor";

// Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminMembers from "./pages/admin/Members";
import AdminEvents from "./pages/admin/Events";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminProfile from "./pages/admin/Profile";
import AdminEmail from "./pages/admin/Email";
import NotFound from "./pages/common/NotFound";
import Login from "./pages/common/Login";
import Register from "./pages/common/Register";

import StudentDashboard from "./pages/student/Dashboard";
import StudentAllEvents from "./pages/student/AllEvents";
import StudentRegister from "./components/student/RegisterEvent";
import StudentMyEvents from "./pages/student/MyEvents";
import StudentLeaderboard from "./pages/student/Leaderboard";
import StudentNotifications from "./pages/student/Notifications";
import StudentProfile from "./pages/student/Profile";
import StudentFeedback from "./pages/student/Feedback";

import ClubDashboard from "./pages/club/Dashboard";


// Route guard component (role-based, no JWT)
function RequireAuth({ children, allowedRoles = [] }) {
  const role = localStorage.getItem("role"); // directly store role on login
  if (!role) return <Navigate to="/auth/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to proper dashboard based on role
    if (role === "student") return <Navigate to="/student/dashboard" replace />;
    if (role === "clubMember") return <Navigate to="/club/dashboard" replace />;
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

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <RequireAuth allowedRoles={["student"]}>
              <StudentLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="allevents" element={<StudentAllEvents />} />
          <Route path="register/:id" element={<StudentRegister />} />
          <Route path="myevents" element={<StudentMyEvents />} />
          <Route path="leaderboard" element={<StudentLeaderboard />} />
          <Route path="notifications" element={<StudentNotifications />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="feedback" element={<StudentFeedback />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <RequireAuth allowedRoles={["admin"]}>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="email" element={<AdminEmail />} />
        </Route>

        {/* Club Member Routes */}
        <Route
          path="/club/*"
          element={
            <RequireAuth allowedRoles={["clubMember"]}>
              <AdminLayout /> {/* can reuse AdminLayout for UI consistency */}
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/club/dashboard" replace />} />
          <Route path="dashboard" element={<ClubDashboard/>}/>
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
