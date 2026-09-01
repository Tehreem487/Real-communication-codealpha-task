import React, { useState } from 'react';

import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

import { useNavigate } from 'react-router-dom';

export const JoinRoomModal = ({
  isOpen,
  onClose,
}) => {
  const [roomCode, setRoomCode] = useState('');

  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();

    const cleanCode = roomCode
      .trim()
      .toUpperCase();

    if (!cleanCode) return;

    navigate(`/room/${cleanCode}`);

    setRoomCode('');

    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join Existing Room"
    >
      <form
        onSubmit={handleJoin}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <Input
          label="Room Code"
          value={roomCode}
          onChange={(e) =>
            setRoomCode(
              e.target.value.toUpperCase()
            )
          }
          placeholder="Enter room code..."
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
        >
          Enter Room
        </Button>
      </form>
    </Modal>
  );
};