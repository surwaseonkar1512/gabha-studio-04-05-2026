import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Layers, Plus, Pencil, Trash2, Eye, Move, Check, X, RefreshCw } from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface Banner {
  _id: string;
  bannerImage: string;
  mobileBannerImage?: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  displayOrder: number;
}

const BannersModule = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form states
  const [bannerImage, setBannerImage] = useState('');
  const [mobileBannerImage, setMobileBannerImage] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Preview state
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);

  // Delete state
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);

  const fetchBanners = async () => {
    try {
      const { data } = await api.get('/cms/banners');
      setBanners(data);
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setBannerImage('');
    setMobileBannerImage('');
    setTitle('');
    setSubtitle('');
    setDescription('');
    setCtaText('');
    setCtaLink('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setBannerImage(banner.bannerImage);
    setMobileBannerImage(banner.mobileBannerImage || '');
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setDescription(banner.description || '');
    setCtaText(banner.ctaText || '');
    setCtaLink(banner.ctaLink || '');
    setIsActive(banner.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerImage) {
      toast.error('Banner image is required');
      return;
    }
    if (!title) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    const payload = {
      bannerImage,
      mobileBannerImage: mobileBannerImage || undefined,
      title,
      subtitle: subtitle || undefined,
      description: description || undefined,
      ctaText: ctaText || undefined,
      ctaLink: ctaLink || undefined,
      isActive,
      displayOrder: editingBanner ? editingBanner.displayOrder : banners.length
    };

    try {
      if (editingBanner) {
        await api.put(`/cms/banners/${editingBanner._id}`, payload);
        toast.success('Banner updated successfully');
      } else {
        await api.post('/cms/banners', payload);
        toast.success('Banner created successfully');
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteBannerId) return;
    try {
      await api.delete(`/cms/banners/${deleteBannerId}`);
      toast.success('Banner deleted successfully');
      setDeleteBannerId(null);
      fetchBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(banners);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Optimistically update UI
    const updatedItems = items.map((item, idx) => ({
      ...item,
      displayOrder: idx
    }));
    setBanners(updatedItems);

    try {
      const orders = updatedItems.map(item => ({ id: item._id, displayOrder: item.displayOrder }));
      await api.put('/cms/banners/reorder', { orders });
      toast.success('Order saved successfully');
    } catch (error) {
      toast.error('Failed to save banner order');
      fetchBanners(); // Rollback
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const { data } = await api.put(`/cms/banners/${banner._id}`, { isActive: !banner.isActive });
      setBanners(prev => prev.map(b => b._id === banner._id ? data : b));
      toast.success(`Banner is now ${!banner.isActive ? 'Active' : 'Inactive'}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-amber-500" /> Banners Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Configure slides, mobile overrides, promotional text and actions for the main hero landing section.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Banner Preview Sandbox */}
      {previewBanner && (
        <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Eye size={16} /> Live Hero Preview
            </h3>
            <button
              onClick={() => setPreviewBanner(null)}
              className="text-xs text-zinc-400 hover:text-white border border-zinc-800 px-2 py-1 rounded"
            >
              Close Preview
            </button>
          </div>
          <div className="relative h-[250px] sm:h-[400px] w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
            <img
              src={previewBanner.bannerImage}
              alt={previewBanner.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="relative z-10 text-center px-4 max-w-2xl mx-auto space-y-4">
              {previewBanner.subtitle && (
                <p className="text-[#D4AF37] font-bold text-xs uppercase tracking-widest">{previewBanner.subtitle}</p>
              )}
              <h2 className="text-2xl sm:text-4xl font-bold text-white uppercase tracking-wider">{previewBanner.title}</h2>
              {previewBanner.description && (
                <p className="text-zinc-300 text-xs sm:text-sm line-clamp-3 max-w-lg mx-auto">{previewBanner.description}</p>
              )}
              {previewBanner.ctaText && (
                <a
                  href={previewBanner.ctaLink || '#'}
                  onClick={(e) => e.preventDefault()}
                  className="inline-block px-6 py-2.5 bg-[#D4AF37] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors mt-2"
                >
                  {previewBanner.ctaText}
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List / Drag-n-Drop */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="h-8 w-8 text-amber-500 animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-12 text-center text-zinc-400">
          <Layers className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
          <p className="font-semibold text-sm">No banners created yet</p>
          <p className="text-xs text-zinc-400 mt-1">Add banners to construct the home page carousel.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>List of Banners (Drag to Reorder)</span>
            <span>Total: {banners.length}</span>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="banners">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="divide-y divide-zinc-200 dark:divide-zinc-800"
                >
                  {banners.map((banner, index) => (
                    <Draggable key={banner._id} draggableId={banner._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex flex-col sm:flex-row sm:items-center p-4 gap-4 transition-colors ${snapshot.isDragging
                            ? 'bg-zinc-50 dark:bg-zinc-800/80 shadow-md'
                            : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20'
                            }`}
                        >
                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-grab active:cursor-grabbing self-center sm:self-auto shrink-0 p-1 rounded"
                          >
                            <Move size={18} />
                          </div>

                          {/* Image preview */}
                          <div className="w-full sm:w-32 aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                            <img src={banner.bannerImage} alt={banner.title} className="w-full h-full object-cover" />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">{banner.title}</h3>
                              {banner.mobileBannerImage && (
                                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold px-2 py-0.5 rounded">
                                  Mobile Cover
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-1">
                              {banner.subtitle || 'No subtitle'}
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                              {banner.description || 'No description'}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-3 self-end sm:self-auto shrink-0">
                            {/* Active Toggle */}
                            <button
                              onClick={() => handleToggleActive(banner)}
                              className={`text-xs px-2.5 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors border ${banner.isActive
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500'
                                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                                }`}
                            >
                              {banner.isActive ? 'Active' : 'Inactive'}
                            </button>

                            {/* Actions Buttons */}
                            <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
                              <button
                                onClick={() => setPreviewBanner(banner)}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                                title="Preview banner"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => openEditModal(banner)}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                                title="Edit banner"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteBannerId(banner._id)}
                                className="p-1.5 hover:bg-red-500/10 rounded text-red-500 hover:text-red-600 transition-colors"
                                title="Delete banner"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingBanner ? 'Edit Homepage Banner' : 'Create Homepage Banner'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  label="Banner Image (Desktop) *"
                  value={bannerImage}
                  onChange={setBannerImage}
                  placeholder="Upload high-res desktop hero (aspect 16:9)"
                  aspectRatio="aspect-video"
                />
                <ImageUpload
                  label="Mobile Override (Optional)"
                  value={mobileBannerImage}
                  onChange={setMobileBannerImage}
                  placeholder="Upload vertical cropped banner (aspect 3:4)"
                  aspectRatio="aspect-[3/4]"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Masterpieces in Stone"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Subtitle / Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="e.g. Limited Edition"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-3 select-none cursor-pointer border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-900 h-[46px]">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Set Active</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Description Text (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed promotional context to display on the banner..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      CTA Button Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="e.g. Inquire Now"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      CTA Action Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={ctaLink}
                      onChange={(e) => setCtaLink(e.target.value)}
                      placeholder="e.g. /contact"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              <footer className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 pb-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 text-sm font-bold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-75"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={deleteBannerId !== null}
        onClose={() => setDeleteBannerId(null)}
        onConfirm={handleDelete}
        title="Delete Banner"
        message="Are you sure you want to permanently delete this homepage banner? This action cannot be undone."
        confirmText="Delete Banner"
        type="danger"
      />
    </div>
  );
};

export default BannersModule;
