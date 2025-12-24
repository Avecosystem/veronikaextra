
// components/admin/AdminContactPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import AdminDashboardLayout from './AdminDashboardLayout';
import Loader from '../ui/Loader';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { backendApi } from '../../services/backendApi';
import { ContactInfo, ApiResponse } from '../../types';

const AdminContactPage: React.FC = () => {
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email1: '',
    email2: '',
    location: '',
    phone: '',
    note: ''
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchContactInfo = useCallback(async () => {
    if (!isAuthenticated || !authUser?.isAdmin) {
      setLoading(false);
      setError('Unauthorized access.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch public contact info, no token needed for read, but we are admin so it's fine
      const response: ApiResponse<ContactInfo> = await backendApi.getContactInfo();
      if (response.success) {
        setContactInfo(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error fetching contact info:', err);
      setError('Failed to load contact data.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authUser]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser?.isAdmin) {
      fetchContactInfo();
    }
  }, [authLoading, isAuthenticated, authUser, fetchContactInfo]);

  const handleChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem('jwt_token');
    if (!token) {
        setError("Auth token missing.");
        setSaving(false);
        return;
    }

    try {
        const response: ApiResponse<ContactInfo> = await backendApi.updateContactInfo(token, contactInfo);
        if (response.success) {
            setSuccess(response.message || "Contact info saved!");
            setContactInfo(response.data);
        } else {
            setError(response.message || "Failed to save.");
        }
    } catch (e) {
        console.error(e);
        setError("An unexpected error occurred.");
    } finally {
        setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminDashboardLayout title="Contact Management">
        <Loader message="Loading contact info..." className="py-10" />
      </AdminDashboardLayout>
    );
  }

  if (error && !contactInfo) {
    return (
      <AdminDashboardLayout title="Contact Management">
        <p className="text-red-500 text-center py-10">{error}</p>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="Contact Management">
      <div className="space-y-6 max-w-2xl">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
            Update the contact details displayed on the "Get in Touch" page.
        </p>

        {/* Email 1 */}
        <div className="relative">
            <Input 
                id="email1"
                label="Primary Email"
                value={contactInfo.email1}
                onChange={(e) => handleChange('email1', e.target.value)}
                placeholder="primary@example.com"
            />
             <div className="absolute right-3 top-9 text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
             </div>
        </div>

        {/* Email 2 */}
        <div className="relative">
            <Input 
                id="email2"
                label="Secondary Email (Optional)"
                value={contactInfo.email2}
                onChange={(e) => handleChange('email2', e.target.value)}
                placeholder="secondary@example.com"
            />
            <div className="absolute right-3 top-9 text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
             </div>
        </div>

        {/* Location */}
        <div className="relative">
            <Input 
                id="location"
                label="Location"
                value={contactInfo.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="City, Country"
            />
             <div className="absolute right-3 top-9 text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
             </div>
        </div>

        {/* Phone */}
        <div className="relative">
            <Input 
                id="phone"
                label="Phone Number"
                value={contactInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 234 567 890"
            />
             <div className="absolute right-3 top-9 text-gray-400 pointer-events-none">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
             </div>
        </div>

        {/* Note */}
        <div>
            <label className="block text-sm font-medium text-darkText dark:text-lightText mb-1">
                Custom Note (Displayed to all users)
            </label>
            <textarea
                className="w-full p-3 bg-white bg-opacity-5 dark:bg-gray-800 dark:bg-opacity-20 backdrop-filter backdrop-blur-sm
                          border border-gray-700 dark:border-gray-500 rounded-xl
                          text-darkText dark:text-lightText placeholder-gray-500
                          focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent
                          transition-all duration-300"
                rows={4}
                value={contactInfo.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="Enter a message for your users (e.g., 'We respond within 24 hours')..."
            />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <Button onClick={handleSave} loading={saving} className="w-full">
            Save Contact Details
        </Button>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminContactPage;
