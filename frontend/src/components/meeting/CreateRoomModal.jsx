import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateRoomModal({
  onClose,
  defaultTab = 'video',
}) {
  const navigate = useNavigate();

  /*
   * -----------------------------------------
   * GENERATE UNIQUE ROOM ID
   * -----------------------------------------
   */

  const generateRoomId = () => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let roomId = '';

    for (let i = 0; i < 6; i++) {
      roomId +=
        characters.charAt(
          Math.floor(
            Math.random() *
              characters.length
          )
        );
    }

    return roomId;
  };

  /*
   * -----------------------------------------
   * CREATE ROOM
   * -----------------------------------------
   */

  const handleCreateRoom = () => {
    const roomId =
      generateRoomId();

    const roomName =
      `Team Meeting ${roomId}`;

    /*
     * Close modal first
     */

    if (onClose) {
      onClose();
    }

    /*
     * Navigate to actual room URL
     *
     * Example:
     * /room/GMBBJJ
     */

    navigate(
      `/room/${roomId}`,
      {
        state: {
          roomId,
          roomName,
          defaultTab,
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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          background: '#161616',
          border: '1px solid #333',
          borderRadius: '16px',
          padding: '28px',
          width: '90%',
          maxWidth: '420px',
          boxSizing: 'border-box',
        }}
      >
        <h2
          style={{
            margin: '0 0 8px',
            color: '#fff',
          }}
        >
          Start Meeting
        </h2>

        <p
          style={{
            color: '#9ca3af',
            marginBottom: '25px',
            lineHeight: '1.5',
          }}
        >
          Create a secure meeting
          room and invite others
          using the generated link.
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={
              handleCreateRoom
            }
            style={{
              background: '#ff6600',
              color: '#000',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Enter Meeting →
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#222',
              color: '#fff',
              border: '1px solid #333',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}