export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api';

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  'http://localhost:5000';

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  JOIN_ROOM: 'join-room',
  ROOM_USERS: 'room-users',

  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',

  WEBRTC_OFFER: 'webrtc-offer',
  WEBRTC_ANSWER: 'webrtc-answer',
  WEBRTC_ICE_CANDIDATE: 'webrtc-ice-candidate',

  SEND_MESSAGE: 'send-message',
  RECEIVE_MESSAGE: 'receive-message',

  WHITEBOARD_DRAW: 'draw-stroke',
};