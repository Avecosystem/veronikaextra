// components/ProfileDropdown.tsx
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import Button from './ui/Button';
import GlassCard from './ui/GlassCard';
import ThemeToggle from './ThemeToggle'; // Re-import ThemeToggle

const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard' },
    { name: 'Credit Plans', path: '/admin/credit-plans' },
  ];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) {
    return null; // Should not happen if this component is rendered only when isAuthenticated
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-darkText dark:text-lightText hover:text-accent dark:hover:text-accent transition-colors duration-200
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent rounded-md py-1 px-2"
        aria-label={`User menu for ${user.name}`}
        aria-expanded={isOpen}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        <span className="font-semibold">{user.name}</span>
        <svg
          className={`h-4 w-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
        ><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl shadow-lg bg-darkBg/80 dark:bg-lightBg/80 backdrop-filter backdrop-blur-lg border border-gray-700/50 dark:border-gray-300/50 focus:outline-none z-50"
          >
            <GlassCard className="p-2 flex flex-col space-y-1">
              <NavLink
                to="/profile"
                className="block px-4 py-2 text-sm text-darkText dark:text-lightText hover:bg-gray-700/30 dark:hover:bg-gray-300/30 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </NavLink>
              <NavLink
                to="/my-payments"
                className="block px-4 py-2 text-sm text-darkText dark:text-lightText hover:bg-gray-700/30 dark:hover:bg-gray-300/30 rounded-lg"
                onClick={() => setIsOpen(false)}
              >
                My Payments
              </NavLink>

              {user.isAdmin && (
                <>
                  <div className="border-t border-gray-700/50 dark:border-gray-300/50 my-1"></div>
                  {adminLinks.map((link) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      className="block px-4 py-2 text-sm text-darkText dark:text-lightText hover:bg-gray-700/30 dark:hover:bg-gray-300/30 rounded-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.name}
                    </NavLink>
                  ))}
                </>
              )}
              
              <div className="border-t border-gray-700/50 dark:border-gray-300/50 my-1"></div>
              
              <div className="flex items-center justify-between px-4 py-2 text-sm text-darkText dark:text-lightText">
                <span>Theme:</span>
                <ThemeToggle />
              </div>

              <div className="border-t border-gray-700/50 dark:border-gray-300/50 my-1"></div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-left justify-start px-4"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;