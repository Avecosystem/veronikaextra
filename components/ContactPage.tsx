
// components/ContactPage.tsx
import React, { useEffect, useState } from 'react';
import { CONTACT_EMAIL, BRAND_NAME } from '../constants';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import { backendApi } from '../services/backendApi';
import { ContactInfo } from '../types';

const ContactPage: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
        try {
            const response = await backendApi.getContactInfo();
            if (response.success) {
                setContactInfo(response.data);
            }
        } catch (e) {
            console.error("Failed to fetch contact info", e);
        } finally {
            setLoading(false);
        }
    };
    fetchInfo();
  }, []);

  const primaryEmail = contactInfo?.email1 || CONTACT_EMAIL;
  
  const handleContactClick = () => {
    window.location.href = `mailto:${primaryEmail}?subject=Support%20Request%20from%20${BRAND_NAME}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 min-h-[calc(100vh-160px)] animate-fade-in">
      <GlassCard className="max-w-xl w-full p-6 md:p-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-darkText dark:text-lightText mb-4">
          Get in Touch
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
          Have questions, feedback, or need support? We're here to help!
        </p>

        {/* Dynamic Note */}
        {contactInfo?.note && (
             <div className="mb-8 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                 <p className="text-darkText dark:text-lightText italic">"{contactInfo.note}"</p>
             </div>
        )}

        <div className="flex flex-col items-center space-y-6 mb-8">
          {/* Email 1 */}
          <div className="flex items-center space-x-3 text-darkText dark:text-lightText">
            <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <span className="text-xl font-medium break-all">{primaryEmail}</span>
          </div>

          {/* Email 2 */}
          {contactInfo?.email2 && (
             <div className="flex items-center space-x-3 text-darkText dark:text-lightText">
                <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-xl font-medium break-all">{contactInfo.email2}</span>
             </div>
          )}

          {/* Phone */}
          {contactInfo?.phone && (
              <div className="flex items-center space-x-3 text-darkText dark:text-lightText">
                <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span className="text-xl font-medium">{contactInfo.phone}</span>
              </div>
          )}

          {/* Location */}
          {contactInfo?.location && (
              <div className="flex items-center space-x-3 text-darkText dark:text-lightText">
                <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-xl font-medium">{contactInfo.location}</span>
              </div>
          )}
        </div>

        <Button variant="primary" size="lg" onClick={handleContactClick}>
          Send us an Email
        </Button>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
          We aim to respond to all inquiries within 24-48 business hours.
        </p>
      </GlassCard>
    </div>
  );
};

export default ContactPage;
