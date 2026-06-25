import React, { useState, useEffect } from 'react';
import { Layers, Save, RefreshCw, Plus, Pencil, Trash2, X, Check, MapPin, Eye, Sparkles, Image as ImageIcon, HelpCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import RichTextEditor from '../../components/cms/RichTextEditor';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface CardItem {
  _id?: string;
  title: string;
  image: string;
  items: string[];
  button_text: string;
  button_url: string;
  sort_order: number;
}

interface TimelineItem {
  _id?: string;
  title: string;
  subtitle: string;
  icon: string;
  image: string;
}

interface GalleryItem {
  _id?: string;
  image: string;
  alt: string;
}

const SpaceByGabhaModule = () => {
  const [activeTab, setActiveTab] = useState<'seo_hero' | 'purpose' | 'timeline' | 'nature' | 'visit'>('seo_hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Global Page states
  const [pageName, setPageName] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState('');

  // SEO states
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Hero section states
  const [heroActive, setHeroActive] = useState(true);
  const [heroBg, setHeroBg] = useState('');
  const [heroMobileBg, setHeroMobileBg] = useState('');
  const [heroHeading, setHeroHeading] = useState('');
  const [heroSubheading, setHeroSubheading] = useState('');
  const [heroLocation, setHeroLocation] = useState('');
  const [heroCtaText, setHeroCtaText] = useState('');
  const [heroCtaUrl, setHeroCtaUrl] = useState('');

  // Purpose section states
  const [purposeActive, setPurposeActive] = useState(true);
  const [purposeHeading, setPurposeHeading] = useState('');
  const [purposeDescription, setPurposeDescription] = useState('');
  const [purposeCards, setPurposeCards] = useState<CardItem[]>([]);
  
  // Cards modal states
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardItem | null>(null);
  const [cardIndex, setCardIndex] = useState<number | null>(null);
  const [cardTitle, setCardTitle] = useState('');
  const [cardImage, setCardImage] = useState('');
  const [cardItemsText, setCardItemsText] = useState(''); // comma separated
  const [cardBtnText, setCardBtnText] = useState('');
  const [cardBtnUrl, setCardBtnUrl] = useState('');
  const [cardSortOrder, setCardSortOrder] = useState(0);

  // Timeline section states
  const [timelineActive, setTimelineActive] = useState(true);
  const [timelineHeading, setTimelineHeading] = useState('');
  const [timelineDescription, setTimelineDescription] = useState('');
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);

  // Timeline modal states
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<TimelineItem | null>(null);
  const [timelineIndex, setTimelineIndex] = useState<number | null>(null);
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineSubtitle, setTimelineSubtitle] = useState('');
  const [timelineIcon, setTimelineIcon] = useState('sunrise'); // sunrise, sun, sunset, moon
  const [timelineImage, setTimelineImage] = useState('');

  // Nature section states
  const [natureActive, setNatureActive] = useState(true);
  const [natureHeading, setNatureHeading] = useState('');
  const [natureDescription, setNatureDescription] = useState('');
  const [natureHeroImage, setNatureHeroImage] = useState('');
  const [natureGallery, setNatureGallery] = useState<GalleryItem[]>([]);

  // Gallery modal states
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [galleryImg, setGalleryImg] = useState('');
  const [galleryAlt, setGalleryAlt] = useState('');

  // Visit section states
  const [visitActive, setVisitActive] = useState(true);
  const [visitHeading, setVisitHeading] = useState('');
  const [visitDescription, setVisitDescription] = useState('');
  const [visitCtaText, setVisitCtaText] = useState('');
  const [visitCtaUrl, setVisitCtaUrl] = useState('');

  // location_info states
  const [locLatitude, setLocLatitude] = useState(18.6298);
  const [locLongitude, setLocLongitude] = useState(73.7997);
  const [locAddress1, setLocAddress1] = useState('');
  const [locAddress2, setLocAddress2] = useState('');
  const [locLandmark, setLocLandmark] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locState, setLocState] = useState('');
  const [locCountry, setLocCountry] = useState('');
  const [locPostalCode, setLocPostalCode] = useState('');

  // map states
  const [mapProvider, setMapProvider] = useState('google_maps');
  const [mapEmbedUrl, setMapEmbedUrl] = useState('');
  const [mapLocationName, setMapLocationName] = useState('');

  // General Deletes state
  const [deleteType, setDeleteType] = useState<'card' | 'timeline' | 'gallery' | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const fetchSpaceData = async () => {
    try {
      const { data } = await api.get('/cms/space-by-gabha');
      if (data) {
        setPageName(data.page_name || '');
        setSlug(data.slug || '');
        setStatus(data.status || '');

        if (data.seo) {
          setMetaTitle(data.seo.meta_title || '');
          setMetaDescription(data.seo.meta_description || '');
          setMetaKeywords(data.seo.keywords ? data.seo.keywords.join(', ') : '');
        }

        if (data.hero_section) {
          setHeroActive(data.hero_section.is_active !== false);
          setHeroBg(data.hero_section.background_image || '');
          setHeroMobileBg(data.hero_section.mobile_background_image || '');
          setHeroHeading(data.hero_section.heading || '');
          setHeroSubheading(data.hero_section.subheading || '');
          setHeroLocation(data.hero_section.location || '');
          setHeroCtaText(data.hero_section.cta_button?.text || '');
          setHeroCtaUrl(data.hero_section.cta_button?.url || '');
        }

        if (data.purpose_section) {
          setPurposeActive(data.purpose_section.is_active !== false);
          setPurposeHeading(data.purpose_section.heading || '');
          setPurposeDescription(data.purpose_section.description || '');
          setPurposeCards(data.purpose_section.cards || []);
        }

        if (data.timeline_section) {
          setTimelineActive(data.timeline_section.is_active !== false);
          setTimelineHeading(data.timeline_section.heading || '');
          setTimelineDescription(data.timeline_section.description || '');
          setTimelineItems(data.timeline_section.timeline_items || []);
        }

        if (data.nature_section) {
          setNatureActive(data.nature_section.is_active !== false);
          setNatureHeading(data.nature_section.heading || '');
          setNatureDescription(data.nature_section.description || '');
          setNatureHeroImage(data.nature_section.hero_image || '');
          setNatureGallery(data.nature_section.gallery || []);
        }

        if (data.visit_section) {
          setVisitActive(data.visit_section.is_active !== false);
          setVisitHeading(data.visit_section.heading || '');
          setVisitDescription(data.visit_section.description || '');
          setVisitCtaText(data.visit_section.cta_button?.text || '');
          setVisitCtaUrl(data.visit_section.cta_button?.url || '');

          if (data.visit_section.location_info) {
            setLocLatitude(data.visit_section.location_info.latitude || 18.6298);
            setLocLongitude(data.visit_section.location_info.longitude || 73.7997);
            setLocAddress1(data.visit_section.location_info.address_line_1 || '');
            setLocAddress2(data.visit_section.location_info.address_line_2 || '');
            setLocLandmark(data.visit_section.location_info.landmark || '');
            setLocCity(data.visit_section.location_info.city || '');
            setLocState(data.visit_section.location_info.state || '');
            setLocCountry(data.visit_section.location_info.country || '');
            setLocPostalCode(data.visit_section.location_info.postal_code || '');
          }

          if (data.visit_section.map) {
            setMapProvider(data.visit_section.map.provider || 'google_maps');
            setMapEmbedUrl(data.visit_section.map.embed_url || '');
            setMapLocationName(data.visit_section.map.location_name || '');
          }
        }
      }
    } catch (error) {
      toast.error('Failed to load page content details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpaceData();
  }, []);

  const handleGlobalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      page_name: pageName,
      slug,
      status,
      seo: {
        meta_title: metaTitle,
        meta_description: metaDescription,
        keywords: metaKeywords.split(',').map(k => k.trim()).filter(Boolean)
      },
      hero_section: {
        is_active: heroActive,
        background_image: heroBg,
        mobile_background_image: heroMobileBg,
        heading: heroHeading,
        subheading: heroSubheading,
        location: heroLocation,
        cta_button: {
          text: heroCtaText,
          url: heroCtaUrl
        }
      },
      purpose_section: {
        is_active: purposeActive,
        heading: purposeHeading,
        description: purposeDescription,
        cards: purposeCards
      },
      timeline_section: {
        is_active: timelineActive,
        heading: timelineHeading,
        description: timelineDescription,
        timeline_items: timelineItems
      },
      nature_section: {
        is_active: natureActive,
        heading: natureHeading,
        description: natureDescription,
        hero_image: natureHeroImage,
        gallery: natureGallery
      },
      visit_section: {
        is_active: visitActive,
        heading: visitHeading,
        description: visitDescription,
        cta_button: {
          text: visitCtaText,
          url: visitCtaUrl
        },
        location_info: {
          latitude: Number(locLatitude),
          longitude: Number(locLongitude),
          address_line_1: locAddress1,
          address_line_2: locAddress2,
          landmark: locLandmark,
          city: locCity,
          state: locState,
          country: locCountry,
          postal_code: locPostalCode
        },
        map: {
          provider: mapProvider,
          embed_url: mapEmbedUrl,
          location_name: mapLocationName
        }
      }
    };

    try {
      await api.put('/cms/space-by-gabha', payload);
      toast.success('Space By Gabha settings saved successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save space settings');
    } finally {
      setSaving(false);
    }
  };

  // Card modal operations
  const openAddCardModal = () => {
    setEditingCard(null);
    setCardIndex(null);
    setCardTitle('');
    setCardImage('');
    setCardItemsText('');
    setCardBtnText('Explore');
    setCardBtnUrl('');
    setCardSortOrder(purposeCards.length + 1);
    setIsCardModalOpen(true);
  };

  const openEditCardModal = (card: CardItem, index: number) => {
    setEditingCard(card);
    setCardIndex(index);
    setCardTitle(card.title);
    setCardImage(card.image || '');
    setCardItemsText(card.items ? card.items.join(', ') : '');
    setCardBtnText(card.button_text || '');
    setCardBtnUrl(card.button_url || '');
    setCardSortOrder(card.sort_order || 0);
    setIsCardModalOpen(true);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardTitle) {
      toast.error('Card Title is required');
      return;
    }

    const cardPayload: CardItem = {
      title: cardTitle,
      image: cardImage,
      items: cardItemsText.split(',').map(i => i.trim()).filter(Boolean),
      button_text: cardBtnText,
      button_url: cardBtnUrl,
      sort_order: Number(cardSortOrder)
    };

    if (cardIndex !== null) {
      const updated = [...purposeCards];
      updated[cardIndex] = cardPayload;
      setPurposeCards(updated);
      toast.success('Card updated locally');
    } else {
      setPurposeCards([...purposeCards, cardPayload]);
      toast.success('Card added locally');
    }
    setIsCardModalOpen(false);
  };

  // Timeline modal operations
  const openAddTimelineModal = () => {
    setEditingTimeline(null);
    setTimelineIndex(null);
    setTimelineTitle('');
    setTimelineSubtitle('');
    setTimelineIcon('sunrise');
    setTimelineImage('');
    setIsTimelineModalOpen(true);
  };

  const openEditTimelineModal = (item: TimelineItem, index: number) => {
    setEditingTimeline(item);
    setTimelineIndex(index);
    setTimelineTitle(item.title);
    setTimelineSubtitle(item.subtitle || '');
    setTimelineIcon(item.icon || 'sunrise');
    setTimelineImage(item.image || '');
    setIsTimelineModalOpen(true);
  };

  const handleTimelineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineTitle) {
      toast.error('Event Title is required');
      return;
    }

    const tPayload: TimelineItem = {
      title: timelineTitle,
      subtitle: timelineSubtitle,
      icon: timelineIcon,
      image: timelineImage
    };

    if (timelineIndex !== null) {
      const updated = [...timelineItems];
      updated[timelineIndex] = tPayload;
      setTimelineItems(updated);
      toast.success('Timeline event updated locally');
    } else {
      setTimelineItems([...timelineItems, tPayload]);
      toast.success('Timeline event added locally');
    }
    setIsTimelineModalOpen(false);
  };

  // Gallery modal operations
  const openAddGalleryModal = () => {
    setGalleryIndex(null);
    setGalleryImg('');
    setGalleryAlt('');
    setIsGalleryModalOpen(true);
  };

  const openEditGalleryModal = (item: GalleryItem, index: number) => {
    setGalleryIndex(index);
    setGalleryImg(item.image || '');
    setGalleryAlt(item.alt || '');
    setIsGalleryModalOpen(true);
  };

  const handleGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryImg) {
      toast.error('Gallery image is required');
      return;
    }

    const gPayload: GalleryItem = {
      image: galleryImg,
      alt: galleryAlt
    };

    if (galleryIndex !== null) {
      const updated = [...natureGallery];
      updated[galleryIndex] = gPayload;
      setNatureGallery(updated);
      toast.success('Gallery frame updated locally');
    } else {
      setNatureGallery([...natureGallery, gPayload]);
      toast.success('Gallery frame added locally');
    }
    setIsGalleryModalOpen(false);
  };

  const triggerDeleteConfirm = (type: 'card' | 'timeline' | 'gallery', index: number) => {
    setDeleteType(type);
    setDeleteIndex(index);
  };

  const handleDeleteConfirmed = () => {
    if (deleteIndex === null || !deleteType) return;

    if (deleteType === 'card') {
      const updated = [...purposeCards];
      updated.splice(deleteIndex, 1);
      setPurposeCards(updated);
      toast.success('Card removed locally');
    } else if (deleteType === 'timeline') {
      const updated = [...timelineItems];
      updated.splice(deleteIndex, 1);
      setTimelineItems(updated);
      toast.success('Event removed locally');
    } else if (deleteType === 'gallery') {
      const updated = [...natureGallery];
      updated.splice(deleteIndex, 1);
      setNatureGallery(updated);
      toast.success('Gallery image removed locally');
    }

    setDeleteType(null);
    setDeleteIndex(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-amber-500" /> Space By Gabha Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Configure the layout structure, details, timeline flow, galleries, and maps for the space page.
          </p>
        </div>
        <button
          onClick={handleGlobalSubmit}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-75 self-start sm:self-auto"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'seo_hero', label: 'SEO & Hero Section' },
          { id: 'purpose', label: 'Purpose Cards' },
          { id: 'timeline', label: 'Timeline Section' },
          { id: 'nature', label: 'Nature & Gallery' },
          { id: 'visit', label: 'Visit Location & Map' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-600 dark:text-amber-500'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Page Form content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        
        {/* TAB 1: SEO & Hero */}
        {activeTab === 'seo_hero' && (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Page Settings & SEO Metadata</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Page Name</label>
                  <input
                    type="text"
                    required
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Page URL Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="E.g. Space By Gabha | Events & Experiences"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Meta Keywords (Comma separated)</label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="E.g. weddings, retreats, event space"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Meta Description</label>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Summarize the page content for search engines..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm resize-none"
                />
              </div>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-800" />

            {/* Hero Sub-section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Hero Header Layout</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={heroActive}
                    onChange={(e) => setHeroActive(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <span className="text-sm font-semibold">Active</span>
                </label>
              </div>

              {heroActive && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload
                      label="Desktop Background Image"
                      value={heroBg}
                      onChange={setHeroBg}
                      placeholder="Upload landscape wallpaper banner"
                      aspectRatio="aspect-[21/9]"
                    />
                    <ImageUpload
                      label="Mobile Background Image"
                      value={heroMobileBg}
                      onChange={setHeroMobileBg}
                      placeholder="Upload portrait layout banner"
                      aspectRatio="aspect-[9/16]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Hero Title Heading</label>
                      <input
                        type="text"
                        value={heroHeading}
                        onChange={(e) => setHeroHeading(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Location Badge Info</label>
                      <input
                        type="text"
                        value={heroLocation}
                        onChange={(e) => setHeroLocation(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Subheading Description</label>
                    <input
                      type="text"
                      value={heroSubheading}
                      onChange={(e) => setHeroSubheading(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">CTA Button Text</label>
                      <input
                        type="text"
                        value={heroCtaText}
                        onChange={(e) => setHeroCtaText(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">CTA Button URL</label>
                      <input
                        type="text"
                        value={heroCtaUrl}
                        onChange={(e) => setHeroCtaUrl(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Purpose Cards */}
        {activeTab === 'purpose' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Purpose & Cards Layout</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={purposeActive}
                  onChange={(e) => setPurposeActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-sm font-semibold">Active</span>
              </label>
            </div>

            {purposeActive && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Section Heading</label>
                    <input
                      type="text"
                      value={purposeHeading}
                      onChange={(e) => setPurposeHeading(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Section Description</label>
                    <textarea
                      rows={3}
                      value={purposeDescription}
                      onChange={(e) => setPurposeDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm resize-none"
                    />
                  </div>
                </div>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">Cards Configuration</h4>
                    <button
                      type="button"
                      onClick={openAddCardModal}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                    >
                      <Plus size={14} /> Add Card
                    </button>
                  </div>

                  {purposeCards.length === 0 ? (
                    <div className="border border-zinc-250 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/20 rounded-xl p-8 text-center text-zinc-400 text-xs">
                      No cards configured yet. Click Add Card.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {purposeCards.sort((a,b) => a.sort_order - b.sort_order).map((card, idx) => (
                        <div key={idx} className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-gray-50 dark:bg-zinc-950 p-4 space-y-4 relative flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-zinc-250 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                              {card.image ? (
                                <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-zinc-400 text-xs">No image uploaded</div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-gray-900 dark:text-white text-sm">{card.title}</h5>
                                <span className="text-[10px] bg-zinc-200 dark:bg-zinc-850 px-2 py-0.5 rounded text-zinc-500 font-bold">Order: {card.sort_order}</span>
                              </div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 truncate">
                                Items: {card.items ? card.items.join(', ') : 'none'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-850 pt-3 mt-2">
                            <button
                              type="button"
                              onClick={() => openEditCardModal(card, idx)}
                              className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerDeleteConfirm('card', idx)}
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Timeline Sequence</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timelineActive}
                  onChange={(e) => setTimelineActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-sm font-semibold">Active</span>
              </label>
            </div>

            {timelineActive && (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Section Heading</label>
                    <input
                      type="text"
                      value={timelineHeading}
                      onChange={(e) => setTimelineHeading(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Section Description (Optional)</label>
                    <textarea
                      rows={3}
                      value={timelineDescription}
                      onChange={(e) => setTimelineDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm resize-none"
                    />
                  </div>
                </div>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">Timeline Elements</h4>
                    <button
                      type="button"
                      onClick={openAddTimelineModal}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                    >
                      <Plus size={14} /> Add Event
                    </button>
                  </div>

                  {timelineItems.length === 0 ? (
                    <div className="border border-zinc-250 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/20 rounded-xl p-8 text-center text-zinc-400 text-xs">
                      No timeline events configured yet. Click Add Event.
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                        <thead className="bg-gray-50 dark:bg-zinc-900">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Subtitle</th>
                            <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Icon</th>
                            <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                          {timelineItems.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-3">
                                <div className="h-10 w-16 bg-zinc-150 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded overflow-hidden flex items-center justify-center">
                                  {item.image ? (
                                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                                  ) : (
                                    <span className="text-[10px] text-zinc-400">no image</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-3 font-bold">{item.title}</td>
                              <td className="px-6 py-3 text-zinc-500">{item.subtitle}</td>
                              <td className="px-6 py-3">
                                <span className="capitalize text-xs font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/15 rounded">
                                  {item.icon}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditTimelineModal(item, idx)}
                                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => triggerDeleteConfirm('timeline', idx)}
                                    className="p-1 hover:bg-red-500/10 rounded text-red-500"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 4: Nature & Gallery */}
        {activeTab === 'nature' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Landscape & Atmosphere Layout</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={natureActive}
                  onChange={(e) => setNatureActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-sm font-semibold">Active</span>
              </label>
            </div>

            {natureActive && (
              <>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Section Heading</label>
                        <input
                          type="text"
                          value={natureHeading}
                          onChange={(e) => setNatureHeading(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Section Description Quote</label>
                        <textarea
                          rows={4}
                          value={natureDescription}
                          onChange={(e) => setNatureDescription(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm resize-none"
                        />
                      </div>
                    </div>
                    <ImageUpload
                      label="Atmosphere Hero Banner Image"
                      value={natureHeroImage}
                      onChange={setNatureHeroImage}
                      placeholder="Upload wide landscape view"
                      aspectRatio="aspect-[16/9]"
                    />
                  </div>
                </div>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-amber-500" />
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">Context Grid Gallery</h4>
                    </div>
                    <button
                      type="button"
                      onClick={openAddGalleryModal}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
                    >
                      <Plus size={14} /> Add Image
                    </button>
                  </div>

                  {natureGallery.length === 0 ? (
                    <div className="border border-zinc-250 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950/20 rounded-xl p-8 text-center text-zinc-400 text-xs">
                      No gallery images configured yet. Click Add Image.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                      {natureGallery.map((item, idx) => (
                        <div key={idx} className="border border-zinc-200 dark:border-zinc-850 bg-gray-50 dark:bg-zinc-950 rounded-xl p-2.5 space-y-2 relative flex flex-col justify-between group">
                          <div className="aspect-square w-full rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700">
                            <img src={item.image} alt={item.alt} className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-2.5">
                            <p className="text-[10px] text-zinc-500 font-semibold truncate px-1">{item.alt || 'no alt text'}</p>
                            <div className="flex items-center justify-end gap-1.5 border-t border-zinc-200 dark:border-zinc-850 pt-2">
                              <button
                                type="button"
                                onClick={() => openEditGalleryModal(item, idx)}
                                className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => triggerDeleteConfirm('gallery', idx)}
                                className="p-1 text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 5: Visit Section */}
        {activeTab === 'visit' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Visit Invitation Layout</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visitActive}
                  onChange={(e) => setVisitActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
                <span className="text-sm font-semibold">Active</span>
              </label>
            </div>

            {visitActive && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Section Heading</label>
                    <input
                      type="text"
                      value={visitHeading}
                      onChange={(e) => setVisitHeading(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">CTA Button Text</label>
                    <input
                      type="text"
                      value={visitCtaText}
                      onChange={(e) => setVisitCtaText(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Section Description Text</label>
                    <textarea
                      rows={3}
                      value={visitDescription}
                      onChange={(e) => setVisitDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">CTA Button Link Redirect</label>
                    <input
                      type="text"
                      value={visitCtaUrl}
                      onChange={(e) => setVisitCtaUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                {/* location_info fields */}
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="h-5 w-5 text-amber-500" /> Location Physical Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Address Line 1</label>
                      <input
                        type="text"
                        value={locAddress1}
                        onChange={(e) => setLocAddress1(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Address Line 2</label>
                      <input
                        type="text"
                        value={locAddress2}
                        onChange={(e) => setLocAddress2(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Landmark</label>
                      <input
                        type="text"
                        value={locLandmark}
                        onChange={(e) => setLocLandmark(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">City</label>
                      <input
                        type="text"
                        value={locCity}
                        onChange={(e) => setLocCity(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">State</label>
                      <input
                        type="text"
                        value={locState}
                        onChange={(e) => setLocState(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Postal Code</label>
                      <input
                        type="text"
                        value={locPostalCode}
                        onChange={(e) => setLocPostalCode(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Country</label>
                      <input
                        type="text"
                        value={locCountry}
                        onChange={(e) => setLocCountry(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">GPS Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={locLatitude}
                        onChange={(e) => setLocLatitude(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">GPS Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={locLongitude}
                        onChange={(e) => setLocLongitude(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-zinc-200 dark:border-zinc-800" />

                {/* Map settings */}
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Eye className="h-5 w-5 text-amber-500" /> Embedded Map View Settings
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Map Location Name Label</label>
                      <input
                        type="text"
                        value={mapLocationName}
                        onChange={(e) => setMapLocationName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Custom Map Embed iframe URL (Optional)</label>
                      <input
                        type="text"
                        value={mapEmbedUrl}
                        onChange={(e) => setMapEmbedUrl(e.target.value)}
                        placeholder="Leave empty to use automatic coordinate lookup map"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Button floating footer */}
      <div className="flex justify-end p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <button
          onClick={handleGlobalSubmit}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-75"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Card Modal */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingCard ? 'Edit Purpose Card' : 'Add Purpose Card'}
              </h2>
              <button onClick={() => setIsCardModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleCardSubmit} className="p-6 space-y-6 flex-1">
              <ImageUpload
                label="Card Image Representation"
                value={cardImage}
                onChange={setCardImage}
                placeholder="Upload card category visual"
                aspectRatio="aspect-[4/3]"
              />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Card Title *</label>
                    <input
                      type="text"
                      required
                      value={cardTitle}
                      onChange={(e) => setCardTitle(e.target.value)}
                      placeholder="e.g. Celebrate"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Sort Order</label>
                    <input
                      type="number"
                      required
                      value={cardSortOrder}
                      onChange={(e) => setCardSortOrder(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Card Highlights (Comma separated items)</label>
                  <input
                    type="text"
                    value={cardItemsText}
                    onChange={(e) => setCardItemsText(e.target.value)}
                    placeholder="e.g. Destination Weddings, Private Gatherings"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Card Button Text</label>
                    <input
                      type="text"
                      value={cardBtnText}
                      onChange={(e) => setCardBtnText(e.target.value)}
                      placeholder="Explore"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Card Button Redirect URL</label>
                    <input
                      type="text"
                      value={cardBtnUrl}
                      onChange={(e) => setCardBtnUrl(e.target.value)}
                      placeholder="/celebrate"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              <footer className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 pb-2">
                <button
                  type="button"
                  onClick={() => setIsCardModalOpen(false)}
                  className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 text-sm font-bold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm"
                >
                  <Check size={16} /> Save Card
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {isTimelineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingTimeline ? 'Edit Timeline Event' : 'Add Timeline Event'}
              </h2>
              <button onClick={() => setIsTimelineModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleTimelineSubmit} className="p-6 space-y-6 flex-1">
              <ImageUpload
                label="Event Image Visual"
                value={timelineImage}
                onChange={setTimelineImage}
                placeholder="Upload event preview photo"
                aspectRatio="aspect-[4/3]"
              />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={timelineTitle}
                      onChange={(e) => setTimelineTitle(e.target.value)}
                      placeholder="e.g. Morning"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Event Subtitle</label>
                    <input
                      type="text"
                      value={timelineSubtitle}
                      onChange={(e) => setTimelineSubtitle(e.target.value)}
                      placeholder="e.g. Workshops begin"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Event Icon Iconography</label>
                  <select
                    value={timelineIcon}
                    onChange={(e) => setTimelineIcon(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  >
                    <option value="sunrise">Sunrise (Morning)</option>
                    <option value="sun">Sun (Afternoon)</option>
                    <option value="sunset">Sunset (Evening)</option>
                    <option value="moon">Moon (Night)</option>
                  </select>
                </div>
              </div>

              <footer className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 pb-2">
                <button
                  type="button"
                  onClick={() => setIsTimelineModalOpen(false)}
                  className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 text-sm font-bold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm"
                >
                  <Check size={16} /> Save Event
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {galleryIndex !== null ? 'Edit Gallery Frame' : 'Add Gallery Frame'}
              </h2>
              <button onClick={() => setIsGalleryModalOpen(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleGallerySubmit} className="p-6 space-y-6 flex-1">
              <ImageUpload
                label="Gallery Photo Image * "
                value={galleryImg}
                onChange={setGalleryImg}
                placeholder="Upload atmosphere gallery display image"
                aspectRatio="aspect-square"
              />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">Alt Text / Label Tag</label>
                  <input
                    type="text"
                    value={galleryAlt}
                    onChange={(e) => setGalleryAlt(e.target.value)}
                    placeholder="e.g. Evening event with string lights"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>
              </div>

              <footer className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 pb-2">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 text-sm font-bold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm"
                >
                  <Check size={16} /> Save Image
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteType !== null}
        onClose={() => {
          setDeleteType(null);
          setDeleteIndex(null);
        }}
        onConfirm={handleDeleteConfirmed}
        title={`Remove ${deleteType}`}
        message={`Are you sure you want to remove this ${deleteType} configuration from the page local changes? Make sure to save settings to write them to the database.`}
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
};

export default SpaceByGabhaModule;
