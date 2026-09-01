import React from 'react';

export default function Button({
  children,
  type = 'button',
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  style = {},
}) {
  const variants = {
    primary: {
      background: '#ff6600',
      color: '#000',
      border: '1px solid #ff6600',
    },

    secondary: {
      background: '#1a1a1a',
      color: '#fff',
      border: '1px solid #333',
    },

    danger: {
      background: '#2a1111',
      color: '#ef4444',
      border: '1px solid #4a2222',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        ...variants[variant],
        padding: '10px 18px',
        borderRadius: '8px',
        fontWeight: '700',
        cursor: disabled
          ? 'not-allowed'
          : 'pointer',
        opacity: disabled ? 0.6 : 1,
        fontSize: '14px',
        transition:
          '0.2s ease',
        ...style,
      }}
    >
      {children}
    </button>
  );
}