import React from 'react';

export default function Message({ sender, text }) {
  return (
    <div style={{ background: '#1a1a1a', padding: '10px', borderRadius: '8px', border: '1px solid #222' }}>
      <span style={{ fontSize: '0.75rem', color: '#ff6600', fontWeight: '600' }}>{sender}</span>
      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#ddd' }}>{text}</p>
    </div>
  );
}