// components/AuthLayout.tsx
import React, { ReactNode } from 'react';
import GlassCard from './ui/GlassCard';

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)] py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <GlassCard className="max-w-md w-full space-y-8 p-8 md:p-10">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-darkText dark:text-lightText">
            {title}
          </h2>
        </div>
        {children}
      </GlassCard>
    </div>
  );
};

export default AuthLayout;
