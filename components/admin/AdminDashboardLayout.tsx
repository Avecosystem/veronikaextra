
// components/admin/AdminDashboardLayout.tsx
import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';

interface AdminDashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({ children, title }) => {
  const adminNavLinks = [
    { name: 'Dashboard', path: '/admin/dashboard' },
    { name: 'User', path: '/admin/users' },
    { name: 'Payments', path: '/admin/payments' },
    { name: 'Credit Plan', path: '/admin/credit-plans' },
    { name: 'Contact', path: '/admin/contact' },
    { name: 'Others', path: '/admin/others' }, // New Link
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-160px)] p-4 md:p-8 lg:p-12 animate-fade-in">
      {/* Sidebar Navigation */}
      <GlassCard className="w-full md:w-64 p-4 md:p-6 mb-8 md:mb-0 md:mr-8 flex-shrink-0">
        <h2 className="text-xl font-bold text-darkText dark:text-lightText mb-6">Admin Panel</h2>
        <nav className="space-y-3">
          {adminNavLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg text-darkText dark:text-lightText hover:bg-gray-700/30 dark:hover:bg-gray-300/30 transition-colors duration-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent rounded-md
                ${isActive ? 'bg-accent/20 text-accent font-semibold' : ''}`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      </GlassCard>

      {/* Main Content Area */}
      <GlassCard className="flex-grow p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-darkText dark:text-lightText mb-8">
          {title}
        </h1>
        {children}
      </GlassCard>
    </div>
  );
};

export default AdminDashboardLayout;