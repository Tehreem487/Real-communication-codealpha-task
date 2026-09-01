import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
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

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* Meeting page */}
        <Route
          path="/meeting"
          element={<MeetingRoom />}
        />

        {/* Shared meeting room */}
        <Route
          path="/room/:roomId"
          element={<MeetingRoom />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </Router>
  );
}