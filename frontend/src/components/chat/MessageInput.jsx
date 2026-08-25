import React, { useState } from 'react';

export default function MessageInput({ onSend }) {
  const [input, setInput] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  return (
    <form onSubmit={onSubmit} style={{ padding: '12px', borderTop: '1px solid #222', display: 'flex', gap: '8px' }}>
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..." 
        style={{ flex: 1, background: '#222', border: '1px solid #333', color: '#fff', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
      />
      <button type="submit" style={{ background: '#ff6600', color: '#000', border: 'none', padding: '0 15px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Send</button>
    </form>
  );
}