import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MeetingRoom from './pages/MeetingRoom';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/profile" element={<Profile />} />

        {/* Meeting room */}
        <Route path="/room/:roomId" element={<MeetingRoom />} />

        {/* Optional old meeting route */}
        <Route path="/meeting" element={<MeetingRoom />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}