import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  // LocalStorage se profile data load karein ya default use karein
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('workspace_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: 'Tehreem',
      email: 'tehreem@example.com',
      role: 'Web Developer'
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);
  const [successMsg, setSuccessMsg] = useState('');

  // Change Password Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    const updated = { name, email, role };
    setProfile(updated);
    localStorage.setItem('workspace_profile', JSON.stringify(updated));
    setIsEditing(false);
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    
    // Save success simulation
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMsg('Password changed successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '30px 40px', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid #1f1f1f', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', background: '#ff6600', borderRadius: '50%' }}></div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0.5px' }}>User Profile & Settings</h2>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{ background: '#161616', color: '#fff', border: '1px solid #262626', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500' }}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '12px 20px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '500' }}>
          {successMsg}
        </div>
      )}

      {/* Main Profile Card */}
      <div style={{ background: 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)', border: '1px solid #262626', borderRadius: '16px', padding: '30px 35px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '75px', height: '75px', background: 'linear-gradient(135deg, #ff6600 0%, #cc5200 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#000', boxShadow: '0 4px 15px rgba(255, 102, 0, 0.3)' }}>
              {profile.name.charAt(0)}
            </div>
            <div>
              <h1 style={{ margin: '0 0 6px 0', fontSize: '1.8rem', fontWeight: '700', color: '#fff' }}>{profile.name}</h1>
              <p style={{ margin: '0 0 4px 0', color: '#9ca3af', fontSize: '0.95rem' }}>{profile.email}</p>
              <span style={{ display: 'inline-block', background: 'rgba(255, 102, 0, 0.1)', color: '#ff6600', border: '1px solid rgba(255, 102, 0, 0.2)', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '600' }}>
                {profile.role}
              </span>
            </div>
          </div>

          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              style={{ background: '#ff6600', color: '#000', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(255, 102, 0, 0.25)', transition: '0.2s' }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSave} style={{ marginTop: '30px', borderTop: '1px solid #262626', paddingTop: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Edit Profile Information</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Full Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  style={{ width: '100%', background: '#222', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  style={{ width: '100%', background: '#222', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Role / Title</label>
                <input 
                  type="text" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  required 
                  style={{ width: '100%', background: '#222', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="submit" style={{ background: '#ff6600', color: '#000', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>
                Save Changes
              </button>
              <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#222', color: '#fff', border: '1px solid #333', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Settings Section */}
      <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: '16px', padding: '25px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight: '600', color: '#fff' }}>Account Settings</h3>
        <p style={{ margin: '0 0 20px 0', color: '#9ca3af', fontSize: '0.9rem' }}>Update your personal information, email address, and security preferences.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', border: '1px solid #222', padding: '16px 20px', borderRadius: '10px' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#fff' }}>Password & Security</h4>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Last changed 3 months ago</span>
            </div>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              style={{ background: '#ff6600', color: '#000', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700', boxShadow: '0 4px 12px rgba(255, 102, 0, 0.25)' }}
            >
              Change Password
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', border: '1px solid #222', padding: '16px 20px', borderRadius: '10px' }}>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#fff' }}>Two-Factor Authentication</h4>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Secure your account with 2FA verification</span>
            </div>
            <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
              Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Modal Popup */}
      {isPasswordModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#161616', border: '1px solid #333', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.2rem' }}>Change Password</h3>
            <p style={{ margin: '0 0 20px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Please enter your current password and choose a new one.</p>
            
            <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Current Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={{ width: '100%', background: '#222', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={{ width: '100%', background: '#222', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ width: '100%', background: '#222', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#ff6600', color: '#000', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                  Update Password
                </button>
                <button type="button" onClick={() => setIsPasswordModalOpen(false)} style={{ flex: 1, background: '#222', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}