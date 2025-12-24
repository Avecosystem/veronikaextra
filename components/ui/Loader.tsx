// components/ui/Loader.tsx
import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', color = 'text-gray-400', className = '', message }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-t-2 border-gray-700 dark:border-gray-300 ${color} ${sizeClasses[size]}`}
        style={{ borderTopColor: color }}
      ></div>
      {message && <p className="mt-2 text-sm text-darkText dark:text-lightText">{message}</p>}
    </div>
  );
};

export default Loader;
