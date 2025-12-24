// components/App.tsx
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from '../context/AuthContext'; // Import AuthProvider
import { ThemeProvider } from '../context/ThemeContext';
import Navbar from './Navbar';
import Footer from './Footer';
import LandingPage from './LandingPage';
import ImageGenerator from './ImageGenerator';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm'; // Corrected import path
import CreditsPage from './CreditsPage';
import ContactPage from './ContactPage';
import PrivacyPolicyPage from './PrivacyPolicyPage';
import TermsOfServicePage from './TermsOfServicePage';
import UserProtectedRoute from './ProtectedRoute'; // Renamed from ProtectedRoute
import AdminProtectedRoute from './admin/AdminProtectedRoute'; // New Admin Protected Route
import AdminDashboardPage from './admin/AdminDashboardPage'; // New Admin Dashboard Page
import AdminUsersPage from './admin/AdminUsersPage'; // New Admin Users Page
import AdminPaymentsPage from './admin/AdminPaymentsPage'; // New Admin Payments Page
import AdminCreditPlansPage from './admin/AdminCreditPlansPage'; // New: Admin Credit Plans Page
import ProfilePage from './ProfilePage'; // New: Profile Page
import MyPaymentsPage from './MyPaymentsPage'; // New: My Payments Page

// Define props interface for PageTransition
interface PageTransitionProps {
  children: React.ReactNode;
}

// Explicitly type PageTransition as React.FC<PageTransitionProps>
const PageTransition: React.FC<PageTransitionProps> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="w-full flex-grow" // Ensure it takes full width and grows
  >
    {children}
  </motion.div>
);

const App: React.FC = () => {
  const location = useLocation(); // Use useLocation within the Router context

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen relative z-10"> {/* Ensure content is above the background cycle */}
        <Navbar />
        <main className="flex-grow flex flex-col">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
              <Route path="/login" element={<PageTransition><LoginForm /></PageTransition>} />
              <Route path="/signup" element={<PageTransition><SignupForm /></PageTransition>} />
              <Route
                path="/generator"
                element={
                  <UserProtectedRoute>
                    <PageTransition><ImageGenerator /></PageTransition>
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/credits"
                element={
                  <UserProtectedRoute>
                    <PageTransition><CreditsPage /></PageTransition>
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <UserProtectedRoute>
                    <PageTransition><ProfilePage /></PageTransition>
                  </UserProtectedRoute>
                }
              />
              <Route
                path="/my-payments"
                element={
                  <UserProtectedRoute>
                    <PageTransition><MyPaymentsPage /></PageTransition>
                  </UserProtectedRoute>
                }
              />
              <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
              <Route path="/privacy" element={<PageTransition><PrivacyPolicyPage /></PageTransition>} />
              <Route path="/terms" element={<PageTransition><TermsOfServicePage /></PageTransition>} />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <PageTransition><AdminDashboardPage /></PageTransition>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminProtectedRoute>
                    <PageTransition><AdminUsersPage /></PageTransition>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <AdminProtectedRoute>
                    <PageTransition><AdminPaymentsPage /></PageTransition>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/credit-plans"
                element={
                  <AdminProtectedRoute>
                    <PageTransition><AdminCreditPlansPage /></PageTransition>
                  </AdminProtectedRoute>
                }
              />

              {/* Fallback for unknown routes */}
              <Route path="*" element={
                <PageTransition>
                  <div className="flex items-center justify-center min-h-[calc(100vh-160px)] text-center">
                    <h2 className="text-3xl font-bold text-darkText dark:text-lightText">404 - Page Not Found</h2>
                  </div>
                </PageTransition>
              } />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <AuthProvider> {/* AuthProvider added here */}
      <App />
    </AuthProvider>
  </Router>
);

export default AppWrapper;