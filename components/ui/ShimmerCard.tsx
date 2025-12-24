// components/ui/ShimmerCard.tsx
import React from 'react';

interface ShimmerCardProps {
  className?: string;
}

const ShimmerCard: React.FC<ShimmerCardProps> = ({ className }) => {
  return (
    <div className={`relative overflow-hidden p-6 rounded-2xl
                    bg-gradient-to-br from-gray-800/20 to-gray-700/10 dark:from-gray-100/20 dark:to-gray-200/10
                    backdrop-filter backdrop-blur-sm border border-gray-700/50 dark:border-gray-300/50
                    shadow-glass-dark dark:shadow-glass-light
                    animate-fade-in
                    ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                      animate-[shimmer_1.5s_infinite_forwards_ease-in-out]"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-600/50 dark:bg-gray-400/50 rounded w-3/4"></div>
        <div className="h-4 bg-gray-600/50 dark:bg-gray-400/50 rounded w-full"></div>
        <div className="h-4 bg-gray-600/50 dark:bg-gray-400/50 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default ShimmerCard;

// Add this keyframe to your tailwind.config.js (already done in index.html for this project)
// keyframes: {
//   shimmer: {
//     '0%': { transform: 'translateX(-100%)' },
//     '100%': { transform: 'translateX(100%)' },
//   }
// },
// animation: {
//   shimmer: 'shimmer 1.5s infinite forwards ease-in-out',
// }
