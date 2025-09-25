import React from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { Outlet } from 'react-router-dom';

export function DashboardLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="d-flex" style={{ marginTop: '56px' }}>
        <Sidebar />
        <main className="flex-grow-1 p-4" style={{ marginLeft: '200px' }}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );

  
}