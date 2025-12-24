
// components/PrivacyPolicyPage.tsx
import React, { useEffect, useState } from 'react';
import { BRAND_NAME } from '../constants';
import GlassCard from './ui/GlassCard';
import { backendApi } from '../services/backendApi';
import Loader from './ui/Loader';

const PrivacyPolicyPage: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
        try {
            const res = await backendApi.getLegalContent();
            if (res.success) setContent(res.data.privacy);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchContent();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader /></div>;

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 lg:p-12 min-h-[calc(100vh-160px)] animate-fade-in">
      <GlassCard className="max-w-3xl w-full p-6 md:p-8 text-left">
        {/* Render HTML Content safely */}
        <div 
            className="prose dark:prose-invert max-w-none prose-headings:text-darkText dark:prose-headings:text-lightText prose-p:text-gray-500 dark:prose-p:text-gray-400 prose-a:text-accent prose-strong:text-darkText dark:prose-strong:text-lightText"
            dangerouslySetInnerHTML={{ __html: content }} 
        />
        {!content && (
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                <p>Content not available.</p>
            </div>
        )}
      </GlassCard>
    </div>
  );
};

export default PrivacyPolicyPage;
