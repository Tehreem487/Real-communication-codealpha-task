import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // LocalStorage se projects load karein
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('workspace_projects');
    if (savedProjects) {
      try {
        return JSON.parse(savedProjects);
      } catch (e) {
        console.error("Error parsing saved projects", e);
      }
    }
    return [
      { id: 1, name: 'Design On Tech Agency', category: 'Frontend Web', status: 'Active', date: 'Aug 2026' },
      { id: 2, name: 'Luxury E-Commerce App', category: 'Full Stack', status: 'In Progress', date: 'Aug 2026' },
      { id: 3, name: 'Taskora Dashboard', category: 'React UI', status: 'Completed', date: 'Aug 2026' }
    ];
  });

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('');

  // Channel Modal & Unread Count State
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(12);
  const [channelMessages, setChannelMessages] = useState([
    { sender: 'Ali', text: 'Hey team, check out the latest component updates for the dashboard!', time: '12:40 PM' },
    { sender: 'Tehreem', text: 'Working on the responsive layout right now.', time: '12:45 PM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleOpenChannel = () => {
    setIsChannelModalOpen(true);
    setUnreadCount(0); // Modal khulte hi unread count zero ho jayega
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj = {
      id: Date.now(),
      name: newProjectName,
      category: newProjectCategory || 'General Web',
      status: 'Active',
      date: 'Just now'
    };

    const updatedProjects = [newProj, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('workspace_projects', JSON.stringify(updatedProjects));

    setNewProjectName('');
    setNewProjectCategory('');
    setIsModalOpen(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChannelMessages([...channelMessages, { sender: 'Tehreem (You)', text: newMessage, time: 'Just now' }]);
    setNewMessage('');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '30px 40px', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
      
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px', borderBottom: '1px solid #1f1f1f', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '12px', height: '12px', background: '#ff6600', borderRadius: '50%', boxShadow: '0 0 10px #ff6600' }}></div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0.5px' }}>Workspace Dashboard</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/profile" style={{ color: '#fff', textDecoration: 'none', background: '#161616', padding: '8px 18px', borderRadius: '8px', border: '1px solid #262626', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
            👤 Profile
          </Link>
          <button 
            onClick={() => navigate('/login')} 
            style={{ background: '#161616', color: '#ef4444', border: '1px solid #262626', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', transition: '0.2s' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)', border: '1px solid #262626', padding: '30px 35px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: '700' }}>Welcome Back, Tehreem! 👋</h1>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '0.95rem' }}>Here is your comprehensive workspace overview and active projects control center.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ background: '#ff6600', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(255, 102, 0, 0.3)', transition: '0.2s' }}
        >
          + New Project
        </button>
      </div>

      {/* Quick Action Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        
        {/* 1. Active Meetings Card (Passes state to open Video Tab) */}
        <div 
          onClick={() => navigate('/meeting', { state: { defaultTab: 'video' } })}
          style={{ background: '#141414', border: '1px solid #262626', padding: '24px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff6600'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#262626'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Active Meetings</h3>
              <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)' }}>Secure RTC</span>
            </div>
            <p style={{ margin: '0 0 20px 0', color: '#9ca3af', fontSize: '0.85rem', lineHeight: '1.4' }}>Join or schedule high-definition video conferences instantly.</p>
          </div>
          <span style={{ color: '#ff6600', fontWeight: '700', fontSize: '0.85rem' }}>Click to enter room &rarr;</span>
        </div>

        {/* 2. Whiteboard Workspace Card (Passes state to open Whiteboard Tab) */}
        <div 
          onClick={() => navigate('/meeting', { state: { defaultTab: 'whiteboard' } })}
          style={{ background: '#141414', border: '1px solid #262626', padding: '24px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff6600'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#262626'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Whiteboard Canvas</h3>
              <span style={{ background: 'rgba(255, 102, 0, 0.1)', color: '#ff6600', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid rgba(255, 102, 0, 0.2)' }}>3 Active</span>
            </div>
            <p style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '0.85rem', lineHeight: '1.4' }}>Collaborate and brainstorm interface wireframes in real-time.</p>
            <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Synced across devices</span>
          </div>
          <div style={{ marginTop: '15px' }}>
            <span style={{ color: '#ff6600', fontWeight: '700', fontSize: '0.85rem' }}>Open Canvas &rarr;</span>
          </div>
        </div>

        {/* 3. Team Chat Card */}
        <div 
          onClick={handleOpenChannel}
          style={{ background: '#141414', border: '1px solid #262626', padding: '24px', borderRadius: '14px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#ff6600'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#262626'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>Team Channels</h3>
              <span style={{ 
                background: unreadCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                color: unreadCount > 0 ? '#ef4444' : '#10b981', 
                padding: '4px 10px', 
                borderRadius: '20px', 
                fontSize: '0.75rem', 
                fontWeight: '600', 
                border: `1px solid ${unreadCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` 
              }}>
                {unreadCount > 0 ? `${unreadCount} Unread` : 'All Read ✓'}
              </span>
            </div>
            <p style={{ margin: '0 0 10px 0', color: '#9ca3af', fontSize: '0.85rem', lineHeight: '1.4' }}>Stay connected with developers and share resource snippets.</p>
            <span style={{ color: '#ff6600', fontSize: '0.8rem', fontWeight: '600' }}>Channel: #frontend-dev</span>
          </div>
          <div style={{ marginTop: '15px' }}>
            <span style={{ color: '#ff6600', fontWeight: '700', fontSize: '0.85rem' }}>Open Channel &rarr;</span>
          </div>
        </div>

      </div>

      {/* Projects Section */}
      <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: '16px', padding: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>Your Workspace Projects ({projects.length})</h3>
          <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Manage and track progress</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {projects.map((proj) => (
            <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', border: '1px solid #222', padding: '16px 20px', borderRadius: '10px' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#fff' }}>{proj.name}</h4>
                <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Category: {proj.category} • Created: {proj.date}</span>
              </div>
              <span style={{ background: 'rgba(255, 102, 0, 0.1)', color: '#ff6600', border: '1px solid rgba(255, 102, 0, 0.2)', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
                {proj.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Popup for Creating New Project */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#161616', border: '1px solid #333', padding: '30px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>Create New Project</h3>
            <p style={{ margin: '0 0 20px 0', color: '#9ca3af', fontSize: '0.85rem' }}>Add a new repository or workspace card.</p>
            
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Project Name</label>
                <input 
                  type="text" 
                  placeholder="e.g., AI Chat Module" 
                  value={newProjectName} 
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  style={{ width: '100%', background: '#222', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>Category / Tech Stack</label>
                <input 
                  type="text" 
                  placeholder="e.g., React & Node.js" 
                  value={newProjectCategory} 
                  onChange={(e) => setNewProjectCategory(e.target.value)}
                  style={{ width: '100%', background: '#222', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#ff6600', color: '#000', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                  Create
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, background: '#222', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Channels Modal Popup */}
      {isChannelModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#161616', border: '1px solid #333', padding: '25px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', height: '450px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #262626', paddingBottom: '12px', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 2px 0', color: '#fff', fontSize: '1.1rem' }}>#frontend-dev Channel</h3>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Active developers collaboration stream</span>
              </div>
              <button onClick={() => setIsChannelModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Chat Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px', paddingRight: '5px' }}>
              {channelMessages.map((msg, index) => (
                <div key={index} style={{ background: '#1f1f1f', padding: '10px 14px', borderRadius: '8px', border: '1px solid #2a2a2a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#ff6600', fontSize: '0.8rem', fontWeight: '700' }}>{msg.sender}</span>
                    <span style={{ color: '#6b7280', fontSize: '0.7rem' }}>{msg.time}</span>
                  </div>
                  <p style={{ margin: 0, color: '#e5e7eb', fontSize: '0.85rem' }}>{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Send Message Form */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Share resource snippet or message..." 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ flex: 1, background: '#222', border: '1px solid #333', color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', outline: 'none' }}
              />
              <button type="submit" style={{ background: '#ff6600', color: '#000', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                Send
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}