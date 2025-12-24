// components/ui/GlassCard.tsx
import React, { ReactNode, HTMLAttributes } from 'react'; // Import HTMLAttributes

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> { // Extend with HTMLAttributes<HTMLDivElement>
  children: ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, ...props }) => { // Destructure ...props
  return (
    <div
      className={`relative p-6 rounded-2xl
                 bg-gradient-to-br from-gray-800/20 to-gray-700/10 dark:from-gray-100/20 dark:to-gray-200/10
                 backdrop-filter backdrop-blur-sm border border-gray-700/50 dark:border-gray-300/50
                 shadow-glass-dark dark:shadow-glass-light
                 ${className}`}
      {...props} // Pass all other props to the div
    >
      {children}
    </div>
  );
};

export default GlassCard;