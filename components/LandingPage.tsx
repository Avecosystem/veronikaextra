// components/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import Button from './ui/Button';
import GlassCard from './ui/GlassCard';
import { APP_TAGLINE, BRAND_NAME, CONTACT_EMAIL, DEMO_IMAGES, INITIAL_CREDITS, IMAGE_COST } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { backendApi } from '../services/backendApi';
import { ApiResponse } from '../types';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as const } }, 
};

// FAQ data structure
const faqs = [
  {
    question: "How do credits work?",
    answer: `Upon signing up, you receive ${INITIAL_CREDITS} free credits. Each image generation costs ${IMAGE_COST} credits. Credits are automatically deducted from your balance once an image is successfully generated. You can purchase more credits on the "Credits" page.`,
  },
  {
    question: "Is my data and my prompts secure?",
    answer: "Absolutely. We prioritize your privacy and security. We do not store any user prompts or the images you generate. All communications are secure, and your personal data (name, email, hashed password) is handled with the utmost care, adhering to our strict Privacy Policy.",
  },
  {
    question: "What resolution are the generated images?",
    answer: "All AI-generated images are provided in high-quality 1024x1024 pixel resolution, perfect for a wide range of creative and professional uses.",
  },
  {
    question: "What happens if I run out of credits?",
    answer: "If your credits run out, you won't be able to generate new images until you purchase more. You can easily buy additional credits on the 'Credits' page through our secure payment options.",
  },
  {
    question: "How are payments handled?",
    answer: "We offer manual UPI payment for users in India and crypto payments via OXPAY for international users. All transactions are securely processed, and your purchased credits are added to your account upon verification. We do not store any sensitive payment information on our servers.",
  },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [globalNotice, setGlobalNotice] = useState<string>('');
  const [noticeError, setNoticeError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null); // State for open FAQ item

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

  const handleStartGenerating = () => {
    if (isAuthenticated) {
      navigate('/generator');
    } else {
      navigate('/signup');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const brandNameParts = BRAND_NAME.split('extra');
  const veronikaPart = brandNameParts[0];
  const extraPart = 'extra'; // Assuming 'extra' is always the second part and lowercase

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 min-h-[calc(100vh-160px)]">
      {/* Global Notice Display */}
      {globalNotice && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl mb-8"
        >
          <GlassCard className="p-4 text-center text-darkText dark:text-lightText bg-accent/20 border-accent/50">
            <p className="font-semibold text-lg">{globalNotice}</p>
          </GlassCard>
        </motion.div>
      )}
      {noticeError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-6xl mb-8"
        >
          <GlassCard className="p-4 text-center text-red-500 bg-red-500/10 border-red-500/50">
            <p className="font-semibold text-lg">Error: {noticeError}</p>
          </GlassCard>
        </motion.div>
      )}

      {/* Hero Section */}
      <motion.section
        className="relative w-full max-w-6xl text-center py-20 md:py-32 lg:py-48"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <GlassCard className="p-8 md:p-12 lg:p-16">
          <h1 className="text-4xl md:text-6xl font-extrabold text-darkText dark:text-lightText mb-6 leading-tight">
            Create AI Images in Seconds
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-10 max-w-3xl mx-auto">
            {APP_TAGLINE}
          </p>
          <Button variant="primary" size="lg" className="animate-pulse-slow" onClick={handleStartGenerating}>
            Start Generating
          </Button>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-500">
            {isAuthenticated ? 'Go to Generator' : `Sign up and get ${INITIAL_CREDITS} free credits!`}
          </p>
          <p className="mt-8 text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center animate-fade-in"> {/* Enhanced trust indicator */}
            Secure by Babe finance by AV ecosystem
            <svg className="h-4 w-4 inline-block ml-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
          </p>
        </GlassCard>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="w-full max-w-6xl py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-darkText dark:text-lightText text-center mb-12">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <GlassCard className="text-center p-6 flex flex-col items-center">
            <svg className="h-12 w-12 text-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <h3 className="text-xl font-semibold mb-2 text-darkText dark:text-lightText">Lightning Fast</h3>
            <p className="text-gray-500 dark:text-gray-400">Generate images almost instantly.</p>
          </GlassCard>
          <GlassCard className="text-center p-6 flex flex-col items-center">
            <svg className="h-12 w-12 text-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.007 12.007 0 002 12c0 2.831.972 5.447 2.618 7.559L12 22l7.382-2.441A12.007 12.007 0 0022 12c0-2.831-.972-5.447-2.618-7.559z" /></svg>
            <h3 className="text-xl font-semibold mb-2 text-darkText dark:text-lightText">Privacy First</h3>
            <p className="text-gray-500 dark:text-gray-400">No storage of prompts or images.</p>
          </GlassCard>
          <GlassCard className="text-center p-6 flex flex-col items-center">
            <svg className="h-12 w-12 text-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2 3 .895 3 2s-1.343 2-3 2m0-8c1.11 0 2.08.402 2.592 1L15 10a3 3 0 11-6 0c0-.536.211-1.028.592-1.5z" /></svg>
            <h3 className="text-xl font-semibold mb-2 text-darkText dark:text-lightText">Credit System</h3>
            <p className="text-gray-500 dark:text-gray-400">Manage generations with a simple credit system.</p>
          </GlassCard>
          <GlassCard className="text-center p-6 flex flex-col items-center">
            <svg className="h-12 w-12 text-accent mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <h3 className="text-xl font-semibold mb-2 text-darkText dark:text-lightText">Downloadable</h3>
            <p className="text-gray-500 dark:text-gray-400">Instantly download your high-quality creations.</p>
          </GlassCard>
        </div>
      </motion.section>

      {/* Credit Info Section */}
      <motion.section
        className="w-full max-w-6xl py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <GlassCard className="text-center p-8 md:p-10">
          <h2 className="text-3xl md:text-4xl font-bold text-darkText dark:text-lightText mb-4">
            Get Started Today!
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">
            New users receive <span className="text-accent font-bold">{INITIAL_CREDITS} free credits</span> to explore.
          </p>
          <p className="text-lg text-darkText dark:text-lightText mb-8">
            Each image generation costs <span className="font-bold">{IMAGE_COST} credits</span>.
          </p>
          <Button variant="primary" size="lg" onClick={handleStartGenerating}>
            Claim Your Free Credits
          </Button>
        </GlassCard>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className="w-full max-w-6xl py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-darkText dark:text-lightText text-center mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="text-center p-6">
            <div className="text-5xl font-extrabold text-accent mb-4">1</div>
            <h3 className="text-xl font-semibold mb-2 text-darkText dark:text-lightText">Sign Up</h3>
            <p className="text-gray-500 dark:text-gray-400">Create your free account in seconds and get instant credits.</p>
          </GlassCard>
          <GlassCard className="text-center p-6">
            <div className="text-5xl font-extrabold text-accent mb-4">2</div>
            <h3 className="text-xl font-semibold mb-2 text-darkText dark:text-lightText">Enter Prompt</h3>
            <p className="text-gray-500 dark:text-gray-400">Describe your desired image using simple text.</p>
          </GlassCard>
          <GlassCard className="text-center p-6">
            <div className="text-5xl font-extrabold text-accent mb-4">3</div>
            <h3 className="text-xl font-semibold mb-2 text-darkText dark:text-lightText">Download</h3>
            <p className="text-gray-500 dark:text-gray-400">Generate high-quality images and download them instantly.</p>
          </GlassCard>
        </div>
      </motion.section>

      {/* Demo Gallery Section */}
      <motion.section
        className="w-full max-w-6xl py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-darkText dark:text-lightText text-center mb-12">
          Demo Gallery
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {DEMO_IMAGES.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <GlassCard className="p-2 aspect-square group overflow-hidden">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Trusted By Creators Section */}
      <motion.section
        className="w-full max-w-6xl py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <GlassCard className="text-center p-8 md:p-10">
          <h2 className="text-3xl md:text-4xl font-bold text-darkText dark:text-lightText mb-4">
            Trusted By Creators
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">
            Professionals from various fields use VERONIKAextra to bring their ideas to life.
          </p>
          
          {/* 5-star Rating */}
          <div className="flex justify-center items-center mb-8">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-8 w-8 text-yellow-400 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 .587l3.668 7.568 8.332 1.209-6.001 5.854 1.416 8.286L12 18.896l-7.415 3.908 1.416-8.286-6.001-5.854 8.332-1.209L12 .587z"/>
              </svg>
            ))}
            <span className="ml-3 text-2xl font-bold text-darkText dark:text-lightText">5.0</span>
          </div>

          {/* Creator Testimonials/Logos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="text-lg font-semibold text-accent">"Jeson Sida"</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Product Designer</p>
              <p className="text-sm text-center mt-2">"VERONIKAextra streamlines my creative workflow!"</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="text-lg font-semibold text-accent">"Animace Jain"</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Marketing Strategist</p>
              <p className="text-sm text-center mt-2">"High-quality visuals in minutes, a game-changer."</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="text-lg font-semibold text-accent">"Imli Spok"</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Content Creator</p>
              <p className="text-sm text-center mt-2">"My go-to for unique and engaging imagery."</p>
            </motion.div>
          </div>
        </GlassCard>
      </motion.section>

      {/* Frequently Asked Questions Section */}
      <motion.section
        className="w-full max-w-3xl py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-darkText dark:text-lightText text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <GlassCard key={index} className="p-4 cursor-pointer">
              <button
                className="w-full flex justify-between items-center text-left focus:outline-none"
                onClick={() => toggleFaq(index)}
                aria-expanded={openFaq === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-lg font-semibold text-darkText dark:text-lightText">{faq.question}</h3>
                <motion.svg
                  className="h-6 w-6 text-accent"
                  initial={false}
                  animate={{ rotate: openFaq === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </motion.svg>
              </button>
              <AnimatePresence initial={false}>
                {openFaq === index && (
                  <motion.div
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: "auto" },
                      collapsed: { opacity: 0, height: 0 }
                    }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                    id={`faq-answer-${index}`}
                  >
                    <p className="mt-4 text-gray-500 dark:text-gray-400">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="w-full max-w-6xl py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
      >
        <GlassCard className="text-center p-8 md:p-10">
          <h2 className="text-3xl md:text-4xl font-bold text-darkText dark:text-lightText mb-4">
            Need Help? Contact Us!
          </h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-6">
            For support, inquiries, or purchasing credits, feel free to reach out.
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent hover:underline text-lg font-medium">
            {CONTACT_EMAIL}
          </a>
        </GlassCard>
      </motion.section>
    </div>
  );
};

export default LandingPage;