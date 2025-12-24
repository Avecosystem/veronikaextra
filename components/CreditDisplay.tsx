// components/CreditDisplay.tsx
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import GlassCard from './ui/GlassCard';

const CreditDisplay: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (!isAuthenticated || loading || !user) {
    return null; // Don't render if not authenticated or user data is loading/missing
  }

  return (
    <GlassCard className="p-2 text-sm flex items-center space-x-2">
      <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.459 4.218A9.993 9.006 0 0110 18a9.994 9.994 0 01-5.541-1.782l-.894.894a1 1 0 11-1.414-1.414l.894-.894A8 8 0 1014.541 15.782l.894.894a1 1 0 01-1.414 1.414l-.894-.894zM7 6a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1zm-.707 3.293a1 1 0 00-1.414 0l-1 1a1 1 0 101.414 1.414l1-1a1 1 0 000-1.414zM16 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-1.707-.293a1 1 0 00-1.414-1.414l-1 1a1 1 0 101.414 1.414l1-1z"></path></svg>
      <span className="text-darkText dark:text-lightText font-bold">{user.credits} Credits</span>
    </GlassCard>
  );
};

export default CreditDisplay;