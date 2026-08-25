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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 25px', background: '#121212', borderBottom: '1px solid #222', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }}></div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.3px' }}>Secure RTC Room #dev-session</span>
        </div>
        
        {/* Navigation Tabs (Video, Whiteboard, Screen Share) */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('video')}
            style={{ background: activeTab === 'video' ? '#ff6600' : '#1a1a1a', color: activeTab === 'video' ? '#000' : '#fff', border: '1px solid', borderColor: activeTab === 'video' ? '#ff6600' : '#333', padding: '6px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s' }}
          >
            Video Grid
          </button>
          <button 
            onClick={() => setActiveTab('whiteboard')}
            style={{ background: activeTab === 'whiteboard' ? '#ff6600' : '#1a1a1a', color: activeTab === 'whiteboard' ? '#000' : '#fff', border: '1px solid', borderColor: activeTab === 'whiteboard' ? '#ff6600' : '#333', padding: '6px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s' }}
          >
            Whiteboard
          </button>
          <button 
            onClick={() => setActiveTab('screenshare')}
            style={{ background: activeTab === 'screenshare' ? '#ff6600' : '#1a1a1a', color: activeTab === 'screenshare' ? '#000' : '#fff', border: '1px solid', borderColor: activeTab === 'screenshare' ? '#ff6600' : '#333', padding: '6px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem', transition: '0.2s' }}
          >
            Screen Share
          </button>
        </div>
      </div>

      {/* Main Body Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', width: '100%' }}>
        
        {/* Left Workspace (Video / Whiteboard / ScreenShare + Controls) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0a0a0a', position: 'relative' }}>
          
          {/* Scrollable Content Area */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '10px' }}>
            {activeTab === 'video' && <VideoGrid isVideoOff={isVideoOff} isMuted={isMuted} />}
            {activeTab === 'whiteboard' && <Whiteboard />}
            {activeTab === 'screenshare' && <ScreenShare />}
          </div>

          {/* Fixed Bottom Meeting Controls Bar */}
          <div style={{ flexShrink: 0, background: '#121212', borderTop: '1px solid #222', zIndex: 5 }}>
            <MeetingControls isMuted={isMuted} setIsMuted={setIsMuted} isVideoOff={isVideoOff} setIsVideoOff={setIsVideoOff} />
          </div>

        </div>

        {/* Right Chat Panel */}
        <div style={{ flexShrink: 0, width: '340px', background: '#121212', borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <ChatPanel />
        </div>

      </div>

    </div>
  );
}