/**
 * Format timestamp into readable local time
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Generate a unique 6-character meeting code
 */
export const generateRoomCode = (length = 6) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return result;
};

/**
 * Create a full shareable meeting URL
 */
export const createMeetingLink = (roomId) => {
  return `${window.location.origin}/meeting/${roomId}`;
};

/**
 * Copy meeting link to clipboard
 */
export const copyMeetingLink = async (roomId) => {
  const link = createMeetingLink(roomId);

  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Unable to copy meeting link:', error);
    return false;
  }
};

/**
 * Truncate long strings
 */
export const truncateText = (text, maxLength = 20) => {
  if (!text) return '';

  return text.length > maxLength
    ? `${text.substring(0, maxLength)}...`
    : text;
};