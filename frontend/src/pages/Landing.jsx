import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/auth.css';

export default function Landing() {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div className="auth-header">
          <h2 style={{ color: 'var(--orange-primary)' }}>Design On Tech Workspace</h2>
          <p>Your ultimate platform for meetings, whiteboarding, and team collaboration.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link to="/login" className="btn btn-primary btn-md" style={{ textDecoration: 'none' }}>
            Login
          </Link>
          <Link to="/register" className="btn btn-outline btn-md" style={{ textDecoration: 'none' }}>
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}