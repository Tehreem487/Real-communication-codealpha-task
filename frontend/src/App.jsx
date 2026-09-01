import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import MeetingRoom from './pages/MeetingRoom';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>

        {/* HOME */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* AUTH */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* PROFILE */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* MEETING ENTRY */}
        <Route
          path="/meeting"
          element={<MeetingRoom />}
        />

        {/* ACTUAL SHAREABLE ROOM */}
        <Route
          path="/room/:roomId"
          element={<MeetingRoom />}
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </Router>
  );
}