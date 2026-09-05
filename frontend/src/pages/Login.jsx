import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  /*
   * -----------------------------------------
   * CHECK EXISTING LOGIN SESSION
   * -----------------------------------------
   *
   * Agar user already login hai aur page
   * dobara open/refresh karta hai to login
   * page par dobara nahi rukega.
   */
  useEffect(() => {
    const savedUser =
      localStorage.getItem('userInfo');

    const isLoggedIn =
      localStorage.getItem('isLoggedIn');

    if (savedUser && isLoggedIn === 'true') {
      navigate('/dashboard', {
        replace: true,
      });
    }
  }, [navigate]);

  /*
   * -----------------------------------------
   * LOGIN
   * -----------------------------------------
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    /*
     * Get registered users
     */
    let existingUsers = [];

    try {
      existingUsers =
        JSON.parse(
          localStorage.getItem(
            'registeredUsers'
          )
        ) || [];
    } catch {
      existingUsers = [];
    }

    /*
     * Find matching user
     */
    const matchedUser =
      existingUsers.find(
        (user) =>
          user.email?.toLowerCase() ===
            email.trim().toLowerCase() &&
          user.password === password
      );

    if (!matchedUser) {
      setErrorMessage(
        'Invalid email or password, or account does not exist! Please register first.'
      );

      return;
    }

    /*
     * -----------------------------------------
     * SAVE PERMANENT LOGIN SESSION
     * -----------------------------------------
     */

    localStorage.setItem(
      'workspace_profile',
      JSON.stringify(matchedUser)
    );

    localStorage.setItem(
      'userInfo',
      JSON.stringify(matchedUser)
    );

    /*
     * Main login flag
     */
    localStorage.setItem(
      'isLoggedIn',
      'true'
    );

    /*
     * Compatibility with other components
     */
    localStorage.setItem(
      'userEmail',
      matchedUser.email || ''
    );

    localStorage.setItem(
      'userName',
      matchedUser.name ||
        matchedUser.username ||
        'User'
    );

    /*
     * -----------------------------------------
     * TOKEN
     * -----------------------------------------
     *
     * Tumhara current authentication
     * localStorage based hai, isliye backend
     * token ke baghair bhi session refresh
     * ke baad survive karega.
     *
     * AuthContext agar token check karta hai
     * to ek local session marker bhi rakh dete
     * hain.
     */
    localStorage.setItem(
      'token',
      'local-session'
    );

    setSuccessMessage(
      'Login Successful! Redirecting...'
    );

    /*
     * Dashboard
     */
    setTimeout(() => {
      navigate('/dashboard', {
        replace: true,
      });
    }, 800);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-header">
          <h2>Welcome Back</h2>

          <p>
            Please enter your details to sign in.
          </p>
        </div>

        {successMessage && (
          <div
            style={{
              background: '#10b981',
              color: '#000',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              background: '#ef4444',
              color: '#fff',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: '600',
            }}
          >
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >
          <div className="input-group">
            <label className="input-label">
              Email Address
            </label>

            <input
              type="email"
              className="custom-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">
              Password
            </label>

            <input
              type="password"
              className="custom-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-md btn-full"
          >
            Sign In
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="auth-link"
          >
            Register
          </Link>
        </div>

      </div>
    </div>
  );
}