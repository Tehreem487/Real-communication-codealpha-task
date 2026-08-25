import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/auth.css';

export default function NotFound() {
  return (
    <div className="auth-container">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-header">
          <h1 style={{ fontSize: '4rem', color: 'var(--orange-primary)', marginBottom: '10px' }}>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you are looking for doesn't exist or has been moved.</p>
        </div>
        <Link to="/" className="btn btn-primary btn-md btn-full" style={{ textDecoration: 'none' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}