import React from 'react';

export const Avatar = ({ name = 'User', size = 'md' }) => {
  const initial = name ? name[0].toUpperCase() : 'U';
  return (
    <div className={`user-avatar ${size}`}>
      {initial}
    </div>
  );
};