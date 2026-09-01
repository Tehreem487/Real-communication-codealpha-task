import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', size = 'md', fullWidth = false, type = 'button' }) => {
  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''}`}
    >
      {children}
    </button>
  );
};