import React from 'react';
import VideoPlayer from './VideoPlayer';

export default function VideoGrid({
  participants = [],
  peers = [],
  isVideoOff = false,
  isMuted = false,
  stream = null,
  myVideoRef,
}) {
  const getUserName = () => {
    const savedUser =
      localStorage.getItem('workspace_profile') ||
      localStorage.getItem('userInfo') ||
      localStorage.getItem('user');

    if (!savedUser) {
      return 'User';
    }

    try {
      const parsed =
        JSON.parse(savedUser);

      return (
        parsed?.name ||
        parsed?.username ||
        parsed?.fullName ||
        'User'
      );
    } catch {
      return 'User';
    }
  };

  const currentUserName =
    getUserName();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns:
          'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px',
        width: '100%',
        minHeight: '100%',
        padding: '10px',
        boxSizing: 'border-box',
        alignContent: 'start',
      }}
    >

      {/* LOCAL VIDEO */}

      <VideoPlayer
        name={`${currentUserName} (You)`}
        isLocal={true}
        isVideoOff={
          isVideoOff
        }
        isMuted={
          isMuted
        }
        stream={
          stream
        }
        videoRef={
          myVideoRef
        }
      />


      {/* REMOTE PEERS */}

      {peers.map(
        (peer, index) => (
          <VideoPlayer
            key={
              peer?.id ||
              peer?.socketId ||
              index
            }
            name={
              peer?.name ||
              participants[index]?.name ||
              `Participant ${index + 1}`
            }
            isLocal={false}
            stream={
              peer?.stream
            }
          />
        )
      )}


      {/* SOCKET PARTICIPANTS
          Agar WebRTC peer stream available na ho */}

      {peers.length === 0 &&
        participants.map(
          (participant, index) => (
            <VideoPlayer
              key={
                participant.id ||
                participant.socketId ||
                index
              }
              name={
                participant.name ||
                `Participant ${index + 1}`
              }
              isLocal={false}
            />
          )
        )}

    </div>
  );
}