// components/admin/AdminUsersPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import AdminDashboardLayout from './AdminDashboardLayout';
import GlassCard from '../ui/GlassCard';
import Loader from '../ui/Loader';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { backendApi } from '../../services/backendApi';
import { User, ApiResponse } from '../../types';
import { AnimatePresence, motion } from 'framer-motion';

const AdminUsersPage: React.FC = () => {
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [newCredits, setNewCredits] = useState<number>(0);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
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
      const response: ApiResponse<User[]> = await backendApi.getAllUsers(token);
      if (response.success) {
        setUsers(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user data.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authUser]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser?.isAdmin) {
      fetchUsers();
    }
  }, [authLoading, isAuthenticated, authUser, fetchUsers]);

  const handleEditCredits = (user: User) => {
    setEditingUserId(user.id);
    setNewCredits(user.credits);
    setEditError(null);
  };

  const handleSaveCredits = async (userId: number) => {
    setEditLoading(true);
    setEditError(null);
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setEditError('Authentication token not found.');
      setEditLoading(false);
      return;
    }

    try {
      const response: ApiResponse<User> = await backendApi.updateUserCreditsAdmin(token, userId, newCredits);
      if (response.success) {
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, credits: newCredits } : u));
        setEditingUserId(null);
        setNewCredits(0);
      } else {
        setEditError(response.message);
      }
    } catch (err) {
      console.error('Error updating credits:', err);
      setEditError('Failed to update credits.');
    } finally {
      setEditLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (deleteConfirmation === null) return;
    const userId = deleteConfirmation;
    setDeleteConfirmation(null); // Close modal

    setEditLoading(true);
    setEditError(null);
    
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      setEditError('Authentication token not found.');
      setEditLoading(false);
      return;
    }

    try {
      const response = await backendApi.deleteUser(token, userId);
      if (response.success) {
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      } else {
        setEditError(response.message);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setEditError('Failed to delete user.');
    } finally {
      setEditLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <AdminDashboardLayout title="User Management">
        <Loader message="Loading user data..." className="py-10" />
      </AdminDashboardLayout>
    );
  }

  if (error) {
    return (
      <AdminDashboardLayout title="User Management">
        <p className="text-red-500 text-center py-10">{error}</p>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout title="User Management">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmation !== null && (
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
                <GlassCard className="p-6 border border-red-500/30 shadow-2xl bg-darkBg/95 dark:bg-lightBg/95">
                  <h3 className="text-xl font-bold text-darkText dark:text-lightText mb-4">Confirm Deletion</h3>
                  <p className="text-gray-400 mb-6">
                    Are you sure you want to permanently delete this user? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <Button variant="secondary" onClick={() => setDeleteConfirmation(null)}>
                      Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteUser}>
                      Delete User
                    </Button>
                  </div>
                </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-6">
        <Input
          id="search-users"
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700 dark:divide-gray-300">
          <thead>
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Credits
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 dark:divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="text-darkText dark:text-lightText hover:bg-gray-800/20 dark:hover:bg-gray-200/20 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium break-words max-w-xs">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm break-words max-w-xs">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {editingUserId === user.id ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        id={`credits-${user.id}`}
                        type="number"
                        value={newCredits}
                        onChange={(e) => setNewCredits(parseInt(e.target.value))}
                        className="w-24 text-sm py-1"
                      />
                      <Button size="sm" onClick={() => handleSaveCredits(user.id)} loading={editLoading}>Save</Button>
                      <Button variant="secondary" size="sm" onClick={() => setEditingUserId(null)} disabled={editLoading}>Cancel</Button>
                    </div>
                  ) : (
                    <span className="flex items-center">
                      {user.credits}
                      <Button variant="ghost" size="sm" className="ml-2 p-1" onClick={() => handleEditCredits(user)}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </Button>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingUserId !== user.id && !user.isAdmin && (
                     <Button 
                        variant="danger" 
                        size="sm" 
                        className="ml-2" 
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirmation(user.id); }} 
                        disabled={editLoading}
                     >
                       Delete
                     </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {editError && <p className="text-red-500 text-sm mt-4 text-center">{editError}</p>}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminUsersPage;