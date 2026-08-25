import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../common/Avatar';

export const Navbar = () => {
  return (
    <nav className="navbar-container">
      <div className="navbar-brand">
        <h2>⚡ Design On Tech Meet</h2>
      </div>
      <div className="navbar-profile">
        <span className="profile-name">Tehreem</span>
        <Avatar name="Tehreem" size="sm" />
      </div>
    </nav>
  );
};