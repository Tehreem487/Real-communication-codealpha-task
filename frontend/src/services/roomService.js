import api from './api';

export const roomService = {
  createRoom: async (roomData) => {
    const response = await api.post('/rooms/create', roomData);
    return response;
  },

  validateRoom: async (roomId) => {
    const response = await api.get(`/rooms/validate/${roomId}`);
    return response;
  },
};