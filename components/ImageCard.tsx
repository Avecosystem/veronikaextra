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
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  // Function to apply watermark and return data URL
  const applyWatermark = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Essential for external URLs
      img.src = imageUrl;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
        }

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Watermark settings
        const text = "VERONIKAextra";
        const fontSize = Math.max(16, img.width * 0.04); // Dynamic font size
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        
        // Shadow for better visibility on light images
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Text Color: Subtle ash/light gray
        ctx.fillStyle = "rgba(220, 220, 220, 0.8)";
        
        // Position: Bottom right with padding
        const padding = img.width * 0.02;
        ctx.fillText(text, img.width - padding, img.height - padding);

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };

      img.onerror = (e) => reject(e);
    });
  };

  // Process image on load to display with watermark immediately (optional, but requested "always remain")
  // For now, we will apply it dynamically on download, but to satisfy "remains on image", 
  // we should ideally display the watermarked version too.
  
  React.useEffect(() => {
    let isMounted = true;
    applyWatermark(image.url).then(url => {
        if (isMounted) setProcessedImageUrl(url);
    }).catch(err => {
        console.error("Watermark failed:", err);
        // Fallback to original if canvas fails (e.g. CORS issues)
        if (isMounted) setProcessedImageUrl(image.url);
    });
    return () => { isMounted = false; };
  }, [image.url]);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
        const link = document.createElement('a');
        // Use processed URL if available, otherwise try to process now
        link.href = processedImageUrl || await applyWatermark(image.url);
        link.download = `VERONIKAextra-image-${image.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Download failed:", e);
        // Last resort fallback
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `VERONIKAextra-image-${image.id}.jpg`;
        link.target = "_blank"; // Open in new tab if download fails
        link.click();
    } finally {
        setIsDownloading(false);
    }
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
            src={processedImageUrl || image.url}
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