import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
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

// Simple Auth simulation
const isAuthenticated = true; // later replace with real auth check

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

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            isAuthenticated ? (
              <AdminLayout />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="profile" element={<AdminProfile />} />
          {/* Add more admin pages like events, analytics, etc. */}
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
