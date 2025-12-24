
// components/admin/AdminOthersPage.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import AdminDashboardLayout from './AdminDashboardLayout';
import Loader from '../ui/Loader';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { backendApi } from '../../services/backendApi';
import { SocialLinks, LegalContent, ApiResponse } from '../../types';

const AdminOthersPage: React.FC = () => {
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'legal' | 'links'>('legal');
  
  // Legal State
  const [legalContent, setLegalContent] = useState<LegalContent>({ terms: '', privacy: '' });
  const [legalType, setLegalType] = useState<'terms' | 'privacy'>('terms');
  const [editorContent, setEditorContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Links State
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({ instagram: '', twitter: '', website: '', general: '' });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !authUser?.isAdmin) return;
    setLoading(true);
    try {
        const [linksRes, legalRes] = await Promise.all([
            backendApi.getSocialLinks(),
            backendApi.getLegalContent()
        ]);
        if (linksRes.success) setSocialLinks(linksRes.data);
        if (legalRes.success) {
            setLegalContent(legalRes.data);
            setEditorContent(legalRes.data[legalType]); // Set initial editor content
        }
    } catch (e) {
        console.error(e);
        setError("Failed to load data.");
    } finally {
        setLoading(false);
    }
  }, [isAuthenticated, authUser, legalType]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser?.isAdmin) {
      fetchData();
    }
  }, [authLoading, isAuthenticated, authUser, fetchData]);

  // Sync editor content when type changes
  useEffect(() => {
      setEditorContent(legalContent[legalType]);
  }, [legalType, legalContent]);

  // Helper to insert tags
  const insertTag = (startTag: string, endTag: string) => {
    if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = editorContent;
        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);
        
        const newText = `${before}${startTag}${selected}${endTag}${after}`;
        setEditorContent(newText);
        
        // Update state logic for legalContent
        setLegalContent(prev => ({ ...prev, [legalType]: newText }));
        
        // Restore focus/cursor (approximate)
        setTimeout(() => {
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(start + startTag.length, end + startTag.length);
        }, 0);
    }
  };

  const handleLegalSave = async () => {
      setSaving(true);
      setSuccess(null);
      setError(null);
      const token = localStorage.getItem('jwt_token');
      if (!token) return;

      try {
          const updatedContent = { ...legalContent, [legalType]: editorContent };
          const response = await backendApi.updateLegalContent(token, updatedContent);
          if (response.success) setSuccess("Legal pages updated.");
          else setError(response.message || "Failed.");
      } catch(e) { setError("Error saving."); }
      finally { setSaving(false); }
  };

  const handleLinksSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const response = await backendApi.updateSocialLinks(token, socialLinks);
        if (response.success) setSuccess("Links updated.");
        else setError(response.message || "Failed.");
    } catch(e) { setError("Error saving."); }
    finally { setSaving(false); }
  };

  if (authLoading || loading) return <AdminDashboardLayout title="Others Management"><Loader /></AdminDashboardLayout>;

  return (
    <AdminDashboardLayout title="Others Management">
        <div className="flex space-x-4 mb-6 border-b border-gray-700 dark:border-gray-300 pb-2">
            <button 
                onClick={() => { setActiveTab('legal'); setSuccess(null); setError(null); }}
                className={`px-4 py-2 font-semibold ${activeTab === 'legal' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'}`}
            >
                Legal Pages
            </button>
            <button 
                onClick={() => { setActiveTab('links'); setSuccess(null); setError(null); }}
                className={`px-4 py-2 font-semibold ${activeTab === 'links' ? 'text-accent border-b-2 border-accent' : 'text-gray-500'}`}
            >
                Edit Links
            </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}

        {activeTab === 'legal' && (
            <div className="space-y-6">
                <div className="flex space-x-4 mb-4">
                     <Button 
                        variant={legalType === 'terms' ? 'primary' : 'outline'} 
                        size="sm" 
                        onClick={() => setLegalType('terms')}
                     >
                         Terms of Service
                     </Button>
                     <Button 
                        variant={legalType === 'privacy' ? 'primary' : 'outline'} 
                        size="sm" 
                        onClick={() => setLegalType('privacy')}
                     >
                         Privacy Policy
                     </Button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 p-2 bg-gray-800/30 rounded-t-xl border border-gray-700">
                    <button onClick={() => insertTag('<b>', '</b>')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm font-bold">B</button>
                    <button onClick={() => insertTag('<u>', '</u>')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm underline">U</button>
                    <button onClick={() => insertTag('<i>', '</i>')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm italic">I</button>
                    <button onClick={() => insertTag('<h3>', '</h3>')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">H3 (Heading)</button>
                    <button onClick={() => insertTag('<h4>', '</h4>')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">H4</button>
                    <button onClick={() => insertTag('<br>', '')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">Break Line</button>
                    <button onClick={() => insertTag('<p>', '</p>')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">Paragraph</button>
                    <button onClick={() => insertTag('<ul><li>', '</li></ul>')} className="px-2 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm">List</button>
                </div>

                <textarea
                    ref={textareaRef}
                    value={editorContent}
                    onChange={(e) => {
                        setEditorContent(e.target.value);
                        setLegalContent(prev => ({ ...prev, [legalType]: e.target.value }));
                    }}
                    className="w-full h-96 p-4 bg-gray-900 text-gray-100 font-mono text-sm border border-t-0 border-gray-700 rounded-b-xl focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <Button onClick={handleLegalSave} loading={saving} className="w-full">Save Legal Content</Button>
            </div>
        )}

        {activeTab === 'links' && (
            <div className="space-y-6 max-w-lg">
                <p className="text-sm text-gray-500">Add URLs for your social profiles. Leave blank to hide.</p>
                
                <div className="relative">
                    <Input 
                        id="instagram"
                        label="Instagram URL"
                        placeholder="https://instagram.com/..."
                        value={socialLinks.instagram}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: e.target.value }))}
                    />
                </div>
                <div className="relative">
                    <Input 
                        id="twitter"
                        label="Twitter (X) URL"
                        placeholder="https://twitter.com/..."
                        value={socialLinks.twitter}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: e.target.value }))}
                    />
                </div>
                <div className="relative">
                    <Input 
                        id="website"
                        label="Website URL"
                        placeholder="https://yoursite.com"
                        value={socialLinks.website}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, website: e.target.value }))}
                    />
                </div>
                <div className="relative">
                    <Input 
                        id="general"
                        label="General / Other Link"
                        placeholder="https://..."
                        value={socialLinks.general}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, general: e.target.value }))}
                    />
                </div>
                
                <Button onClick={handleLinksSave} loading={saving} className="w-full">Save Links</Button>
            </div>
        )}

    </AdminDashboardLayout>
  );
};

export default AdminOthersPage;
