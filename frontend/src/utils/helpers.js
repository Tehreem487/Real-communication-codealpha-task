export const formatTime = (dateString) => {
  const date = new Date(dateString);

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateRoomCode = (
  length = 6
) => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(
      Math.floor(
        Math.random() * chars.length
      )
    );
  }

  return result;
};

export const truncateText = (
  text,
  maxLength = 20
) => {
  if (!text) return '';

  return text.length > maxLength
    ? `${text.substring(0, maxLength)}...`
    : text;
};

export const copyMeetingLink = async (
  roomId
) => {
  try {
    const link =
      `${window.location.origin}/room/${roomId}`;

    await navigator.clipboard.writeText(link);

    return true;
  } catch (error) {
    console.error(
      'Unable to copy meeting link:',
      error
    );

    return false;
  }
};