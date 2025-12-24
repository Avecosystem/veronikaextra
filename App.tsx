
// App.tsx
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import ImageGenerator from './components/ImageGenerator';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm'; // Corrected import path
import CreditsPage from './components/CreditsPage';
import ContactPage from './components/ContactPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import TermsOfServicePage from './components/TermsOfServicePage';
import UserProtectedRoute from './components/ProtectedRoute'; // Renamed from ProtectedRoute
import AdminProtectedRoute from './components/admin/AdminProtectedRoute'; // New Admin Protected Route
import AdminDashboardPage from './components/admin/AdminDashboardPage'; // New Admin Dashboard Page
import AdminUsersPage from './components/admin/AdminUsersPage'; // New Admin Users Page
import AdminPaymentsPage from './components/admin/AdminPaymentsPage'; // New Admin Payments Page
import AdminCreditPlansPage from './components/admin/AdminCreditPlansPage'; // New: Admin Credit Plans Page
import AdminContactPage from './components/admin/AdminContactPage'; // New: Admin Contact Page
import AdminOthersPage from './components/admin/AdminOthersPage'; // New: Admin Others Page
import ProfilePage from './components/ProfilePage'; // New: Profile Page
import MyPaymentsPage from './components/MyPaymentsPage'; // New: My Payments Page

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
              <Route
                path="/admin/contact"
                element={
                  <AdminProtectedRoute>
                    <PageTransition><AdminContactPage /></PageTransition>
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/others"
                element={
                  <AdminProtectedRoute>
                    <PageTransition><AdminOthersPage /></PageTransition>
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
