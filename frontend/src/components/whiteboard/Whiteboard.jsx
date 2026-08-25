import React from 'react';

export default function Whiteboard() {
  return (
    <div style={{ flex: 1, background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #333', borderRadius: '12px', margin: '20px' }}>
      <h3 style={{ color: '#fff', marginBottom: '8px' }}>Collaborative Whiteboard Canvas</h3>
      <p style={{ color: '#888', fontSize: '0.85rem' }}>Draw shapes, wireframes, and notes in real-time sync.</p>
    </div>
  );
}