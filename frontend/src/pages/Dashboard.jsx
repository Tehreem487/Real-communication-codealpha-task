import React, {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
} from 'react-router-dom';

import CreateRoomModal from '../components/meeting/CreateRoomModal';

export default function Dashboard() {
  const navigate = useNavigate();

  const [userName, setUserName] =
    useState('Tehreem');

  const [projects, setProjects] =
    useState(() => {
      const saved =
        localStorage.getItem(
          'workspace_projects'
        );

      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.error(
            'Projects parse error:',
            error
          );
        }
      }

      return [
        {
          id: 1,
          name:
            'Design On Tech Agency',
          category:
            'Frontend Web',
          status: 'Active',
          date: 'Aug 2026',
        },
        {
          id: 2,
          name:
            'Luxury E-Commerce App',
          category:
            'Full Stack',
          status: 'In Progress',
          date: 'Aug 2026',
        },
        {
          id: 3,
          name:
            'Taskora Dashboard',
          category: 'React UI',
          status: 'Completed',
          date: 'Aug 2026',
        },
      ];
    });

  const [
    isProjectModalOpen,
    setIsProjectModalOpen,
  ] = useState(false);

  const [
    isRoomModalOpen,
    setIsRoomModalOpen,
  ] = useState(false);

  const [
    isChannelModalOpen,
    setIsChannelModalOpen,
  ] = useState(false);

  const [
    newProjectName,
    setNewProjectName,
  ] = useState('');

  const [
    newProjectCategory,
    setNewProjectCategory,
  ] = useState('');

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(12);

  const [
    channelMessages,
    setChannelMessages,
  ] = useState([
    {
      sender: 'Ali',
      text:
        'Hey team, check out the latest component updates for the dashboard!',
      time: '12:40 PM',
    },
    {
      sender: 'Tehreem',
      text:
        'Working on the responsive layout right now.',
      time: '12:45 PM',
    },
  ]);

  const [
    newMessage,
    setNewMessage,
  ] = useState('');

  /* =========================
     USER
  ========================= */

  useEffect(() => {
    const savedUser =
      localStorage.getItem(
        'workspace_profile'
      ) ||
      localStorage.getItem(
        'userInfo'
      );

    if (!savedUser) return;

    try {
      const parsed =
        JSON.parse(savedUser);

      if (parsed?.name) {
        setUserName(
          parsed.name
        );
      }
    } catch (error) {
      console.error(
        'User parsing error:',
        error
      );
    }
  }, []);

  /* =========================
     CREATE PROJECT
  ========================= */

  const handleCreateProject = (
    e
  ) => {
    e.preventDefault();

    if (!newProjectName.trim()) {
      return;
    }

    const newProject = {
      id: Date.now(),
      name:
        newProjectName.trim(),
      category:
        newProjectCategory.trim() ||
        'General Web',
      status: 'Active',
      date: 'Just now',
    };

    const updated = [
      newProject,
      ...projects,
    ];

    setProjects(updated);

    localStorage.setItem(
      'workspace_projects',
      JSON.stringify(updated)
    );

    setNewProjectName('');
    setNewProjectCategory('');
    setIsProjectModalOpen(
      false
    );
  };

  /* =========================
     CHANNEL
  ========================= */

  const handleOpenChannel = () => {
    setIsChannelModalOpen(true);
    setUnreadCount(0);
  };

  const handleSendMessage = (
    e
  ) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    setChannelMessages(
      (current) => [
        ...current,
        {
          sender: `${userName} (You)`,
          text:
            newMessage.trim(),
          time: 'Just now',
        },
      ]
    );

    setNewMessage('');
  };

  /* =========================
     ROOM
  ========================= */

  const openMeeting = () => {
    setIsRoomModalOpen(true);
  };

  const openWhiteboard = () => {
    setIsRoomModalOpen(true);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        padding:
          '30px 40px',
        fontFamily:
          'system-ui, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* NAVBAR */}

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
              background:
                '#ff6600',
              borderRadius:
                '50%',
              boxShadow:
                '0 0 10px #ff6600',
            }}
          />

          <h2
            style={{
              margin: 0,
              color: '#fff',
              fontSize:
                '1.4rem',
              fontWeight: '700',
            }}
          >
            Workspace
            Dashboard
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
              textDecoration:
                'none',
              background:
                '#161616',
              padding:
                '8px 18px',
              borderRadius:
                '8px',
              border:
                '1px solid #262626',
              fontSize:
                '0.9rem',
              fontWeight: '500',
            }}
          >
            👤 Profile
          </Link>

          <button
            onClick={() =>
              navigate(
                '/login'
              )
            }
            style={{
              background:
                '#161616',
              color: '#ef4444',
              border:
                '1px solid #262626',
              padding:
                '8px 18px',
              borderRadius:
                '8px',
              cursor:
                'pointer',
              fontWeight: '500',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* WELCOME */}

      <div
        style={{
          background:
            'linear-gradient(135deg, #141414 0%, #1a1a1a 100%)',
          border:
            '1px solid #262626',
          padding:
            '30px 35px',
          borderRadius:
            '16px',
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems: 'center',
          marginBottom:
            '30px',
        }}
      >
        <div>
          <h1
            style={{
              margin:
                '0 0 8px',
              fontSize:
                '2rem',
            }}
          >
            Welcome Back,{' '}
            {userName}! 👋
          </h1>

          <p
            style={{
              margin: 0,
              color:
                '#9ca3af',
            }}
          >
            Here is your
            comprehensive
            workspace overview
            and active projects
            control center.
          </p>
        </div>

        <button
          onClick={() =>
            setIsProjectModalOpen(
              true
            )
          }
          style={orangeButton}
        >
          + New Project
        </button>
      </div>

      {/* QUICK ACTIONS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom:
            '40px',
        }}
      >
        {/* MEETING */}

        <ActionCard
          title="Active Meetings"
          badge="Secure RTC"
          description="Join or start high-definition video conferences instantly."
          action="Enter Meeting →"
          onClick={openMeeting}
        />

        {/* WHITEBOARD */}

        <ActionCard
          title="Whiteboard Canvas"
          badge="3 Active"
          description="Collaborate and brainstorm interface wireframes in real-time."
          action="Open Canvas →"
          onClick={openWhiteboard}
        />

        {/* CHAT */}

        <ActionCard
          title="Team Channels"
          badge={
            unreadCount > 0
              ? `${unreadCount} Unread`
              : 'All Read ✓'
          }
          description="Stay connected with developers and share resource snippets."
          action="Open Channel →"
          onClick={
            handleOpenChannel
          }
        />
      </div>

      {/* PROJECTS */}

      <div
        style={{
          background: '#141414',
          border:
            '1px solid #262626',
          borderRadius:
            '16px',
          padding: '25px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems: 'center',
            marginBottom:
              '20px',
          }}
        >
          <h3
            style={{
              margin: 0,
            }}
          >
            Your Workspace
            Projects (
            {projects.length})
          </h3>

          <span
            style={{
              color:
                '#9ca3af',
              fontSize:
                '0.85rem',
            }}
          >
            Manage and track
            progress
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
          {projects.map(
            (project) => (
              <div
                key={project.id}
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  background:
                    '#1a1a1a',
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
                        '0 0 4px',
                    }}
                  >
                    {
                      project.name
                    }
                  </h4>

                  <span
                    style={{
                      color:
                        '#9ca3af',
                      fontSize:
                        '0.8rem',
                    }}
                  >
                    Category:{' '}
                    {
                      project.category
                    }{' '}
                    • Created:{' '}
                    {
                      project.date
                    }
                  </span>
                </div>

                <span
                  style={{
                    color:
                      '#ff6600',
                    background:
                      'rgba(255,102,0,0.1)',
                    padding:
                      '6px 12px',
                    borderRadius:
                      '6px',
                  }}
                >
                  {
                    project.status
                  }
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* PROJECT MODAL */}

      {isProjectModalOpen && (
        <Overlay>
          <div
            style={modalStyle}
          >
            <h3>
              Create New Project
            </h3>

            <form
              onSubmit={
                handleCreateProject
              }
            >
              <input
                value={
                  newProjectName
                }
                onChange={(e) =>
                  setNewProjectName(
                    e.target.value
                  )
                }
                placeholder="Project Name"
                required
                style={
                  inputStyle
                }
              />

              <input
                value={
                  newProjectCategory
                }
                onChange={(e) =>
                  setNewProjectCategory(
                    e.target.value
                  )
                }
                placeholder="Category / Tech Stack"
                style={
                  inputStyle
                }
              />

              <div
                style={{
                  display:
                    'flex',
                  gap: '10px',
                }}
              >
                <button
                  type="submit"
                  style={{
                    ...orangeButton,
                    flex: 1,
                  }}
                >
                  Create
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setIsProjectModalOpen(
                      false
                    )
                  }
                  style={{
                    ...darkButton,
                    flex: 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Overlay>
      )}

      {/* ROOM MODAL */}

      {isRoomModalOpen && (
        <CreateRoomModal
          onClose={() =>
            setIsRoomModalOpen(
              false
            )
          }
          defaultTab="video"
        />
      )}

      {/* CHANNEL MODAL */}

      {isChannelModalOpen && (
        <Overlay>
          <div
            style={{
              ...modalStyle,
              width: '90%',
              maxWidth:
                '500px',
              height:
                '450px',
              display:
                'flex',
              flexDirection:
                'column',
            }}
          >
            <div
              style={{
                display:
                  'flex',
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
                style={{
                  ...darkButton,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY:
                  'auto',
                margin:
                  '15px 0',
              }}
            >
              {channelMessages.map(
                (message, index) => (
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
                        '8px',
                    }}
                  >
                    <strong
                      style={{
                        color:
                          '#ff6600',
                      }}
                    >
                      {
                        message.sender
                      }
                    </strong>

                    <p
                      style={{
                        margin:
                          '5px 0 0',
                        color:
                          '#ddd',
                      }}
                    >
                      {
                        message.text
                      }
                    </p>
                  </div>
                )
              )}
            </div>

            <form
              onSubmit={
                handleSendMessage
              }
              style={{
                display:
                  'flex',
                gap: '8px',
              }}
            >
              <input
                value={
                  newMessage
                }
                onChange={(e) =>
                  setNewMessage(
                    e.target.value
                  )
                }
                placeholder="Write a message..."
                style={{
                  ...inputStyle,
                  flex: 1,
                }}
              />

              <button
                type="submit"
                style={
                  orangeButton
                }
              >
                Send
              </button>
            </form>
          </div>
        </Overlay>
      )}
    </div>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function ActionCard({
  title,
  badge,
  description,
  action,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background:
          '#141414',
        border:
          '1px solid #262626',
        padding: '24px',
        borderRadius:
          '14px',
        cursor:
          'pointer',
        minHeight:
          '150px',
      }}
    >
      <div
        style={{
          display:
            'flex',
          justifyContent:
            'space-between',
          marginBottom:
            '12px',
        }}
      >
        <h3
          style={{
            margin: 0,
          }}
        >
          {title}
        </h3>

        <span
          style={{
            color:
              '#10b981',
            background:
              'rgba(16,185,129,0.1)',
            padding:
              '4px 10px',
            borderRadius:
              '20px',
            fontSize:
              '0.75rem',
          }}
        >
          {badge}
        </span>
      </div>

      <p
        style={{
          color:
            '#9ca3af',
          fontSize:
            '0.85rem',
          lineHeight:
            '1.4',
        }}
      >
        {description}
      </p>

      <span
        style={{
          color:
            '#ff6600',
          fontWeight:
            '700',
        }}
      >
        {action}
      </span>
    </div>
  );
}

function Overlay({
  children,
}) {
  return (
    <div
      style={{
        position:
          'fixed',
        inset: 0,
        background:
          'rgba(0,0,0,0.75)',
        backdropFilter:
          'blur(5px)',
        display:
          'flex',
        alignItems:
          'center',
        justifyContent:
          'center',
        zIndex: 1000,
      }}
    >
      {children}
    </div>
  );
}

const modalStyle = {
  background: '#161616',
  border:
    '1px solid #333',
  padding: '25px',
  borderRadius:
    '16px',
  width: '90%',
  maxWidth:
    '400px',
  boxSizing:
    'border-box',
};

const inputStyle = {
  width: '100%',
  boxSizing:
    'border-box',
  background:
    '#222',
  border:
    '1px solid #333',
  color: '#fff',
  padding:
    '11px 14px',
  borderRadius:
    '8px',
  marginBottom:
    '12px',
  outline: 'none',
};

const orangeButton = {
  background:
    '#ff6600',
  color: '#000',
  border: 'none',
  padding:
    '11px 20px',
  borderRadius:
    '8px',
  fontWeight:
    '700',
  cursor:
    'pointer',
};

const darkButton = {
  background:
    '#222',
  color: '#fff',
  border:
    '1px solid #333',
  padding:
    '10px 15px',
  borderRadius:
    '8px',
  cursor:
    'pointer',
};