import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const userExists = existingUsers.find(user => user.email === email);

    if (userExists) {
      setErrorMessage('Account with this email already exists! Please login.');
      return;
    }

    const newUser = { name, email, password, role: 'Web Developer' };
    
    // Push new user to array and save
    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    setSuccessMessage('Account Created Successfully! Redirecting to login...');
    
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Get started with your free workspace account.</p>
        </div>

        {successMessage && (
          <div style={{ background: '#10b981', color: '#000', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontWeight: '600' }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{ background: '#ef4444', color: '#fff', padding: '10px', borderRadius: '6px', marginBottom: '20px', textAlign: 'center', fontWeight: '600' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input 
              type="text" 
              className="custom-input" 
              placeholder="Enter your full name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
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
          <button type="submit" className="btn btn-primary btn-md btn-full">Sign Up</button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  );
}