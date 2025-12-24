// components/admin/AdminPaymentsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import AdminDashboardLayout from './AdminDashboardLayout';
import GlassCard from '../ui/GlassCard';
import Loader from '../ui/Loader';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { backendApi } from '../../services/backendApi';
import { UnifiedPaymentTransaction, ApiResponse } from '../../types';
import { AnimatePresence, motion } from 'framer-motion';

const AdminPaymentsPage: React.FC = () => {
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();
  const [unifiedTransactions, setUnifiedTransactions] = useState<UnifiedPaymentTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  // Confirmation Modal State
  const [confirmation, setConfirmation] = useState<{ type: 'approve' | 'reject', id: number } | null>(null);

  const fetchAllTransactions = useCallback(async () => {
    if (!isAuthenticated || !authUser?.isAdmin) {
      setLoading(false);
      setError('Unauthorized access.');
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
        backendApi.getAllPaymentRequests(token),
        backendApi.getAllCryptoPaymentTransactions(token),
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
            currency: 'INR', // Assuming UPI is always INR
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
      // Sort by createdAt descending
      const sortedTransactions = combinedTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUnifiedTransactions(sortedTransactions);

    } catch (err) {
      console.error('Error fetching all payment transactions:', err);
      setError('Failed to load payment data.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authUser]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser?.isAdmin) {
      fetchAllTransactions();
    }
  }, [authLoading, isAuthenticated, authUser, fetchAllTransactions]);

  // Effect to clear messages
  useEffect(() => {
    if (actionSuccess || actionError) {
      const timer = setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

  const executeAction = async () => {
    if (!confirmation) return;

    const { type, id: requestId } = confirmation;
    setConfirmation(null); // Close modal
    setActionLoadingId(requestId);
    setActionError(null);
    setActionSuccess(null);

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setActionError('Authentication token not found.');
      setActionLoadingId(null);
      return;
    }

    try {
      let response: ApiResponse<{ message: string }>;
      if (type === 'approve') {
        response = await backendApi.approvePaymentRequest(token, requestId);
      } else {
        response = await backendApi.rejectPaymentRequest(token, requestId);
      }

      if (response.success) {
        setActionSuccess(response.data.message);
        await fetchAllTransactions(); // Refresh list
      } else {
        setActionError(response.message || `Failed to ${type} request.`);
      }
    } catch (err) {
      console.error(`Error ${type}ing payment:`, err);
      setActionError(`An unexpected error occurred while processing.`);
    } finally {
      setActionLoadingId(null);
    }
  };

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
      <AdminDashboardLayout title="Payment Management">
        <Loader message="Loading payment requests..." className="py-10" />
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout title="Payment Management">
        <p className="text-red-500 text-center py-10">{error}</p>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="Payment Management">
      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="w-full max-w-md"
            >
                <GlassCard className="p-6 border border-gray-500/50 shadow-2xl bg-darkBg/95 dark:bg-lightBg/95">
                  <h3 className="text-xl font-bold text-darkText dark:text-lightText mb-4">
                    Confirm {confirmation.type === 'approve' ? 'Approval' : 'Rejection'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {confirmation.type === 'approve'
                      ? 'Are you sure you want to APPROVE this payment? This will add credits to the user account.'
                      : 'Are you sure you want to REJECT this payment? No credits will be added.'}
                  </p>
                  <div className="flex justify-end space-x-3">
                    <Button variant="secondary" onClick={() => setConfirmation(null)}>
                      Cancel
                    </Button>
                    <Button 
                        variant={confirmation.type === 'approve' ? 'primary' : 'danger'} 
                        onClick={executeAction}
                    >
                      Confirm {confirmation.type === 'approve' ? 'Approve' : 'Reject'}
                    </Button>
                  </div>
                </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-lg mx-auto mb-4"
          >
            <GlassCard className="p-3 text-center bg-red-500/20 border-red-500/50">
              <p className="font-semibold text-red-500">{actionError}</p>
            </GlassCard>
          </motion.div>
        )}
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-lg mx-auto mb-4"
          >
            <GlassCard className="p-3 text-center bg-green-500/20 border-green-500/50">
              <p className="font-semibold text-green-500">{actionSuccess}</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {unifiedTransactions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-10">No payment requests or transactions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 dark:divide-gray-300">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Plan/Credits
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ref ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 dark:divide-gray-200">
              {unifiedTransactions.map((tx) => {
                const isActionDisabled = actionLoadingId !== null;
                return (
                <tr key={`${tx.type}-${tx.id}`} className="text-darkText dark:text-lightText hover:bg-gray-800/20 dark:hover:bg-gray-200/20 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${tx.type === 'upi' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium break-words max-w-[150px]">
                    {tx.userName} <br/> <span className="text-xs text-gray-500">{tx.userEmail}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.planOrCredits}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {tx.currency === 'INR' ? '₹' : '$'}{tx.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-xs">
                    {tx.type === 'upi' ? tx.utrCode : tx.orderId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(tx.status)}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {tx.type === 'upi' && tx.status === 'pending' ? (
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setConfirmation({ type: 'approve', id: tx.id }); }}
                          disabled={isActionDisabled} 
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setConfirmation({ type: 'reject', id: tx.id }); }}
                          disabled={isActionDisabled} 
                        >
                          Reject
                        </Button>
                        {actionLoadingId === tx.id && <span className="animate-spin ml-2">↻</span>}
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">
                         {/* No text for automated/completed transactions to keep UI clean */}
                         {tx.type === 'crypto' ? '' : '-'}
                      </span>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}
    </AdminDashboardLayout>
  );
};

export default AdminPaymentsPage;