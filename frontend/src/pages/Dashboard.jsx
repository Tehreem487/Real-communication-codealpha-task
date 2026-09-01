import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { CreateRoomModal } from '../components/meeting/CreateRoomModal';
import { generateRoomCode } from '../utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();

  /* =========================
     USER
  ========================= */

  const [userName, setUserName] =
    useState('Tehreem');

  useEffect(() => {
    const savedUser =
      localStorage.getItem('workspace_profile') ||
      localStorage.getItem('userInfo') ||
      localStorage.getItem('user');

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);

        if (parsed?.name) {
          setUserName(parsed.name);
        }
      } catch (error) {
        console.error(
          'Error parsing user info:',
          error
        );
      }
    }
  }, []);


  /* =========================
     PROJECTS
  ========================= */

  const [projects, setProjects] = useState(() => {
    const savedProjects =
      localStorage.getItem(
        'workspace_projects'
      );

    if (savedProjects) {
      try {
        return JSON.parse(savedProjects);
      } catch (error) {
        console.error(
          'Error parsing projects:',
          error
        );
      }
    }

    return [
      {
        id: 1,
        name: 'Design On Tech Agency',
        category: 'Frontend Web',
        status: 'Active',
        date: 'Aug 2026',
      },
      {
        id: 2,
        name: 'Luxury E-Commerce App',
        category: 'Full Stack',
        status: 'In Progress',
        date: 'Aug 2026',
      },
      {
        id: 3,
        name: 'Taskora Dashboard',
        category: 'React UI',
        status: 'Completed',
        date: 'Aug 2026',
      },
    ];
  });


  /* =========================
     CREATE PROJECT MODAL
  ========================= */

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [newProjectName, setNewProjectName] =
    useState('');

  const [newProjectCategory, setNewProjectCategory] =
    useState('');


  /* =========================
     CREATE ROOM MODAL
  ========================= */

  const [isCreateRoomOpen, setIsCreateRoomOpen] =
    useState(false);


  /* =========================
     TEAM CHAT
  ========================= */

  const [isChannelModalOpen, setIsChannelModalOpen] =
    useState(false);

  const [unreadCount, setUnreadCount] =
    useState(12);

  const [channelMessages, setChannelMessages] =
    useState([
      {
        sender: 'Ali',
        text: 'Hey team, check out the latest component updates for the dashboard!',
        time: '12:40 PM',
      },
      {
        sender: 'Tehreem',
        text: 'Working on the responsive layout right now.',
        time: '12:45 PM',
      },
    ]);

  const [newMessage, setNewMessage] =
    useState('');


  /* =========================
     OPEN MEETING
  ========================= */

  const handleStartMeeting = () => {
    const roomId = generateRoomCode(6);

    navigate(`/room/${roomId}`, {
      state: {
        roomName: `Meeting Room ${roomId}`,
      },
    });
  };


  /* =========================
     JOIN MEETING
  ========================= */

  const handleJoinMeeting = (roomId) => {
    if (!roomId?.trim()) return;

    const cleanRoomId =
      roomId.trim().toUpperCase();

    navigate(`/room/${cleanRoomId}`);
  };


  /* =========================
     CREATE PROJECT
  ========================= */

  const handleCreateProject = (e) => {
    e.preventDefault();

    if (!newProjectName.trim()) {
      return;
    }

    const newProj = {
      id: Date.now(),
      name: newProjectName.trim(),
      category:
        newProjectCategory.trim() ||
        'General Web',
      status: 'Active',
      date: 'Just now',
    };

    const updatedProjects = [
      newProj,
      ...projects,
    ];

    setProjects(updatedProjects);

    localStorage.setItem(
      'workspace_projects',
      JSON.stringify(updatedProjects)
    );

    setNewProjectName('');
    setNewProjectCategory('');
    setIsModalOpen(false);
  };


  /* =========================
     TEAM CHAT
  ========================= */

  const handleOpenChannel = () => {
    setIsChannelModalOpen(true);
    setUnreadCount(0);
  };


  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    const message = {
      sender: `${userName} (You)`,
      text: newMessage.trim(),
      time: 'Just now',
    };

    setChannelMessages((prev) => [
      ...prev,
      message,
    ]);

    setNewMessage('');
  };


  /* =========================
     LOGOUT
  ========================= */

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('workspace_profile');

    navigate('/login', {
      replace: true,
    });
  };


  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        padding: '30px 40px',
        fontFamily:
          'system-ui, sans-serif',
        boxSizing: 'border-box',
      }}
    >

      {/* =========================
          NAVIGATION
      ========================= */}

      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: '35px',
          borderBottom:
            '1px solid #1f1f1f',
          paddingBottom: '20px',
          gap: '20px',
        }}
      >

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              background: '#ff6600',
              borderRadius: '50%',
              boxShadow:
                '0 0 10px #ff6600',
            }}
          />

          <h2
            style={{
              margin: 0,
              color: '#fff',
              fontSize: '1.4rem',
              fontWeight: '700',
            }}
          >
            Workspace Dashboard
          </h2>
        </div>


        <div
          style={{
            display: 'flex',
            gap: '12px',
          }}
        >

          <Link
            to="/profile"
            style={{
              color: '#fff',
              textDecoration: 'none',
              background: '#161616',
              padding: '8px 18px',
              borderRadius: '8px',
              border:
                '1px solid #262626',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}
          >
            👤 Profile
          </Link>


          <button
            onClick={handleLogout}
            style={{
              background: '#161616',
              color: '#ef4444',
              border:
                '1px solid #262626',
              padding: '8px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Logout
          </button>

        </div>

      </div>


      {/* =========================
          WELCOME
      ========================= */}

      <div
        style={{
          background:
            'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)',
          border:
            '1px solid #262626',
          padding: '30px 35px',
          borderRadius: '16px',
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          gap: '20px',
        }}
      >

        <div>

          <h1
            style={{
              margin:
                '0 0 8px 0',
              fontSize: '2rem',
              fontWeight: '700',
            }}
          >
            Welcome Back, {userName}! 👋
          </h1>

          <p
            style={{
              margin: 0,
              color: '#9ca3af',
              fontSize: '0.95rem',
            }}
          >
            Here is your comprehensive
            workspace overview and active
            projects control center.
          </p>

        </div>


        <button
          onClick={() =>
            setIsModalOpen(true)
          }
          style={{
            background: '#ff6600',
            color: '#000',
            border: 'none',
            padding:
              '12px 24px',
            borderRadius: '10px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          + New Project
        </button>

      </div>


      {/* =========================
          QUICK ACTIONS
      ========================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >

        {/* MEETING */}

        <div
          onClick={() =>
            setIsCreateRoomOpen(true)
          }
          style={cardStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor =
              '#ff6600';
            e.currentTarget.style.transform =
              'translateY(-3px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor =
              '#262626';
            e.currentTarget.style.transform =
              'translateY(0)';
          }}
        >

          <div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                marginBottom:
                  '12px',
              }}
            >

              <h3
                style={{
                  margin: 0,
                  color: '#fff',
                }}
              >
                Active Meetings
              </h3>

              <span
                style={{
                  background:
                    'rgba(16,185,129,.1)',
                  color: '#10b981',
                  padding:
                    '4px 10px',
                  borderRadius:
                    '20px',
                  fontSize:
                    '0.75rem',
                }}
              >
                Secure RTC
              </span>

            </div>

            <p
              style={{
                margin:
                  '0 0 20px 0',
                color: '#9ca3af',
                fontSize:
                  '0.85rem',
              }}
            >
              Join or start high-definition
              video conferences instantly.
            </p>

          </div>

          <span
            style={{
              color: '#ff6600',
              fontWeight: '700',
            }}
          >
            Enter Meeting →
          </span>

        </div>


        {/* WHITEBOARD */}

        <div
          onClick={() => {
            const roomId =
              generateRoomCode(6);

            navigate(
              `/room/${roomId}`,
              {
                state: {
                  roomName:
                    `Whiteboard Room ${roomId}`,
                  defaultTab:
                    'whiteboard',
                },
              }
            );
          }}
          style={cardStyle}
        >

          <div>

            <h3
              style={{
                margin:
                  '0 0 12px 0',
              }}
            >
              Whiteboard Canvas
            </h3>

            <p
              style={{
                color: '#9ca3af',
                fontSize:
                  '0.85rem',
                lineHeight: '1.4',
              }}
            >
              Collaborate and brainstorm
              interface wireframes in
              real-time.
            </p>

          </div>

          <span
            style={{
              color: '#ff6600',
              fontWeight: '700',
            }}
          >
            Open Canvas →
          </span>

        </div>


        {/* CHAT */}

        <div
          onClick={handleOpenChannel}
          style={cardStyle}
        >

          <div>

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
              }}
            >

              <h3
                style={{
                  margin:
                    '0 0 12px 0',
                }}
              >
                Team Channels
              </h3>

              <span
                style={{
                  color:
                    unreadCount > 0
                      ? '#ef4444'
                      : '#10b981',
                }}
              >
                {unreadCount > 0
                  ? `${unreadCount} Unread`
                  : 'All Read ✓'}
              </span>

            </div>

            <p
              style={{
                color: '#9ca3af',
                fontSize:
                  '0.85rem',
              }}
            >
              Stay connected with
              developers and share
              resource snippets.
            </p>

          </div>

          <span
            style={{
              color: '#ff6600',
              fontWeight: '700',
            }}
          >
            Open Channel →
          </span>

        </div>

      </div>


      {/* =========================
          PROJECTS
      ========================= */}

      <div
        style={{
          background: '#141414',
          border:
            '1px solid #262626',
          borderRadius: '16px',
          padding: '25px',
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            marginBottom: '20px',
          }}
        >

          <h3
            style={{
              margin: 0,
            }}
          >
            Your Workspace Projects
            ({projects.length})
          </h3>

          <span
            style={{
              color: '#9ca3af',
              fontSize:
                '0.85rem',
            }}
          >
            Manage and track progress
          </span>

        </div>


        <div
          style={{
            display: 'flex',
            flexDirection:
              'column',
            gap: '12px',
          }}
        >

          {projects.map((proj) => (

            <div
              key={proj.id}
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                background: '#1a1a1a',
                border:
                  '1px solid #222',
                padding:
                  '16px 20px',
                borderRadius:
                  '10px',
              }}
            >

              <div>

                <h4
                  style={{
                    margin:
                      '0 0 4px 0',
                  }}
                >
                  {proj.name}
                </h4>

                <span
                  style={{
                    color: '#9ca3af',
                    fontSize:
                      '0.8rem',
                  }}
                >
                  Category:
                  {' '}
                  {proj.category}
                  {' • '}
                  Created:
                  {' '}
                  {proj.date}
                </span>

              </div>

              <span
                style={{
                  color: '#ff6600',
                  background:
                    'rgba(255,102,0,.1)',
                  padding:
                    '6px 12px',
                  borderRadius:
                    '6px',
                }}
              >
                {proj.status}
              </span>

            </div>

          ))}

        </div>

      </div>


      {/* =========================
          PROJECT MODAL
      ========================= */}

      {isModalOpen && (

        <div style={overlayStyle}>

          <div style={modalStyle}>

            <h3>
              Create New Project
            </h3>

            <form
              onSubmit={
                handleCreateProject
              }
            >

              <input
                type="text"
                placeholder="Project Name"
                value={
                  newProjectName
                }
                onChange={(e) =>
                  setNewProjectName(
                    e.target.value
                  )
                }
                required
                style={
                  inputStyle
                }
              />

              <input
                type="text"
                placeholder="Category / Tech Stack"
                value={
                  newProjectCategory
                }
                onChange={(e) =>
                  setNewProjectCategory(
                    e.target.value
                  )
                }
                style={
                  inputStyle
                }
              />

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                }}
              >

                <button
                  type="submit"
                  style={orangeButton}
                >
                  Create
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  style={darkButton}
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =========================
          CHANNEL MODAL
      ========================= */}

      {isChannelModalOpen && (

        <div style={overlayStyle}>

          <div
            style={{
              ...modalStyle,
              height: '450px',
              display: 'flex',
              flexDirection:
                'column',
            }}
          >

            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
              }}
            >

              <h3>
                #frontend-dev
              </h3>

              <button
                onClick={() =>
                  setIsChannelModalOpen(
                    false
                  )
                }
                style={darkButton}
              >
                ✕
              </button>

            </div>


            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                margin:
                  '15px 0',
              }}
            >

              {channelMessages.map(
                (msg, index) => (

                  <div
                    key={index}
                    style={{
                      background:
                        '#1f1f1f',
                      padding:
                        '10px',
                      borderRadius:
                        '8px',
                      marginBottom:
                        '10px',
                    }}
                  >

                    <strong
                      style={{
                        color:
                          '#ff6600',
                      }}
                    >
                      {msg.sender}
                    </strong>

                    <p>
                      {msg.text}
                    </p>

                    <small
                      style={{
                        color:
                          '#6b7280',
                      }}
                    >
                      {msg.time}
                    </small>

                  </div>

                )
              )}

            </div>


            <form
              onSubmit={
                handleSendMessage
              }
              style={{
                display: 'flex',
                gap: '10px',
              }}
            >

              <input
                value={newMessage}
                onChange={(e) =>
                  setNewMessage(
                    e.target.value
                  )
                }
                placeholder="Write message..."
                style={{
                  ...inputStyle,
                  margin: 0,
                }}
              />

              <button
                type="submit"
                style={orangeButton}
              >
                Send
              </button>

            </form>

          </div>

        </div>

      )}


      {/* =========================
          CREATE ROOM MODAL
      ========================= */}

      {isCreateRoomOpen && (
        <CreateRoomModal
          onClose={() =>
            setIsCreateRoomOpen(false)
          }
          onCreate={(roomId) => {
            setIsCreateRoomOpen(false);

            const finalRoomId =
              roomId?.trim() ||
              generateRoomCode(6);

            navigate(
              `/room/${finalRoomId}`,
              {
                state: {
                  roomName:
                    `Meeting Room ${finalRoomId}`,
                  defaultTab:
                    'video',
                },
              }
            );
          }}
        />
      )}

    </div>
  );
}


/* =========================
   STYLES
========================= */

const cardStyle = {
  background: '#141414',
  border: '1px solid #262626',
  padding: '24px',
  borderRadius: '14px',
  cursor: 'pointer',
  transition:
    'all 0.2s ease',
  minHeight: '150px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent:
    'space-between',
};

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background:
    'rgba(0,0,0,.75)',
  backdropFilter:
    'blur(5px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent:
    'center',
  zIndex: 1000,
  padding: '20px',
};

const modalStyle = {
  background: '#161616',
  border: '1px solid #333',
  padding: '25px',
  borderRadius: '16px',
  width: '100%',
  maxWidth: '500px',
  boxSizing: 'border-box',
};

const inputStyle = {
  width: '100%',
  background: '#222',
  border: '1px solid #333',
  color: '#fff',
  padding: '11px 14px',
  borderRadius: '8px',
  marginBottom: '12px',
  boxSizing: 'border-box',
  outline: 'none',
};

const orangeButton = {
  flex: 1,
  background: '#ff6600',
  color: '#000',
  border: 'none',
  padding: '11px',
  borderRadius: '8px',
  fontWeight: '700',
  cursor: 'pointer',
};

const darkButton = {
  flex: 1,
  background: '#222',
  color: '#fff',
  border: '1px solid #333',
  padding: '11px',
  borderRadius: '8px',
  cursor: 'pointer',
};