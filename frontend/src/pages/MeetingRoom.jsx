import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import VideoGrid from '../components/meeting/VideoGrid';
import MeetingControls from '../components/meeting/MeetingControls';
import ChatPanel from '../components/chat/ChatPanel';
import Whiteboard from '../components/whiteboard/Whiteboard';
import { ScreenShare } from '../components/screenShare/ScreenShare';

const SOCKET_SERVER_URL = "http://localhost:5000";

export default function MeetingRoom() {
  const location = useLocation();

  const initialTab = location.state?.defaultTab || 'video';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [isMuted, setIsMuted] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [isVideoOff, setIsVideoOff] = useState(() => {
    const savedVideoState = localStorage.getItem('rtc_is_video_off');
    return savedVideoState ? JSON.parse(savedVideoState) : false;
  });

  const [stream, setStream] = useState(null);
  const [peers, setPeers] = useState({});
  const myVideoRef = useRef(null);
  const socketRef = useRef(null);
  const peerInstance = useRef(null);
  const roomId = "dev-session";

  useEffect(() => {
    localStorage.setItem('rtc_is_video_off', JSON.stringify(isVideoOff));
  }, [isVideoOff]);

  // Copy Link Handler for sharing call with others
  const copyMeetingLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isVideoOff) {
      if (stream) {
        stream.getVideoTracks().forEach(track => track.stop());
      }
    } else {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((userStream) => {
          setStream(userStream);
          if (myVideoRef.current) {
            myVideoRef.current.srcObject = userStream;
          }
        })
        .catch(err => console.error("Error accessing media devices:", err));
    }
  }, [isVideoOff]);

  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    const peer = new Peer();
    peerInstance.current = peer;

    peer.on('open', (id) => {
      if (!isVideoOff) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((userStream) => {
            setStream(userStream);
            if (myVideoRef.current) {
              myVideoRef.current.srcObject = userStream;
            }
            socketRef.current.emit('join-room', roomId, id);
            socketRef.current.on('user-connected', (userId) => {
              connectToNewUser(userId, userStream, peer);
            });
          });
      } else {
        socketRef.current.emit('join-room', roomId, id);
        socketRef.current.on('user-connected', (userId) => {
          if (stream) connectToNewUser(userId, stream, peer);
        });
      }
    });

    peer.on('call', (call) => {
      navigator.mediaDevices.getUserMedia({ video: !isVideoOff, audio: true })
        .then((userStream) => {
          setStream(userStream);
          if (myVideoRef.current) {
            myVideoRef.current.srcObject = userStream;
          }
          call.answer(userStream);
          call.on('stream', (remoteStream) => {
            addRemoteVideo(call.peer, remoteStream);
          });
        });
    });

    socketRef.current.on('user-disconnected', (userId) => {
      if (peers[userId]) peers[userId].close();
      removeRemoteVideo(userId);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (peerInstance.current) peerInstance.current.destroy();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const connectToNewUser = (userId, localStream, peer) => {
    const call = peer.call(userId, localStream);
    call.on('stream', (remoteStream) => addRemoteVideo(userId, remoteStream));
    call.on('close', () => removeRemoteVideo(userId));
    setPeers(prev => ({ ...prev, [userId]: call }));
  };

  const addRemoteVideo = (userId, remoteStream) => {
    let videoGrid = document.getElementById("remote-videos-container");
    if (!videoGrid) return;
    let existingVideo = document.getElementById(`video-${userId}`);
    if (!existingVideo) {
      const videoElement = document.createElement("video");
      videoElement.srcObject = remoteStream;
      videoElement.id = `video-${userId}`;
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.style.width = "200px";
      videoElement.style.height = "150px";
      videoElement.style.objectFit = "cover";
      videoElement.style.borderRadius = "8px";
      videoElement.style.border = "2px solid #ff6600";
      videoGrid.appendChild(videoElement);
    }
  };

  const removeRemoteVideo = (userId) => {
    let videoElement = document.getElementById(`video-${userId}`);
    if (videoElement) videoElement.remove();
  };

  return (
    <div style={{ height: '100dvh', width: '100vw', background: '#0a0a0a', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif', overflow: 'hidden', boxSizing: 'border-box', position: 'fixed', top: 0, left: 0 }}>
      
      {/* Top Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: '#121212', borderBottom: '1px solid #222', flexShrink: 0, zIndex: 10 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 5px #10b981' }}></div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.75rem' }}>#dev-session</span>
          
          {/* Copy Invite Link Button */}
          <button 
            onClick={copyMeetingLink}
            style={{ background: '#1f1f1f', color: copied ? '#10b981' : '#ff6600', border: '1px solid #333', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {copied ? '✓ Link Copied!' : '📋 Copy Link'}
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <button onClick={() => setActiveTab('video')} style={{ background: activeTab === 'video' ? '#ff6600' : '#1a1a1a', color: activeTab === 'video' ? '#000' : '#fff', border: '1px solid', borderColor: activeTab === 'video' ? '#ff6600' : '#333', padding: '4px 8px', borderRadius: '5px', fontWeight: '700', cursor: 'pointer', fontSize: '0.7rem' }}>Video</button>
          <button onClick={() => setActiveTab('whiteboard')} style={{ background: activeTab === 'whiteboard' ? '#ff6600' : '#1a1a1a', color: activeTab === 'whiteboard' ? '#000' : '#fff', border: '1px solid', borderColor: activeTab === 'whiteboard' ? '#ff6600' : '#333', padding: '4px 8px', borderRadius: '5px', fontWeight: '700', cursor: 'pointer', fontSize: '0.7rem' }}>Whiteboard</button>
          <button onClick={() => setActiveTab('screenshare')} style={{ background: activeTab === 'screenshare' ? '#ff6600' : '#1a1a1a', color: activeTab === 'screenshare' ? '#000' : '#fff', border: '1px solid', borderColor: activeTab === 'screenshare' ? '#ff6600' : '#333', padding: '4px 8px', borderRadius: '5px', fontWeight: '700', cursor: 'pointer', fontSize: '0.7rem' }}>Share</button>
          <button onClick={() => setShowChatMobile(!showChatMobile)} style={{ background: showChatMobile ? '#ff6600' : '#1a1a1a', color: showChatMobile ? '#000' : '#ff6600', border: '1px solid #ff6600', padding: '4px 8px', borderRadius: '5px', fontWeight: '700', cursor: 'pointer', fontSize: '0.7rem' }}>Chat</button>
        </div>
      </div>

      {/* Main Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%', position: 'relative' }}>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a', position: 'relative', width: '100%' }}>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '6px' }}>
            {activeTab === 'video' && (
              <>
                <VideoGrid isVideoOff={isVideoOff} isMuted={isMuted} myVideoRef={myVideoRef} />
                <div id="remote-videos-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}></div>
              </>
            )}
            {activeTab === 'whiteboard' && <Whiteboard socket={socketRef.current} roomId={roomId} />}
            {activeTab === 'screenshare' && <ScreenShare />}
          </div>

          <div style={{ flexShrink: 0, background: '#121212', borderTop: '1px solid #222', zIndex: 5 }}>
            <MeetingControls 
              isMuted={isMuted} 
              setIsMuted={setIsMuted} 
              isVideoOff={isVideoOff} 
              setIsVideoOff={setIsVideoOff} 
              stream={stream} 
              setStream={setStream} 
              myVideoRef={myVideoRef} 
            />
          </div>

        </div>

        {/* Chat Panel Overlay */}
        <div style={{ 
          position: 'absolute', 
          right: 0, 
          top: 0, 
          bottom: 0, 
          width: window.innerWidth <= 768 ? '100%' : '320px', 
          background: '#121212', 
          borderLeft: '1px solid #222', 
          display: showChatMobile ? 'flex' : 'none', 
          flexDirection: 'column', 
          height: '100%',
          zIndex: 20 
        }}>
          <div style={{ padding: '8px 12px', background: '#1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
            <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>Room Chat</span>
            <button onClick={() => setShowChatMobile(false)} style={{ background: '#ff6600', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem' }}>✕ Close</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <ChatPanel socket={socketRef.current} roomId={roomId} />
          </div>
        </div>

      </div>

    </div>
  );
}