
// components/CreditsPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { CREDIT_PLANS } from '../constants';
import Button from './ui/Button';
import GlassCard from './ui/GlassCard';
import Loader from './ui/Loader';
import { backendApi } from '../services/backendApi';
import { ApiResponse, CreditPlan } from '../types';
import Input from './ui/Input';

const CreditsPage: React.FC = () => {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [availableCreditPlans, setAvailableCreditPlans] = useState<CreditPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<{ id: number; credits: number; price: number; usdValue: number; inrValue: number } | null>(null);
  const [globalNotice, setGlobalNotice] = useState<string>('');
  const [creditsPageNotice, setCreditsPageNotice] = useState<string>('');
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Payment State
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [showPhoneInput, setShowPhoneInput] = useState<boolean>(false);

  const isIndianUser = user?.country === 'India';
  const currencySymbol = isIndianUser ? '₹' : '$';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const globalResponse = await backendApi.getGlobalNotice();
        if (globalResponse.success) setGlobalNotice(globalResponse.data);
        
        const creditsPageResponse = await backendApi.getCreditsPageNotice();
        if (creditsPageResponse.success) setCreditsPageNotice(creditsPageResponse.data);

        const plansResponse = await backendApi.getAvailableCreditPlans(); 
        if (plansResponse.success) {
          setAvailableCreditPlans(plansResponse.data);
        } else {
          setAvailableCreditPlans(CREDIT_PLANS);
        }
      } catch (err) {
        console.error('Error fetching page data:', err);
        setNoticeError('Failed to load page data.');
        setAvailableCreditPlans(CREDIT_PLANS);
      }
    };
    fetchData();
  }, []);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loader message="Fetching your balance..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <GlassCard className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-4">Login Required</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You need to be signed in to purchase credits and fuel your imagination.</p>
          <Button onClick={() => window.location.href = '#/login'}>Go to Login</Button>
        </GlassCard>
      </div>
    );
  }

  const getPlanPrice = (plan: CreditPlan) => {
    return isIndianUser ? plan.inrPrice : plan.usdPrice;
  };

  const handlePlanSelect = (plan: CreditPlan) => {
    const price = getPlanPrice(plan);
    setSelectedPlan({
      id: plan.id,
      credits: plan.credits,
      price: price,
      usdValue: plan.usdPrice,
      inrValue: plan.inrPrice,
    });
    setError(null);
    setShowPhoneInput(false);
  };

  const initiateUpiPayment = async () => {
    if (!selectedPlan || !user) return;
    
    if (!customerPhone || customerPhone.length < 10) {
        setError("Please enter a valid 10-digit phone number.");
        return;
    }

    setRedirecting(true);
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        setError("Session expired. Please re-login.");
        setRedirecting(false);
        return;
    }

    // Correctly formatting return URL for Cashfree + HashRouter
    // We want it to redirect back to /profile so the verify logic kicks in
    const returnUrl = `${window.location.origin}${window.location.pathname}#/profile`;

    try {
        const response = await backendApi.submitUpiPaymentIntent(
            token, 
            `${selectedPlan.credits} Credits`,
            selectedPlan.credits,
            selectedPlan.inrValue,
            customerPhone,
            returnUrl
        );

        if (response.success) {
            if (response.data.paymentLink) {
                // Automatic redirection to Cashfree gateway via Link
                window.location.href = response.data.paymentLink;
            } else if (response.data.paymentSessionId) {
                // Initialize Cashfree SDK for seamless redirection
                // @ts-ignore
                const cashfree = new window.Cashfree({ mode: "production" });
                cashfree.checkout({
                    paymentSessionId: response.data.paymentSessionId,
                    returnUrl: returnUrl,
                    redirectTarget: "_self" // Redirects the same tab
                });
            } else {
                 setError("Payment initialized but no link received. Please try again.");
                 setRedirecting(false);
            }
        } else {
            setError(response.message || "Payment gateway connection failed.");
            setRedirecting(false);
        }

    } catch (e) {
        console.error(e);
        setError("Server timed out. Please try again.");
        setRedirecting(false);
    }
  };

  const handleCryptoPayment = async () => {
    if (!selectedPlan || !user) return;
    setRedirecting(true);
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError('Session expired.');
      setRedirecting(false);
      return;
    }

    const orderId = `${user.id}-${selectedPlan.credits}-${Date.now()}`;
    const returnUrl = `${window.location.origin}${window.location.pathname}#/profile`;

    try {
      const intentResponse = await backendApi.submitCryptoPaymentIntent(
        token,
        orderId,
        selectedPlan.credits,
        selectedPlan.usdValue,
        returnUrl
      );

      if (intentResponse.success && intentResponse.data?.paymentUrl) {
          // Automatic redirection to Oxapay
          window.location.href = intentResponse.data.paymentUrl;
      } else {
          setError(intentResponse.message || 'Crypto gateway unavailable.');
          setRedirecting(false);
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error during crypto payment setup.');
      setRedirecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 min-h-[calc(100vh-160px)] animate-fade-in">
      {(globalNotice || creditsPageNotice || noticeError) && (
        <div className="w-full max-w-4xl mb-8 space-y-4">
            {globalNotice && (
                <GlassCard className="p-4 text-center text-darkText dark:text-lightText bg-accent/20 border-accent/50">
                    <p className="font-semibold text-lg">{globalNotice}</p>
                </GlassCard>
            )}
            {creditsPageNotice && (
                <GlassCard className="p-4 text-center text-darkText dark:text-lightText bg-blue-500/20 border-blue-500/50">
                    <p className="font-semibold text-lg">{creditsPageNotice}</p>
                </GlassCard>
            )}
            {noticeError && (
                <GlassCard className="p-4 text-center text-red-500 bg-red-500/10 border-red-500/50">
                    <p className="font-semibold text-lg">{noticeError}</p>
                </GlassCard>
            )}
        </div>
      )}

      <GlassCard className="max-w-4xl w-full p-6 md:p-8 text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-darkText dark:text-lightText mb-4">
          Fuel Your Imagination
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
          Your balance: <span className="text-accent font-bold">{user.credits} Credits</span>. Choose a plan to continue generating.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {availableCreditPlans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <GlassCard
                className={`p-6 flex flex-col items-center cursor-pointer transition-all duration-300 h-full border-2
                            ${selectedPlan?.id === plan.id ? 'border-accent bg-accent/10 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'border-transparent hover:border-accent/30'}`}
                onClick={() => handlePlanSelect(plan)}
              >
                <div className="bg-accent/20 p-3 rounded-full mb-4">
                    <svg className="h-8 w-8 text-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.459 4.218A9.993 9.006 0 0110 18a9.994 9.994 0 01-5.541-1.782l-.894.894a1 1 0 11-1.414-1.414l.894-.894A8 8 0 1014.541 15.782l.894.894a1 1 0 01-1.414 1.414l-.894-.894zM7 6a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1zm-.707 3.293a1 1 0 00-1.414 0l-1 1a1 1 0 101.414 1.414l1-1a1 1 0 000-1.414zM16 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-1.707-.293a1 1 0 00-1.414-1.414l-1 1a1 1 0 101.414 1.414l1-1z"></path></svg>
                </div>
                <p className="text-4xl font-black text-darkText dark:text-lightText mb-1">{plan.credits}</p>
                <p className="text-sm font-bold text-accent uppercase tracking-widest mb-4">Credits</p>
                <p className="text-2xl font-bold text-gray-400">{currencySymbol}{getPlanPrice(plan).toFixed(2)}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedPlan && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 pt-8 border-t border-gray-700/30 overflow-hidden"
            >
              <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-6">
                Complete Your Purchase
              </h2>
              
              {error && <p className="text-red-500 bg-red-500/10 p-3 rounded-lg mb-6 animate-pulse">{error}</p>}
              {redirecting && <Loader message="Connecting to secure gateway..." className="mb-6" />}

              {!showPhoneInput ? (
                  <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-lg mx-auto">
                    <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={() => setShowPhoneInput(true)}
                        className="w-full flex items-center justify-center space-x-2"
                        disabled={redirecting}
                    >
                        <span>Pay with UPI</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </Button>
                    
                    <Button 
                        variant="download"
                        size="lg" 
                        onClick={handleCryptoPayment}
                        className="w-full flex items-center justify-center space-x-2"
                        loading={redirecting}
                    >
                        <span>Pay with Crypto</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2 3 .895 3 2s-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L15 10a3 3 0 11-6 0c0-.536.211-1.028.592-1.5z" /></svg>
                    </Button>
                  </div>
              ) : (
                 <div className="max-w-xs mx-auto animate-fade-in p-6 bg-white/5 rounded-2xl border border-gray-700/50">
                     <p className="text-sm mb-4 text-gray-400">Cashfree requires your phone number to initiate UPI transactions.</p>
                     <Input 
                        id="phone"
                        type="tel"
                        label="Phone Number"
                        placeholder="10-digit mobile number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="mb-6"
                        autoFocus
                     />
                     <div className="flex flex-col gap-3">
                         <Button variant="primary" onClick={initiateUpiPayment} loading={redirecting} className="w-full">
                            Proceed to Pay {currencySymbol}{selectedPlan.price.toFixed(2)}
                         </Button>
                         <Button variant="ghost" onClick={() => setShowPhoneInput(false)} disabled={redirecting}>
                            Cancel
                         </Button>
                     </div>
                 </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default CreditsPage;
