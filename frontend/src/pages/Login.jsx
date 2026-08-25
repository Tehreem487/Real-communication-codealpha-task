import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Email ke hisaab se naam nikal lein ya default set karein
    const username = email.split('@')[0];
    const formattedName = username.charAt(0).toUpperCase() + username.slice(1);

    const userData = {
      name: formattedName,
      email: email,
      role: 'Web Developer'
    };

    // LocalStorage mein save karein taake Profile page par reflect ho
    localStorage.setItem('workspace_profile', JSON.stringify(userData));
    localStorage.setItem('userInfo', JSON.stringify(userData));

    setSuccessMessage('Login Successful! Redirecting...');
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Please enter your details to sign in.</p>
        </div>

        {successMessage && (
          <div style={{ background: '#10b981', color: '#000', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontWeight: '600' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input 
              type="email" 
              className="custom-input" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              className="custom-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-md btn-full">Sign In</button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  );
}