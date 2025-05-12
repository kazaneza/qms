import React from 'react';
import AdminDashboard from '../components/AdminDashboard';

const AdminPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default AdminPage;