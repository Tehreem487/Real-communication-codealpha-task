import React from 'react';

export const FileMessage = ({ fileName, fileSize, fileUrl }) => {
  return (
    <div className="file-message-card">
      <div className="file-icon">📄</div>
      <div className="file-info">
        <span className="file-name">{fileName}</span>
        <span className="file-size">{fileSize}</span>
      </div>
      <a href={fileUrl} download className="file-download-btn">⬇️</a>
    </div>
  );
};