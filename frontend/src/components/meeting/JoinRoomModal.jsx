import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';

export const JoinRoomModal = ({ isOpen, onClose }) => {
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.trim()}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Existing Room">
      <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Input 
          label="Room Code" 
          value={roomCode} 
          onChange={(e) => setRoomCode(e.target.value)} 
          placeholder="Enter 6-digit code..." 
          required 
        />
        <Button type="submit" variant="primary" size="md" fullWidth>
          Enter Room
        </Button>
      </form>
    </Modal>
  );
};