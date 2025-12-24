// components/ui/Input.tsx
import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className="relative w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-darkText dark:text-lightText mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full p-3 bg-white bg-opacity-5 dark:bg-gray-800 dark:bg-opacity-20 backdrop-filter backdrop-blur-sm
          border border-gray-700 dark:border-gray-500 rounded-xl
          text-darkText dark:text-lightText placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent
          transition-all duration-300
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;