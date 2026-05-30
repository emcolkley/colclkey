'use client';

import React from 'react';
import AdminDashboard from '../../components/AdminDashboard';
import './admin.css';

export default function AdminPage() {
  return (
    <div className="admin-page-wrapper" style={{ background: '#0A0A0A', minHeight: '100vh' }}>
      <AdminDashboard />
    </div>
  );
}
