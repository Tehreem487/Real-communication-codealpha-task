import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar = () => {
  return (
    <aside className="sidebar-container">
      <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
        🏠 Dashboard
      </NavLink>
      <NavLink to="/rooms" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
        📹 Meetings
      </NavLink>
      <NavLink to="/whiteboard" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
        🎨 Whiteboard
      </NavLink>
      <NavLink to="/screenshare" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
        🖥️ Share Screen
      </NavLink>
    </aside>
  );
};