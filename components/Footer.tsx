
// components/Footer.tsx
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BRAND_NAME, COPYRIGHT_YEAR, CONTACT_EMAIL } from '../constants';
import { backendApi } from '../services/backendApi';
import { SocialLinks } from '../types';

const Footer: React.FC = () => {
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);

  const fetchLinks = async () => {
        try {
            const res = await backendApi.getSocialLinks();
            if (res.success) setSocialLinks(res.data);
        } catch (e) { console.error("Footer link fetch fail", e); }
  };

  useEffect(() => {
    fetchLinks();
    
    // Listen for live updates from Admin panel
    const handleUpdate = () => fetchLinks();
    window.addEventListener('socialLinksUpdated', handleUpdate);
    
    return () => window.removeEventListener('socialLinksUpdated', handleUpdate);
  }, []);

  return (
    <footer className="w-full py-8 px-4 md:px-8 lg:px-12 mt-auto
                       bg-gradient-to-t from-darkBg/80 to-darkBg/50 dark:from-lightBg/80 dark:to-lightBg/50
                       backdrop-filter backdrop-blur-lg border-t border-gray-700/50 dark:border-gray-300/50
                       text-center text-gray-500 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Social Icons Section - Always render container, content depends on links */}
        <div className="flex space-x-6 mb-8 animate-fade-in min-h-[24px]">
            {socialLinks?.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors p-2 rounded-full hover:bg-white/5" title="Instagram">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
            )}
            {socialLinks?.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-white/5" title="Twitter / X">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
            )}
            {socialLinks?.website && (
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-400 transition-colors p-2 rounded-full hover:bg-white/5" title="Website">
                     <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h7m-9 0v-1a2 2 0 002-2h7m-7 2h4m-4 0v2m7 0v-2M5 9.776V7.15c0-1.42 1.25-2.5 2.65-2.5h8.7C17.75 4.65 19 5.73 19 7.15v2.626M3 13.84V17a2 2 0 002 2h14a2 2 0 002-2v-3.16M16.5 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
                </a>
            )}
            {socialLinks?.general && (
                <a href={socialLinks.general} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-white/5" title="Other Link">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </a>
            )}
        </div>

        <div className="w-full flex flex-col md:flex-row items-center justify-between">
            <p className="mb-4 md:mb-0">&copy; {COPYRIGHT_YEAR} {BRAND_NAME}. All rights reserved.</p>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6 items-center">
            <div className="w-full h-px bg-gray-700 dark:bg-gray-300 mb-4 md:mb-0"></div> {/* Subtle horizontal rule */}
            <p className="text-sm font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 flex items-center mb-2 md:mb-0 animate-fade-in"> {/* Enhanced trust indicator */}
                Secure by Babe finance by AV ecosystem
                <svg className="h-4 w-4 inline-block ml-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            </p>
            <div className="flex space-x-6">
                <NavLink to="/terms" className="hover:text-accent transition-colors duration-200">Terms</NavLink>
                <NavLink to="/privacy" className="hover:text-accent transition-colors duration-200">Privacy</NavLink>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-accent transition-colors duration-200">Contact</a>
            </div>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
