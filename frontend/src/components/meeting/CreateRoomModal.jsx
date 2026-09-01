import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateRoomModal({
  onClose,
  defaultTab = 'video',
}) {
  const navigate = useNavigate();

  const generateRoomId = () => {
    return Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
  };

  const handleCreateRoom = () => {
    const roomId =
      generateRoomId();

    navigate(
      `/room/${roomId}`,
      {
        state: {
          roomName:
            `Team Meeting ${roomId}`,
          defaultTab,
          roomId,
        },
      }
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background:
          'rgba(0,0,0,0.75)',
        backdropFilter:
          'blur(5px)',
        display: 'flex',
        alignItems:
          'center',
        justifyContent:
          'center',
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: '#161616',
          border:
            '1px solid #333',
          borderRadius:
            '16px',
          padding: '28px',
          width: '90%',
          maxWidth: '420px',
          boxSizing:
            'border-box',
        }}
      >
        <h2
          style={{
            margin:
              '0 0 8px',
            color: '#fff',
          }}
        >
          Start Meeting
        </h2>

        <p
          style={{
            color:
              '#9ca3af',
            marginBottom:
              '25px',
          }}
        >
          Your meeting room is
          ready.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection:
              'column',
            gap: '10px',
          }}
        >
          <button
            onClick={
              handleCreateRoom
            }
            style={{
              background:
                '#ff6600',
              color: '#000',
              border: 'none',
              padding:
                '12px',
              borderRadius:
                '8px',
              fontWeight:
                '700',
              cursor:
                'pointer',
            }}
          >
            Enter Meeting →
          </button>

          <button
            onClick={onClose}
            style={{
              background:
                '#222',
              color: '#fff',
              border:
                '1px solid #333',
              padding:
                '12px',
              borderRadius:
                '8px',
              fontWeight:
                '600',
              cursor:
                'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}