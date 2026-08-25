import React from 'react';

export const EmptyState = ({ title = 'No Data Found', description = 'Nothing to display here yet.' }) => {
  return (
    <div className="empty-state">
      <div className="empty-icon">📂</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};