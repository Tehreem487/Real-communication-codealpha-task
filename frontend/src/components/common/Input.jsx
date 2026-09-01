import React from 'react';


export const Input = ({ label, value, onChange, placeholder, type = 'text', required = false }) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input 
        type={type} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        required={required} 
        className="custom-input"
      />
    </div>
  );
};