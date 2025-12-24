// components/MyPaymentsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { backendApi } from '../services/backendApi';
import { ApiResponse, PaymentRequest, CryptoPaymentTransaction, UnifiedPaymentTransaction } from '../types';
import GlassCard from './ui/GlassCard';
import Loader from './ui/Loader';

const MyPaymentsPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<UnifiedPaymentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserTransactions = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      setError('Authentication required to view payment history.');
      return;
    }

    setLoading(true);
    setError(null);
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setError('Authentication token not found.');
      setLoading(false);
      return;
    }

    try {
      const [upiResponse, cryptoResponse] = await Promise.all([
        backendApi.getUserPaymentRequests(token),
        backendApi.getUserCryptoTransactions(token),
      ]);

      const upiTransactions: UnifiedPaymentTransaction[] = upiResponse.success
        ? upiResponse.data.map(req => ({
            type: 'upi',
            id: req.id,
            userId: req.userId,
            userName: req.userName,
            userEmail: req.userEmail,
            planOrCredits: req.plan,
            amount: req.amount,
            currency: 'INR',
            status: req.status,
            createdAt: req.createdAt,
            utrCode: req.utrCode,
            paymentDate: req.date,
            note: req.note,
          }))
        : [];

      const cryptoTransactions: UnifiedPaymentTransaction[] = cryptoResponse.success
        ? cryptoResponse.data.map(tx => ({
            type: 'crypto',
            id: tx.id,
            userId: tx.userId,
            userName: tx.userName,
            userEmail: tx.userEmail,
            planOrCredits: `${tx.credits} Credits (Crypto)`,
            amount: tx.amount,
            currency: tx.currency,
            status: tx.status,
            createdAt: tx.createdAt,
            orderId: tx.orderId,
            gateway: tx.gateway,
            completedAt: tx.completedAt,
          }))
        : [];

      const combinedTransactions = [...upiTransactions, ...cryptoTransactions];
      // Sort by createdAt descending (newest first)
      const sortedTransactions = combinedTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTransactions(sortedTransactions);

      if (!upiResponse.success) {
        console.error('Failed to fetch UPI requests:', upiResponse.message);
        // Only set error if no transactions could be fetched at all
        if (sortedTransactions.length === 0) setError(upiResponse.message);
      }
      if (!cryptoResponse.success) {
        console.error('Failed to fetch crypto transactions:', cryptoResponse.message);
        if (sortedTransactions.length === 0) setError(cryptoResponse.message);
      }

    } catch (err) {
      console.error('Error fetching user transactions:', err);
      setError('Failed to load your payment history. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchUserTransactions();
    }
  }, [authLoading, isAuthenticated, user, fetchUserTransactions]);

  const getStatusClasses = (status: UnifiedPaymentTransaction['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'approved':
      case 'completed': return 'bg-green-500/20 text-green-500';
      case 'rejected':
      case 'failed':
      case 'cancelled': return 'bg-red-500/20 text-red-500';
      default: return '';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <Loader message="Loading your payment history..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-4">Access Denied</h2>
          <p className="text-gray-500 dark:text-gray-400">Please log in to view your payment history.</p>
        </GlassCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-160px)]">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-4">Error</h2>
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 min-h-[calc(100vh-160px)] animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <GlassCard className="p-6 md:p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-darkText dark:text-lightText mb-4">
            My Payments History
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
            Here you can track all your credit purchases and their current status.
          </p>

          {transactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-10">No transactions found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700 dark:divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Credits/Plan
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Reference ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 dark:divide-gray-200">
                  {transactions.map((tx) => (
                    <tr key={`${tx.type}-${tx.id}`} className="text-darkText dark:text-lightText hover:bg-gray-800/20 dark:hover:bg-gray-200/20 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium max-w-[80px]">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${tx.type === 'upi' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}>
                          {tx.type === 'upi' ? 'UPI' : 'Crypto'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm break-words max-w-[120px]">{tx.planOrCredits}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[100px]">
                        {tx.currency === 'INR' ? '₹' : '$'}{tx.amount.toFixed(2)} {tx.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm break-words max-w-[180px]">
                        {tx.type === 'upi' ? tx.utrCode : tx.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[100px]">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm max-w-[100px]">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(tx.status)}`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default MyPaymentsPage;