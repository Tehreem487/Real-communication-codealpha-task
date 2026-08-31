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

    const code = roomCode
      .trim()
      .toUpperCase();

    if (!code) return;

    navigate(`/meeting/${code}`);

    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join Meeting"
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
          label="Meeting Code"
          value={roomCode}
          onChange={(e) =>
            setRoomCode(
              e.target.value.toUpperCase()
            )
          }
          placeholder="e.g. X7K9PQ"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
        >
          Join Meeting
        </Button>
      </form>
    </Modal>
  );
};