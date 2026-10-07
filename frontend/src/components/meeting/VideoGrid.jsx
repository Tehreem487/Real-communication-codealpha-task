import React, { useEffect, useRef } from "react";

function VideoPlayer({
  stream,
  muted = false,
  mirror = false,
  label = "Participant",
}) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (stream) {
      video.srcObject = stream;

      const playVideo = async () => {
        try {
          await video.play();
        } catch (error) {
          /*
            Browser may block autoplay in some situations.
            The video controls/interaction can start it.
          */
          console.warn(
            "Video autoplay was blocked:",
            error
          );
        }
      };

      playVideo();
    } else {
      video.srcObject = null;
    }

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div className="video-tile">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`meeting-video ${
          mirror ? "video-mirror" : ""
        }`}
      />

      {!stream && (
        <div className="video-placeholder">
          <div className="video-placeholder-avatar">
            {label?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <span>Camera Off</span>
        </div>
      )}

      <div className="video-name">
        {label}
      </div>
    </div>
  );
}

export default function VideoGrid({
  peers = [],
  participants = [],
  isVideoOff = false,
  isMuted = false,
  myVideoRef,
}) {
  /*
    Make sure peers is always an array.
  */
  const safePeers = Array.isArray(peers)
    ? peers
    : [];

  /*
    Remove duplicate peer IDs.
  */
  const uniquePeers = safePeers.filter(
    (peer, index, array) =>
      peer &&
      peer.id &&
      index ===
        array.findIndex(
          (item) => item?.id === peer.id
        )
  );

  /*
    Convert participants to an array as well.
    This keeps compatibility with the existing
    MeetingRoom component.
  */
  const safeParticipants = Array.isArray(
    participants
  )
    ? participants
    : [];

  /*
    Number of remote videos.
  */
  const remoteCount =
    uniquePeers.length;

  /*
    Dynamic grid class.
  */
  const getGridClass = () => {
    const total =
      remoteCount + 1;

    if (total === 1) {
      return "video-grid single-video";
    }

    if (total === 2) {
      return "video-grid two-videos";
    }

    if (total <= 4) {
      return "video-grid four-videos";
    }

    if (total <= 6) {
      return "video-grid six-videos";
    }

    return "video-grid many-videos";
  };

  return (
    <div className={getGridClass()}>
      {/* =========================
          LOCAL VIDEO
      ========================== */}
      <div className="video-tile local-video-tile">
        <video
          ref={myVideoRef}
          autoPlay
          playsInline
          muted
          className={`meeting-video ${
            isVideoOff
              ? "local-video-hidden"
              : "video-mirror"
          }`}
        />

        {isVideoOff && (
          <div className="video-placeholder">
            <div className="video-placeholder-avatar">
              You
            </div>

            <span>Camera Off</span>
          </div>
        )}

        <div className="video-name">
          You
          {isMuted ? " • Muted" : ""}
        </div>
      </div>

      {/* =========================
          REMOTE PARTICIPANTS
      ========================== */}
      {uniquePeers.map((peer) => {
        if (!peer?.id) {
          return null;
        }

        return (
          <VideoPlayer
            key={peer.id}
            stream={peer.stream}
            muted={false}
            mirror={false}
            label={
              peer.name ||
              peer.username ||
              `Participant ${peer.id.slice(
                0,
                5
              )}`
            }
          />
        );
      })}

      {/* =========================
          FALLBACK PARTICIPANT DATA

          Only render these if they don't already
          have a WebRTC peer stream.
      ========================== */}
      {safeParticipants
        .filter((participant) => {
          const participantId =
            participant?.id ||
            participant?.userId ||
            participant?.socketId;

          return (
            participantId &&
            !uniquePeers.some(
              (peer) =>
                peer.id ===
                participantId
            )
          );
        })
        .map((participant) => {
          const participantId =
            participant?.id ||
            participant?.userId ||
            participant?.socketId;

          const name =
            participant?.name ||
            participant?.username ||
            participant?.user?.name ||
            "Participant";

          /*
            We don't have a MediaStream for this
            participant yet, so show the waiting
            placeholder instead of pretending that
            WebRTC video exists.
          */
          return (
            <VideoPlayer
              key={`participant-${participantId}`}
              stream={null}
              muted={false}
              mirror={false}
              label={name}
            />
          );
        })}
    </div>
  );
}