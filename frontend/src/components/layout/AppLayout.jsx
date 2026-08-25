import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import '../../styles/layout.css';

export const AppLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="app-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};