import React, { useState, useEffect } from 'react';
import { Info, Save, RefreshCw } from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import RichTextEditor from '../../components/cms/RichTextEditor';
import toast from 'react-hot-toast';

const AboutUsModule = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [leftImage, setLeftImage] = useState('');
  const [rightImage, setRightImage] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');

  const fetchAboutUs = async () => {
    try {
      const { data } = await api.get('/cms/about');
      if (data) {
        setTitle(data.title || '');
        setSubtitle(data.subtitle || '');
        setDescription(data.description || '');
        setLeftImage(data.leftImage || '');
        setRightImage(data.rightImage || '');
        setCtaText(data.ctaText || '');
        setCtaLink(data.ctaLink || '');
      }
    } catch (error) {
      toast.error('Failed to load About Us details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('Section Title is required');
      return;
    }

    setSaving(true);
    const payload = {
      title,
      subtitle: subtitle || undefined,
      description: description || '',
      leftImage: leftImage || '',
      rightImage: rightImage || '',
      ctaText: ctaText || '',
      ctaLink: ctaLink || ''
    };

    try {
      await api.put('/cms/about', payload);
      toast.success('About Us content updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update content');
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

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Info className="h-6 w-6 text-blue-500" /> About Us Section Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Customize the storytelling header, sub-headings, main descriptive text block, side-by-side showcases, and action link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
              Section Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our Story"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
              Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. A Legacy of Stone"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageUpload
            label="Left Showcase Image"
            value={leftImage}
            onChange={setLeftImage}
            placeholder="Upload left side artwork display (square crop 1:1)"
            aspectRatio="aspect-square"
          />
          <ImageUpload
            label="Right Showcase Image"
            value={rightImage}
            onChange={setRightImage}
            placeholder="Upload right side artwork display (square crop 1:1)"
            aspectRatio="aspect-square"
          />
        </div>

        <RichTextEditor
          label="Main Description / Content *"
          value={description}
          onChange={setDescription}
          rows={12}
          placeholder="Craft your narrative, embed bold tags or lists..."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-zinc-100 dark:border-zinc-800 pt-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
              CTA Button Text (Optional)
            </label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder="e.g. Discover Our Story"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
              CTA Link (Optional)
            </label>
            <input
              type="text"
              value={ctaLink}
              onChange={(e) => setCtaLink(e.target.value)}
              placeholder="e.g. /about"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-75"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save size={16} />}
            {saving ? 'Updating...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AboutUsModule;
