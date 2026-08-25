import React, { useState, useEffect } from 'react';

export default function ChatPanel() {
  // Load messages from localStorage on initial render
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('rtc_chat_messages');
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { sender: 'Ali', text: 'Welcome to the secure RTC stream room!' }
    ];
  });
  
  const [input, setInput] = useState('');

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rtc_chat_messages', JSON.stringify(messages));
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const updatedMessages = [...messages, { sender: 'Tehreem', text: input }];
    setMessages(updatedMessages);
    setInput('');
  };

  return (
    <div style={{ width: '340px', background: '#121212', borderLeft: '1px solid #222', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '15px', borderBottom: '1px solid #222', fontWeight: '700', fontSize: '0.95rem', color: '#fff' }}>
        Room Chat
      </div>
      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ background: '#1a1a1a', padding: '10px', borderRadius: '8px', border: '1px solid #222' }}>
            <span style={{ fontSize: '0.75rem', color: '#ff6600', fontWeight: '600' }}>{m.sender}</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#ddd' }}>{m.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid #222', display: 'flex', gap: '8px' }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..." 
          style={{ flex: 1, background: '#222', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
        />
        <button type="submit" style={{ background: '#ff6600', color: '#000', border: 'none', padding: '0 15px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Send</button>
      </form>
    </div>
  );
}