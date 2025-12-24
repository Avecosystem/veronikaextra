
// components/ProfilePage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { backendApi } from '../services/backendApi';
import { ApiResponse } from '../types';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import Loader from './ui/Loader';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading, updateUserCredits } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const getParam = useCallback((name: string) => {
    // Check standard search params
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has(name)) return searchParams.get(name);
    
    // Check hash for params (common with HashRouter: #/profile?order_id=...)
    const hashParts = location.hash.split('?');
    if (hashParts.length > 1) {
        const hashParams = new URLSearchParams(hashParts[1]);
        if (hashParams.has(name)) return hashParams.get(name);
    }
    return null;
  }, [location]);

  useEffect(() => {
    const handleReturn = async () => {
      // OXPAY Params
      const oxapayStatus = getParam('status') || getParam('pay_status'); 
      const oxapayOrderId = getParam('order_id') || getParam('trackId');

      // CASHFREE Params
      const cashfreeOrderId = getParam('order_id'); 

      let provider: 'OXPAY' | 'CASHFREE' | null = null;
      let orderIdToVerify = null;

      // Prioritize Cashfree for UPI then Oxapay for Crypto
      if (cashfreeOrderId && !oxapayStatus) {
          provider = 'CASHFREE';
          orderIdToVerify = cashfreeOrderId;
      } else if (oxapayOrderId) {
          provider = 'OXPAY';
          orderIdToVerify = oxapayOrderId;
      }

      if (provider && orderIdToVerify && !verifyingPayment) {
        setVerifyingPayment(true);
        setVerificationMessage(null);

        const token = localStorage.getItem('jwt_token');
        if (!token) {
          setVerificationMessage({ type: 'error', text: 'Authentication token not found.' });
          setVerifyingPayment(false);
          return;
        }

        try {
          // If Oxapay is waiting, notify user but don't fail yet
          if (provider === 'OXPAY' && oxapayStatus === 'waiting') {
             setVerificationMessage({ type: 'error', text: 'Payment is still processing in the blockchain. Please check your history in a few minutes.' });
             setVerifyingPayment(false);
             return;
          }

          const response: ApiResponse<{ newCredits: number }> = await backendApi.verifyPaymentStatus(
            token, 
            orderIdToVerify, 
            provider
          );
          
          if (response.success) {
            setVerificationMessage({ type: 'success', text: `Success! ${response.data.newCredits - (user?.credits || 0)} Credits added to your balance.` });
            updateUserCredits(response.data.newCredits);
            
            // Clean up URL params after successful verification to prevent re-runs on refresh
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
          } else {
            // Only show message if it's an actual failure, not just "already verified"
            if (!response.message?.includes("Already completed")) {
                setVerificationMessage({ type: 'error', text: `Verification: ${response.message || 'Payment not detected yet.'}` });
            }
          }
        } catch (err) {
          console.error('Error verifying payment:', err);
          setVerificationMessage({ type: 'error', text: 'Connection lost during payment verification.' });
        } finally {
          setVerifyingPayment(false);
        }
      }
    };

    if (isAuthenticated && user && !authLoading) {
        handleReturn();
    }
  }, [isAuthenticated, user, authLoading, getParam, updateUserCredits, verifyingPayment]); 


  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loader message="Loading user profile..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-4">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400">Please log in to view your profile.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 min-h-[calc(100vh-160px)]">
      {/* Payment Verification Status Notification */}
      <AnimatePresence>
        {(verifyingPayment || verificationMessage) && (
          <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="w-full max-w-xl mb-6"
          >
             {verifyingPayment && (
                 <GlassCard className="p-4 text-center flex items-center justify-center bg-accent/20 border-accent/50">
                     <Loader size="sm" color="text-accent" className="mr-3" />
                     <p className="text-accent font-semibold">Verifying your recent payment...</p>
                 </GlassCard>
             )}
             {verificationMessage && !verifyingPayment && (
                 <GlassCard className={`p-4 text-center flex items-center justify-center ${verificationMessage.type === 'success' ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                     <p className={`font-semibold ${verificationMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                         {verificationMessage.text}
                     </p>
                     <button 
                        onClick={() => setVerificationMessage(null)} 
                        className="ml-4 text-sm underline hover:no-underline opacity-70 hover:opacity-100"
                     >
                        Dismiss
                     </button>
                 </GlassCard>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl w-full"
      >
        <GlassCard className="p-6 md:p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-darkText dark:text-lightText mb-4">
            Hello, {user.name}!
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            Manage your account and view your generation balance.
          </p>

          <div className="grid grid-cols-1 gap-4 mb-8 text-left">
            <div className="p-4 rounded-xl bg-white/5 border border-gray-700/30 flex items-center">
              <svg className="h-6 w-6 text-accent mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Name</p>
                <p className="text-lg font-medium text-darkText dark:text-lightText">{user.name}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-white/5 border border-gray-700/30 flex items-center">
              <svg className="h-6 w-6 text-accent mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Email</p>
                <p className="text-lg font-medium text-darkText dark:text-lightText break-all">{user.email}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-accent/10 border border-accent/30 flex items-center">
              <svg className="h-6 w-6 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.459 4.218A9.993 9.006 0 0110 18a9.994 9.994 0 01-5.541-1.782l-.894.894a1 1 0 11-1.414-1.414l.894-.894A8 8 0 1014.541 15.782l.894.894a1 1 0 01-1.414 1.414l-.894-.894zM7 6a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1zm-.707 3.293a1 1 0 00-1.414 0l-1 1a1 1 0 101.414 1.414l1-1a1 1 0 000-1.414zM16 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-1.707-.293a1 1 0 00-1.414-1.414l-1 1a1 1 0 101.414 1.414l1-1z"></path></svg>
              <div>
                <p className="text-xs text-yellow-500 uppercase font-bold tracking-wider">Current Balance</p>
                <p className="text-2xl font-extrabold text-darkText dark:text-lightText">{user.credits} Credits</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/generator')}>
              Start Creating Images
            </Button>
            <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary" size="md" onClick={() => navigate('/credits')}>
                  Buy Credits
                </Button>
                <Button variant="outline" size="md" onClick={() => navigate('/my-payments')}>
                  Payment History
                </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
