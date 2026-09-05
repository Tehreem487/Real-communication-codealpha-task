export const copyMeetingLink = async (roomId) => {
  if (!roomId) {
    console.error('Room ID is missing');
    return false;
  }

  const frontendUrl =
    import.meta.env.VITE_FRONTEND_URL ||
    'https://real-communication-codealpha-task.vercel.app';

  const meetingUrl =
    `${frontendUrl.replace(/\/$/, '')}/room/${roomId}`;

  console.log('📋 Meeting Link:', meetingUrl);

  try {
    await navigator.clipboard.writeText(meetingUrl);
    return true;
  } catch (error) {
    console.error('Clipboard API failed:', error);

    try {
      const textArea =
        document.createElement('textarea');

      textArea.value = meetingUrl;

      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const copied =
        document.execCommand('copy');

      document.body.removeChild(textArea);

      return copied;
    } catch (fallbackError) {
      console.error(
        'Clipboard fallback failed:',
        fallbackError
      );

      return false;
    }
  }
};