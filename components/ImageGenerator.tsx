
// components/ImageGenerator.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { backendApi } from '../services/backendApi';
import { IMAGE_COST, BRAND_NAME } from '../constants'; // Import BRAND_NAME
import { ImageResult, ApiResponse } from '../types';
import Input from './ui/Input'; // Keep Input for general use if needed, but for prompt we use textarea
import Button from './ui/Button';
import ImageCard from './ImageCard';
import ShimmerCard from './ui/ShimmerCard';
import GlassCard from './ui/GlassCard';
import { motion } from 'framer-motion';
// import CreditDisplay from './CreditDisplay'; // CreditDisplay moved to Navbar and now removed
import Loader from './ui/Loader'; // Keep Loader as fallback

const ImageGenerator: React.FC = () => {
  const { user, isAuthenticated, updateUserCredits, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState<string>('');
  const [numberOfImages, setNumberOfImages] = useState<number>(1);
  const [generatedImages, setGeneratedImages] = useState<ImageResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [globalNotice, setGlobalNotice] = useState<string>('');
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Split BRAND_NAME for styling
  const brandNameParts = BRAND_NAME.split('extra');
  const veronikaPart = brandNameParts[0];
  const extraPart = 'extra';

  // Fetch global notice on component mount
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const response: ApiResponse<string> = await backendApi.getGlobalNotice();
        if (response.success) {
          setGlobalNotice(response.data);
        } else {
          setNoticeError(response.message || 'Failed to fetch global notice.');
        }
      } catch (err) {
        console.error('Error fetching global notice:', err);
        setNoticeError('An unexpected error occurred while fetching global notice.');
      }
    };
    fetchNotice();
  }, []);

  // Effect to handle scroll when images are generated
  useEffect(() => {
    if (!loading && generatedImages.length > 0 && scrollRef.current) {
        // "Scroll up" behavior: smooth scroll to the results section
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, generatedImages]);


  const handleGenerate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      setError('Please log in to generate images.');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    const requiredCredits = IMAGE_COST * numberOfImages;
    if (user.credits < requiredCredits) {
      setError(`Insufficient credits. You need ${requiredCredits} credits for ${numberOfImages} images.`);
      return;
    }

    setLoading(true);
    setGeneratedImages([]); // Clear previous images
    
    // Initial scroll to show loader area
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setError('Authentication token not found.');
        setLoading(false);
        return;
      }

      const response: ApiResponse<{ images: string[], newCredits: number }> = await backendApi.generateImage(token, prompt, numberOfImages);

      if (response.success) {
        const newImages: ImageResult[] = response.data.images.map((url, index) => ({
          id: `${Date.now()}-${index}`,
          url,
          prompt,
        }));
        setGeneratedImages(newImages);
        updateUserCredits(response.data.newCredits);
      } else {
        setError(response.message || 'Failed to generate images.');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError('An unexpected error occurred during image generation.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, prompt, numberOfImages, updateUserCredits]);

  const canGenerate = isAuthenticated && user && user.credits >= IMAGE_COST * numberOfImages && !loading && !authLoading;

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 min-h-[calc(100vh-160px)]">
      {/* Global Notice Display */}
      {(globalNotice || noticeError) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mb-8"
        >
          <GlassCard className={`p-4 text-center text-darkText dark:text-lightText ${noticeError ? 'bg-red-500/20 border-red-500/50' : 'bg-accent/20 border-accent/50'}`}>
            <p className="font-semibold text-lg">{noticeError || globalNotice}</p>
          </GlassCard>
        </motion.div>
      )}

      <GlassCard className="max-w-4xl w-full p-6 md:p-8 text-center animate-fade-in mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-darkText dark:text-lightText mb-4">
          <span>{veronikaPart}
            <span className="inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text bg-[length:200%_auto] animate-text-gradient-slow ml-0.5">
              {extraPart}
            </span>
          </span> Images
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
          Describe the image you want to create and let AI bring it to life.
        </p>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="relative w-full">
            <label htmlFor="image-prompt" className="sr-only">Image Prompt</label>
            <textarea
              id="image-prompt"
              placeholder="Enter your imagination... (e.g., a futuristic cyberpunk city in rain)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`w-full p-4 bg-white bg-opacity-5 dark:bg-gray-800 dark:bg-opacity-20 backdrop-filter backdrop-blur-sm
                border border-gray-700 dark:border-gray-500 rounded-xl
                text-lg text-darkText dark:text-lightText placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent
                transition-all duration-300 resize-y`}
              rows={4} // Increased rows for better prompt input experience
              disabled={loading}
              aria-label="Image Prompt Input"
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-darkText dark:text-lightText text-lg mr-2 font-bold">Image:</span>
            <div className="flex flex-wrap justify-center items-center gap-2"> {/* Segmented control for number of images */}
              {[1, 2, 3, 4].map((num) => (
                <Button
                  key={num}
                  variant={numberOfImages === num ? 'primary' : 'outline'}
                  size="md"
                  onClick={() => setNumberOfImages(num)}
                  disabled={loading}
                  className={`rounded-full w-10 h-10 flex items-center justify-center font-bold
                              ${numberOfImages === num ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent' : 'border-gray-600 dark:border-gray-400 text-gray-400 dark:text-gray-500 hover:bg-gray-700/20 dark:hover:bg-gray-300/20'}`}
                  aria-pressed={numberOfImages === num}
                  aria-label={`Generate ${num} image${num > 1 ? 's' : ''}`}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          <Button
            type="submit"
            className={`w-full max-w-sm mx-auto justify-center py-3 text-xl text-balance font-extrabold
                        ${!canGenerate && 'cursor-not-allowed opacity-70'}
                        ${canGenerate && 'animate-pulse-slow'}`}
            loading={loading}
            disabled={!canGenerate}
          >
            Generate Masterpiece ({IMAGE_COST * numberOfImages} Credits)
          </Button>
          {!isAuthenticated && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Please log in to start generating.
            </p>
          )}
        </form>
      </GlassCard>

      {(loading || generatedImages.length > 0) && (
        <div ref={scrollRef} className="mt-12 w-full max-w-6xl animate-fade-in">
          {loading && (
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-64 h-64 flex items-center justify-center">
                <Loader />
              </div>
              
              <div className="mt-4 text-center space-y-2 text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">
                <p className="text-lg font-semibold text-accent">Creating your masterpiece...</p>
              </div>
            </div>
          )}
          
          {!loading && (
             <>
                <h2 className="text-3xl font-bold text-darkText dark:text-lightText text-center mb-8">
                  Your Creations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {generatedImages.map((image) => (
                    <ImageCard key={image.id} image={image} />
                  ))}
                </div>
             </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
