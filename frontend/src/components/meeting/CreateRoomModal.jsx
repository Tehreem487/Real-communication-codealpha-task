import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { generateRoomCode } from '../../utils/helpers';

export const CreateRoomModal = ({
  isOpen,
  onClose,
}) => {
  const [roomName, setRoomName] = useState('');

  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();

    const roomCode = generateRoomCode();

    navigate(`/meeting/${roomCode}`, {
      state: {
        roomName:
          roomName.trim() || 'Meeting Room',
      },
    });

    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Secure Meeting"
    >
      <form
        onSubmit={handleCreate}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <Input
          label="Meeting Name"
          value={roomName}
          onChange={(e) =>
            setRoomName(e.target.value)
          }
          placeholder="e.g. Sprint Review"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
        >
          Start Meeting
        </Button>
      </form>
    </Modal>
  );
};