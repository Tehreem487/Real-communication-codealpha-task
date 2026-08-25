import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import VideoGrid from '../components/meeting/VideoGrid';
import MeetingControls from '../components/meeting/MeetingControls';
import ChatPanel from '../components/chat/ChatPanel';
import Whiteboard from '../components/whiteboard/Whiteboard';
import { ScreenShare } from '../components/screenShare/ScreenShare';

export default function MeetingRoom() {
  const location = useLocation();

  // Dashboard se aane wali state read karega (default 'video' rahega agar state na ho)
  const initialTab = location.state?.defaultTab || 'video';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [isMuted, setIsMuted] = useState(false);
  const [showChatMobile, setShowChatMobile] = useState(false); // Mobile screen ke liye chat visibility state
  
  // Persist video state across refreshes
  const [isVideoOff, setIsVideoOff] = useState(() => {
    const savedVideoState = localStorage.getItem('rtc_is_video_off');
    return savedVideoState ? JSON.parse(savedVideoState) : false;
  });

  useEffect(() => {
    localStorage.setItem('rtc_is_video_off', JSON.stringify(isVideoOff));
  }, [isVideoOff]);

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#0a0a0a', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif', overflow: 'hidden', boxSizing: 'border-box', position: 'fixed', top: 0, left: 0 }}>
      
      {/* Top Navbar in Meeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#121212', borderBottom: '1px solid #222', flexShrink: 0, zIndex: 10, flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 6px #10b981' }}></div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.85rem' }}>#dev-session</span>
        </div>
        
        {/* Navigation Tabs (Video, Whiteboard, Screen Share, and Mobile Chat Toggle) */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('video')}
            style={{ background: activeTab === 'video' ? '#ff6600' : '#1a1a1a', color: activeTab === 'video' ? '#000' : '#fff', border: '1px solid', borderColor: activeTab === 'video' ? '#ff6600' : '#333', padding: '5px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Video
          </button>
          <button 
            onClick={() => setActiveTab('whiteboard')}
            style={{ background: activeTab === 'whiteboard' ? '#ff6600' : '#1a1a1a', color: activeTab === 'whiteboard' ? '#000' : '#fff', border: '1px solid', borderColor: activeTab === 'whiteboard' ? '#ff6600' : '#333', padding: '5px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Whiteboard
          </button>
          <button 
            onClick={() => setActiveTab('screenshare')}
            style={{ background: activeTab === 'screenshare' ? '#ff6600' : '#1a1a1a', color: activeTab === 'screenshare' ? '#000' : '#fff', border: '1px solid', borderColor: activeTab === 'screenshare' ? '#ff6600' : '#333', padding: '5px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            Share
          </button>
          <button 
            onClick={() => setShowChatMobile(!showChatMobile)}
            style={{ background: showChatMobile ? '#ff6600' : '#1a1a1a', color: showChatMobile ? '#000' : '#ff6600', border: '1px solid #ff6600', padding: '5px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.75rem' }}
          >
            {showChatMobile ? 'Close Chat' : 'Chat'}
          </button>
        </div>
      </div>

      {/* Main Body Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%', position: 'relative' }}>
        
        {/* Left Workspace (Video / Whiteboard / ScreenShare + Controls) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a', position: 'relative', width: '100%' }}>
          
          {/* Scrollable Content Area */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '8px' }}>
            {activeTab === 'video' && <VideoGrid isVideoOff={isVideoOff} isMuted={isMuted} />}
            {activeTab === 'whiteboard' && <Whiteboard />}
            {activeTab === 'screenshare' && <ScreenShare />}
          </div>

          {/* Fixed Bottom Meeting Controls Bar */}
          <div style={{ flexShrink: 0, background: '#121212', borderTop: '1px solid #222', zIndex: 5 }}>
            <MeetingControls isMuted={isMuted} setIsMuted={setIsMuted} isVideoOff={isVideoOff} setIsVideoOff={setIsVideoOff} />
          </div>

        </div>

        {/* Right Chat Panel (Desktop par side-by-side, mobile par overlay modal) */}
        <div style={{ 
          position: window.innerWidth <= 768 ? 'absolute' : 'relative', 
          right: 0, 
          top: 0, 
          bottom: 0, 
          width: window.innerWidth <= 768 ? '100%' : '320px', 
          background: '#121212', 
          borderLeft: '1px solid #222', 
          display: window.innerWidth <= 768 ? (showChatMobile ? 'flex' : 'none') : 'flex', 
          flexDirection: 'column', 
          height: '100%',
          zIndex: 20 
        }}>
          {window.innerWidth <= 768 && (
            <div style={{ padding: '8px 12px', background: '#1a1a1a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
              <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold' }}>Room Chat</span>
              <button 
                onClick={() => setShowChatMobile(false)} 
                style={{ background: '#ff6600', color: '#000', border: 'none', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                ✕ Close
              </button>
            </div>
          )}
          <ChatPanel />
        </div>

      </div>

    </div>
  );
}