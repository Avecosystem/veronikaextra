// components/ImageCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageResult } from '../types';
import Button from './ui/Button';
import GlassCard from './ui/GlassCard';

interface ImageCardProps {
  image: ImageResult;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    setIsDownloading(true);
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `VERONIKAextra-image-${image.id}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsDownloading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="h-full" // Ensure motion.div takes full height
    >
      <GlassCard className="flex flex-col items-center p-4 h-full">
        <div className="w-full aspect-square bg-gray-700/50 dark:bg-gray-300/50 rounded-lg overflow-hidden flex items-center justify-center mb-4">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            src={image.url}
            alt={image.prompt}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <p className="text-sm text-center text-gray-400 dark:text-gray-600 mb-4 line-clamp-2">{image.prompt}</p>
        <Button variant="download" onClick={handleDownload} loading={isDownloading} className="mt-auto w-full">
          Download
        </Button>
      </GlassCard>
    </motion.div>
  );
};

export default ImageCard;