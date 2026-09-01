export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://real-communication-codealpha-task-production.up.railway.app/api';

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  'https://real-communication-codealpha-task-production.up.railway.app';

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  JOIN_ROOM: 'join-room',
  ROOM_USERS: 'room-users',

  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',

  SEND_MESSAGE: 'send-message',
  RECEIVE_MESSAGE: 'receive-message',

  WEBRTC_OFFER: 'webrtc-offer',
  WEBRTC_ANSWER: 'webrtc-answer',
  WEBRTC_ICE_CANDIDATE: 'webrtc-ice-candidate',

  WHITEBOARD_DRAW: 'draw-stroke',
};