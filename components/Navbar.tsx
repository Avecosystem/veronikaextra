// components/Navbar.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { BRAND_NAME } from '../constants';
import ThemeToggle from './ThemeToggle';
import Button from './ui/Button';
import GlassCard from './ui/GlassCard';
import CreditDisplay from './CreditDisplay'; // Re-import CreditDisplay
import ProfileDropdown from './ProfileDropdown'; // Import the new ProfileDropdown

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Generator', path: '/generator', authenticated: true },
    { name: 'Credits', path: '/credits', authenticated: true },
    { name: 'Contact', path: '/contact', authenticated: false },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogin = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false); // Close mobile menu after logout
  };

  const brandNameParts = BRAND_NAME.split('extra');
  const veronikaPart = brandNameParts[0];
  const extraPart = 'extra'; // Assuming 'extra' is always the second part and lowercase

  return (
    <nav className="sticky top-0 z-50 w-full py-4 px-4 md:px-8 lg:px-12 flex items-center justify-between
                    bg-gradient-to-b from-darkBg/80 to-darkBg/50 dark:from-lightBg/80 dark:to-lightBg/50
                    backdrop-filter backdrop-blur-lg border-b border-gray-700/50 dark:border-gray-300/50">
      <div className="flex items-center">
        <NavLink to="/" className="text-xl font-bold text-darkText dark:text-lightText mr-6 flex items-center group">
          <span>{veronikaPart}
            <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text bg-[length:200%_auto] animate-text-gradient-slow ml-0.5">
              {extraPart}
            </span>
          </span>
        </NavLink>
      </div>

      <div className="hidden md:flex items-center space-x-6">
        {navLinks.map((link) => {
          if (link.authenticated && !isAuthenticated) return null;
          return (
            <motion.div
              key={link.name}
              whileHover={{ scale: 1.05, color: 'var(--accent)' }}
              transition={{ duration: 0.2 }}
            >
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `text-darkText dark:text-lightText hover:text-accent dark:hover:text-accent transition-colors duration-200 relative py-1
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent rounded-md
                  ${isActive ? 'font-bold text-accent' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}
                    {isActive && (
                      <motion.span
                        layoutId="underline"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-accent rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          );
        })}

        {/* Credit Display */}
        {isAuthenticated && <CreditDisplay />}

        {/* Profile Dropdown or Login Button */}
        {isAuthenticated ? (
          <ProfileDropdown />
        ) : (
          <Button variant="outline" size="sm" onClick={handleLogin} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            Login
          </Button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={toggleMobileMenu}
          className="ml-4 text-darkText dark:text-lightText focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent rounded-md"
          aria-label="Toggle mobile menu"
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={toggleMobileMenu}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 w-3/4 max-w-sm bg-black shadow-2xl z-50 md:hidden flex flex-col border-l border-gray-800"
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <div className="flex flex-col">
                  {isAuthenticated && user ? (
                    <>
                      <span className="font-bold text-white text-lg">{user.name}</span>
                      <span className="text-xs text-gray-400">{user.email}</span>
                    </>
                  ) : (
                    <span className="font-bold text-white text-xl">Menu</span>
                  )}
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="text-gray-400 hover:text-white transition-colors focus:outline-none p-2 rounded-full hover:bg-gray-800"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                
                {/* Credits Display (Mobile) */}
                {isAuthenticated && (
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                    <CreditDisplay />
                  </div>
                )}

                {/* Main Navigation */}
                <div className="flex flex-col space-y-2">
                  <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Navigation
                  </div>
                  {navLinks.map((link) => {
                    if (link.authenticated && !isAuthenticated) return null;
                    return (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        className={({ isActive }) => 
                          `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium ${
                            isActive 
                              ? 'bg-gray-900 text-accent border border-gray-800' 
                              : 'text-gray-300 hover:text-white hover:bg-gray-900'
                          }`
                        }
                        onClick={toggleMobileMenu}
                      >
                        {link.name}
                      </NavLink>
                    );
                  })}
                </div>

                {/* User Account Links */}
                {isAuthenticated && (
                  <div className="flex flex-col space-y-2">
                    <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Account
                    </div>
                    <NavLink
                      to="/profile"
                      className={({ isActive }) => 
                        `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium ${
                          isActive 
                            ? 'bg-gray-900 text-accent border border-gray-800' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-900'
                        }`
                      }
                      onClick={toggleMobileMenu}
                    >
                      Profile
                    </NavLink>
                    <NavLink
                      to="/my-payments"
                      className={({ isActive }) => 
                        `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium ${
                          isActive 
                            ? 'bg-gray-900 text-accent border border-gray-800' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-900'
                        }`
                      }
                      onClick={toggleMobileMenu}
                    >
                      My Payments
                    </NavLink>
                  </div>
                )}

                {/* Admin Links */}
                {isAuthenticated && user?.isAdmin && (
                  <div className="flex flex-col space-y-2">
                    <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Admin
                    </div>
                    <NavLink
                      to="/admin/dashboard"
                      className={({ isActive }) => 
                        `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium ${
                          isActive 
                            ? 'bg-gray-900 text-accent border border-gray-800' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-900'
                        }`
                      }
                      onClick={toggleMobileMenu}
                    >
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/admin/credit-plans"
                      className={({ isActive }) => 
                        `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-sm font-medium ${
                          isActive 
                            ? 'bg-gray-900 text-accent border border-gray-800' 
                            : 'text-gray-300 hover:text-white hover:bg-gray-900'
                        }`
                      }
                      onClick={toggleMobileMenu}
                    >
                      Credit Plans
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-6 border-t border-gray-800 bg-black">
                {isAuthenticated ? (
                   <div className="flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 font-medium text-sm">Appearance</span>
                        <ThemeToggle />
                      </div>
                      <Button variant="secondary" size="lg" className="w-full justify-center" onClick={handleLogout}>
                        Logout
                      </Button>
                   </div>
                ) : (
                  <Button variant="primary" size="lg" className="w-full justify-center" onClick={handleLogin}>
                    Login
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;