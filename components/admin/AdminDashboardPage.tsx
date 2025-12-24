// components/admin/AdminDashboardPage.tsx
import React, { useEffect, useState } from 'react';
import AdminDashboardLayout from './AdminDashboardLayout';
import GlassCard from '../ui/GlassCard';
import Loader from '../ui/Loader';
import { useAuth } from '../../hooks/useAuth';
import { backendApi } from '../../services/backendApi';
import { User, ApiResponse, PaymentRequest } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';

const AdminDashboardPage: React.FC = () => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [pendingPayments, setPendingPayments] = useState<number>(0);
  const [totalCreditsDistributed, setTotalCreditsDistributed] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [globalNotice, setGlobalNotice] = useState<string>(''); // Existing global notice
  const [globalNoticeLoading, setGlobalNoticeLoading] = useState<boolean>(false);
  const [globalNoticeError, setGlobalNoticeError] = useState<string | null>(null);
  const [globalNoticeSuccess, setGlobalNoticeSuccess] = useState<string | null>(null);

  const [creditsPageNotice, setCreditsPageNotice] = useState<string>(''); // New credits page notice
  const [creditsNoticeLoading, setCreditsNoticeLoading] = useState<boolean>(false);
  const [creditsNoticeError, setCreditsNoticeError] = useState<string | null>(null);
  const [creditsNoticeSuccess, setCreditsNoticeSuccess] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !user?.isAdmin) {
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
        // Fetch users
        const usersResponse: ApiResponse<User[]> = await backendApi.getAllUsers(token);
        if (usersResponse.success) {
          setTotalUsers(usersResponse.data.length);
        } else {
          setError(usersResponse.message);
        }

        // Fetch payments
        const paymentsResponse: ApiResponse<PaymentRequest[]> = await backendApi.getAllPaymentRequests(token);
        if (paymentsResponse.success) {
          const pending = paymentsResponse.data.filter(p => p.status === 'pending').length;
          setPendingPayments(pending);

          const approvedPayments = paymentsResponse.data.filter(p => p.status === 'approved');
          const totalCredits = approvedPayments.reduce((sum, p) => {
             const creditsMatch = p.plan.match(/(\d+) Credits/);
             return sum + (creditsMatch ? parseInt(creditsMatch[1], 10) : 0);
          }, 0);
          setTotalCreditsDistributed(totalCredits);

        } else {
          setError(paymentsResponse.message);
        }

        // Fetch global notice
        const globalNoticeResponse: ApiResponse<string> = await backendApi.getGlobalNotice();
        if (globalNoticeResponse.success) {
          setGlobalNotice(globalNoticeResponse.data);
        } else {
          setGlobalNoticeError(globalNoticeResponse.message || 'Failed to fetch global notice.');
        }

        // Fetch credits page notice
        const creditsPageNoticeResponse: ApiResponse<string> = await backendApi.getCreditsPageNotice();
        if (creditsPageNoticeResponse.success) {
          setCreditsPageNotice(creditsPageNoticeResponse.data);
        } else {
          setCreditsNoticeError(creditsPageNoticeResponse.message || 'Failed to fetch credits page notice.');
        }

      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isAuthenticated && user?.isAdmin) {
      fetchData();
    }
  }, [isAuthenticated, user, authLoading]);

  const handleSaveGlobalNotice = async () => {
    setGlobalNoticeLoading(true);
    setGlobalNoticeError(null);
    setGlobalNoticeSuccess(null);

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setGlobalNoticeError('Authentication token not found.');
      setGlobalNoticeLoading(false);
      return;
    }

    try {
      const response: ApiResponse<string> = await backendApi.setGlobalNotice(token, globalNotice);
      if (response.success) {
        setGlobalNoticeSuccess(response.message);
      } else {
        setGlobalNoticeError(response.message || 'Failed to save global notice.');
      }
    } catch (err) {
      console.error('Error saving global notice:', err);
      setGlobalNoticeError('An unexpected error occurred while saving global notice.');
    } finally {
      setGlobalNoticeLoading(false);
    }
  };

  const handleSaveCreditsPageNotice = async () => {
    setCreditsNoticeLoading(true);
    setCreditsNoticeError(null);
    setCreditsNoticeSuccess(null);

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setCreditsNoticeError('Authentication token not found.');
      setCreditsNoticeLoading(false);
      return;
    }

    try {
      const response: ApiResponse<string> = await backendApi.setCreditsPageNotice(token, creditsPageNotice);
      if (response.success) {
        setCreditsNoticeSuccess(response.message);
      } else {
        setCreditsNoticeError(response.message || 'Failed to save credits page notice.');
      }
    } catch (err) {
      console.error('Error saving credits page notice:', err);
      setCreditsNoticeError('An unexpected error occurred while saving credits page notice.');
    } finally {
      setCreditsNoticeLoading(false);
    }
  };


  if (authLoading || loading) {
    return (
      <AdminDashboardLayout title="Admin Dashboard">
        <Loader message="Loading admin data..." className="py-10" />
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout title="Admin Dashboard">
        <p className="text-red-500 text-center py-10">{error}</p>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <GlassCard className="text-center p-6">
          <h3 className="text-xl font-semibold text-darkText dark:text-lightText mb-2">Total Users</h3>
          <p className="text-5xl font-bold text-accent">{totalUsers}</p>
        </GlassCard>
        <GlassCard className="text-center p-6">
          <h3 className="text-xl font-semibold text-darkText dark:text-lightText mb-2">Pending Payments</h3>
          <p className="text-5xl font-bold text-yellow-500">{pendingPayments}</p>
        </GlassCard>
        <GlassCard className="text-center p-6">
          <h3 className="text-xl font-semibold text-darkText dark:text-lightText mb-2">Credits Distributed</h3>
          <p className="text-5xl font-bold text-blue-500">{totalCreditsDistributed}</p>
        </GlassCard>
      </div>

      {/* Global Announcement / Notice Editor */}
      <GlassCard className="p-6 md:p-8 mt-8 mb-8">
        <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-4">
          Global Announcement / Notice
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          This message will be displayed at the top of the landing page for all users.
        </p>
        <div className="space-y-4">
          <textarea
            id="global-notice"
            className={`w-full p-3 bg-white bg-opacity-5 dark:bg-gray-800 dark:bg-opacity-20 backdrop-filter backdrop-blur-sm
              border border-gray-700 dark:border-gray-500 rounded-xl
              text-darkText dark:text-lightText placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent
              transition-all duration-300
              ${globalNoticeError ? 'border-red-500 focus:ring-red-500' : ''}`}
            rows={5}
            placeholder="Enter your global announcement or notice here..."
            value={globalNotice}
            onChange={(e) => setGlobalNotice(e.target.value)}
            disabled={globalNoticeLoading}
          ></textarea>
          {globalNoticeError && <p className="text-red-500 text-sm">{globalNoticeError}</p>}
          {globalNoticeSuccess && <p className="text-green-500 text-sm">{globalNoticeSuccess}</p>}
          <Button
            onClick={handleSaveGlobalNotice}
            loading={globalNoticeLoading}
            className="w-full justify-center mt-4"
          >
            Save Global Notice
          </Button>
        </div>
      </GlassCard>

      {/* Credits Page Announcement / Notice Editor */}
      <GlassCard className="p-6 md:p-8 mt-8">
        <h2 className="text-2xl font-bold text-darkText dark:text-lightText mb-4">
          Credits Page Announcement
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          This message will be displayed at the top of the "Credits" page for all users.
        </p>
        <div className="space-y-4">
          <textarea
            id="credits-page-notice"
            className={`w-full p-3 bg-white bg-opacity-5 dark:bg-gray-800 dark:bg-opacity-20 backdrop-filter backdrop-blur-sm
              border border-gray-700 dark:border-gray-500 rounded-xl
              text-darkText dark:text-lightText placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent
              transition-all duration-300
              ${creditsNoticeError ? 'border-red-500 focus:ring-red-500' : ''}`}
            rows={5}
            placeholder="Enter your announcement for the Credits page here..."
            value={creditsPageNotice}
            onChange={(e) => setCreditsPageNotice(e.target.value)}
            disabled={creditsNoticeLoading}
          ></textarea>
          {creditsNoticeError && <p className="text-red-500 text-sm">{creditsNoticeError}</p>}
          {creditsNoticeSuccess && <p className="text-green-500 text-sm">{creditsNoticeSuccess}</p>}
          <Button
            onClick={handleSaveCreditsPageNotice}
            loading={creditsNoticeLoading}
            className="w-full justify-center mt-4"
          >
            Save Credits Page Announcement
          </Button>
        </div>
      </GlassCard>

      <p className="text-gray-500 dark:text-gray-400 text-sm mt-8 text-center">
        This dashboard provides an overview of key platform metrics.
      </p>
    </AdminDashboardLayout>
  );
};

export default AdminDashboardPage;