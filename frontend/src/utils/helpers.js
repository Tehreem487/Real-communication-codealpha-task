/**
 * Format timestamp into readable local time
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};


/**
 * Generate a random alphanumeric room code
 */
export const generateRoomCode = (length = 6) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return result;
};


/**
 * Truncate long strings
 */
export const truncateText = (
  text,
  maxLength = 20
) => {
  if (!text) return '';

  const value = String(text);

  return value.length > maxLength
    ? `${value.substring(0, maxLength)}...`
    : value;
};


/**
 * Generate complete meeting URL
 *
 * Example:
 * https://your-app.vercel.app/room/ABC123
 */
export const getMeetingUrl = (roomId) => {
  if (!roomId) return '';

  return `${window.location.origin}/room/${roomId}`;
};


/**
 * Copy meeting link to clipboard
 */
export const copyMeetingLink = async (roomId) => {
  try {
    const meetingUrl = getMeetingUrl(roomId);

    if (!meetingUrl) {
      return false;
    }

    await navigator.clipboard.writeText(meetingUrl);

    return true;
  } catch (error) {
    console.error(
      'Unable to copy meeting link:',
      error
    );

    return false;
  }
};