import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Globe, Phone, Share2, Award, Search, FileText } from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import toast from 'react-hot-toast';

const SiteSettingsModule = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'socials' | 'branding' | 'seo' | 'additional'>('general');

  // General Settings
  const [websiteName, setWebsiteName] = useState('');
  const [websiteLogo, setWebsiteLogo] = useState('');
  const [footerLogo, setFooterLogo] = useState('');
  const [navbarLogo, setNavbarLogo] = useState('');
  const [favicon, setFavicon] = useState('');

  // Contact Details
  const [companyAddress, setCompanyAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');

  // Social Links
  const [instagramUrl, setInstagramUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');

  // Branding Settings
  const [ownerSignature, setOwnerSignature] = useState('');
  const [companyStamp, setCompanyStamp] = useState('');

  // SEO Settings
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Additional Integration Settings
  const [footerText, setFooterText] = useState('');
  const [copyrightText, setCopyrightText] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [googleAnalyticsCode, setGoogleAnalyticsCode] = useState('');

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/cms/settings');
      if (data) {
        setWebsiteName(data.websiteName || '');
        setWebsiteLogo(data.websiteLogo || '');
        setFooterLogo(data.footerLogo || '');
        setNavbarLogo(data.navbarLogo || '');
        setFavicon(data.favicon || '');

        setCompanyAddress(data.companyAddress || '');
        setPhoneNumber(data.phoneNumber || '');
        setEmailAddress(data.emailAddress || '');
        setWhatsAppNumber(data.whatsAppNumber || '');

        setInstagramUrl(data.instagramUrl || '');
        setFacebookUrl(data.facebookUrl || '');
        setYoutubeUrl(data.youtubeUrl || '');
        setLinkedinUrl(data.linkedinUrl || '');
        setTwitterUrl(data.twitterUrl || '');

        setOwnerSignature(data.ownerSignature || '');
        setCompanyStamp(data.companyStamp || '');

        setMetaTitle(data.metaTitle || '');
        setMetaDescription(data.metaDescription || '');
        setMetaKeywords(data.metaKeywords || '');

        setFooterText(data.footerText || '');
        setCopyrightText(data.copyrightText || '');
        setGoogleMapsLink(data.googleMapsLink || '');
        setGoogleAnalyticsCode(data.googleAnalyticsCode || '');
      }
    } catch (error) {
      toast.error('Failed to load site configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      websiteName,
      websiteLogo,
      footerLogo,
      navbarLogo,
      favicon,
      companyAddress,
      phoneNumber,
      emailAddress,
      whatsAppNumber,
      instagramUrl,
      facebookUrl,
      youtubeUrl,
      linkedinUrl,
      twitterUrl,
      ownerSignature,
      companyStamp,
      metaTitle,
      metaDescription,
      metaKeywords,
      footerText,
      copyrightText,
      googleMapsLink,
      googleAnalyticsCode
    };

    try {
      await api.put('/cms/settings', payload);
      toast.success('Site configurations saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'General Settings', icon: <Globe size={16} /> },
    { id: 'contact', name: 'Contact Details', icon: <Phone size={16} /> },
    { id: 'socials', name: 'Social URLs', icon: <Share2 size={16} /> },
    { id: 'branding', name: 'Branding Logos', icon: <Award size={16} /> },
    { id: 'seo', name: 'SEO Metadata', icon: <Search size={16} /> },
    { id: 'additional', name: 'Additional Configs', icon: <FileText size={16} /> }
  ] as const;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-zinc-500" /> Site Settings Module
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Central hub for brand styling. Configure details, API keys, logos, signatures, SEO search tags, and footer info.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tab sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-xl gap-1 shrink-0 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shrink-0 text-left w-full ${
                  activeTab === tab.id
                    ? 'bg-amber-600/10 text-amber-600 dark:text-amber-500'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900'
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.name}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Tab Content Box */}
        <form onSubmit={handleSubmit} className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
          <div className="space-y-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">General Identity</h3>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Website Display Name
                  </label>
                  <input
                    type="text"
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    placeholder="e.g. Gabha Studio"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ImageUpload
                    label="Favicon (32x32px)"
                    value={favicon}
                    onChange={setFavicon}
                    placeholder="Favicon (.png or .ico)"
                    aspectRatio="aspect-square"
                  />
                  <ImageUpload
                    label="Main Brand Logo"
                    value={websiteLogo}
                    onChange={setWebsiteLogo}
                    placeholder="Upload default navbar logo"
                    aspectRatio="aspect-video"
                  />
                </div>
              </div>
            )}

            {/* Contact Details Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">Global Contact Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Business Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      WhatsApp Chat Number
                    </label>
                    <input
                      type="tel"
                      value={whatsAppNumber}
                      onChange={(e) => setWhatsAppNumber(e.target.value)}
                      placeholder="+15551234567"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Public Email Address
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="info@gabhastudio.com"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Showroom Physical Address
                  </label>
                  <textarea
                    rows={3}
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="Enter full address for contacts page..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm resize-none"
                  />
                </div>
              </div>
            )}

            {/* Social Media Tab */}
            {activeTab === 'socials' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">Social Media URL Profiles</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#E1306C] mb-1.5">Instagram Link</label>
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1877F2] mb-1.5">Facebook Link</label>
                    <input
                      type="url"
                      value={facebookUrl}
                      onChange={(e) => setFacebookUrl(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#FF0000] mb-1.5">YouTube Profile</label>
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0A66C2] mb-1.5">LinkedIn Profile</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">Business Seals</h3>
                <p className="text-xs text-zinc-400 mt-1">Logo assets used during dynamic invoice / quotation generation.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <ImageUpload
                    label="Owner E-Signature"
                    value={ownerSignature}
                    onChange={setOwnerSignature}
                    placeholder="Signature transparent png"
                    aspectRatio="aspect-video"
                  />
                  <ImageUpload
                    label="Official Company Stamp"
                    value={companyStamp}
                    onChange={setCompanyStamp}
                    placeholder="Stamp transparent png"
                    aspectRatio="aspect-square"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <ImageUpload
                    label="Navbar Secondary Logo"
                    value={navbarLogo}
                    onChange={setNavbarLogo}
                    placeholder="Upload light/alternative navbar logo"
                    aspectRatio="aspect-video"
                  />
                  <ImageUpload
                    label="Footer Brand Logo"
                    value={footerLogo}
                    onChange={setFooterLogo}
                    placeholder="Upload dedicated footer logo"
                    aspectRatio="aspect-video"
                  />
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">Search Engine Index Settings</h3>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Meta Title Tag (Global Override)
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Gabha Studio - Masterpieces in Stone"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Meta Description Block
                  </label>
                  <textarea
                    rows={4}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Describe your site details for Google index results..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    SEO Keywords (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="sculpture, stone statue, art studio"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}

            {/* Additional tab */}
            {activeTab === 'additional' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 pb-2 border-b border-zinc-100 dark:border-zinc-800">Integrations & Copywriters</h3>
                
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Google Maps Embedding URL
                  </label>
                  <input
                    type="url"
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Google Analytics Tracking ID (GA4)
                  </label>
                  <input
                    type="text"
                    value={googleAnalyticsCode}
                    onChange={(e) => setGoogleAnalyticsCode(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Footer Intro Blurb
                  </label>
                  <textarea
                    rows={2}
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="Small message displayed on footer left block..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Copyright Text
                  </label>
                  <input
                    type="text"
                    value={copyrightText}
                    onChange={(e) => setCopyrightText(e.target.value)}
                    placeholder="© 2026 Gabha Studio. All rights reserved."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-8">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-75"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save size={16} />}
              {saving ? 'Updating...' : 'Save Site Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteSettingsModule;
