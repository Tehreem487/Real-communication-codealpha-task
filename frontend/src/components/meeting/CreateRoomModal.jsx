import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useNavigate } from 'react-router-dom';
import { generateRoomCode } from '../../utils/helpers';

export const CreateRoomModal = ({ isOpen, onClose }) => {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();
    const code = generateRoomCode();
    navigate(`/room/${code}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Secure Room">
      <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Input 
          label="Room Name / Purpose" 
          value={roomName} 
          onChange={(e) => setRoomName(e.target.value)} 
          placeholder="e.g., Sprint Review" 
          required 
        />
        <Button type="submit" variant="primary" size="md" fullWidth>
          Launch Room
        </Button>
      </form>
    </Modal>
  );
};