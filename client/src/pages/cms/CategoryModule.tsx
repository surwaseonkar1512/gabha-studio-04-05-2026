import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Layers, Plus, Pencil, Trash2, Move, X, RefreshCw, Check, Globe } from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  categoryImage: any;
  bannerImage?: any;
  title: string;
  shortDescription?: string;
  fullDescription?: string;
  parentCategory?: any;
  slug: string;
  isActive: boolean;
  status: 'Active' | 'Inactive' | 'Archived';
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

const CategoryModule = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');

  // Form states
  const [categoryImage, setCategoryImage] = useState('');
  const [bannerImage, setBannerImage] = useState('');
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Archived'>('Active');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/cms/categories');
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isSlugManuallyEdited) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(generateSlug(val));
    setIsSlugManuallyEdited(true);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryImage('');
    setBannerImage('');
    setTitle('');
    setShortDescription('');
    setFullDescription('');
    setParentCategoryId('');
    setSlug('');
    setStatus('Active');
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setIsSlugManuallyEdited(false);
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    
    // Support either old string categoryImage or new object format
    const imgUrl = typeof category.categoryImage === 'object'
      ? category.categoryImage?.secure_url || ''
      : category.categoryImage;
    setCategoryImage(imgUrl);

    const bannerUrl = typeof category.bannerImage === 'object'
      ? category.bannerImage?.secure_url || ''
      : category.bannerImage || '';
    setBannerImage(bannerUrl);

    setTitle(category.title);
    setShortDescription(category.shortDescription || '');
    setFullDescription(category.fullDescription || '');
    setParentCategoryId(category.parentCategory?._id || category.parentCategory || '');
    setSlug(category.slug);
    setStatus(category.status || (category.isActive ? 'Active' : 'Inactive'));
    setSeoTitle(category.seoTitle || '');
    setSeoDescription(category.seoDescription || '');
    setSeoKeywords(category.seoKeywords || '');
    setIsSlugManuallyEdited(true);
    setActiveTab('general');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryImage) {
      toast.error('Category image is required');
      return;
    }
    if (!title) {
      toast.error('Category name is required');
      return;
    }
    if (!slug) {
      toast.error('Slug is required');
      return;
    }

    setSaving(true);
    const payload = {
      categoryImage: typeof categoryImage === 'string' && categoryImage.startsWith('http')
        ? { secure_url: categoryImage, public_id: '' }
        : categoryImage,
      bannerImage: bannerImage
        ? (typeof bannerImage === 'string' && bannerImage.startsWith('http')
          ? { secure_url: bannerImage, public_id: '' }
          : bannerImage)
        : undefined,
      title,
      shortDescription: shortDescription || undefined,
      fullDescription: fullDescription || undefined,
      parentCategory: parentCategoryId || null,
      slug,
      status,
      isActive: status === 'Active',
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
      seoKeywords: seoKeywords || undefined,
      displayOrder: editingCategory ? editingCategory.displayOrder : categories.length
    };

    try {
      if (editingCategory) {
        await api.put(`/cms/categories/${editingCategory._id}`, payload);
        toast.success('Category updated successfully');
      } else {
        await api.post('/cms/categories', payload);
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategoryId) return;
    try {
      await api.delete(`/cms/categories/${deleteCategoryId}`);
      toast.success('Category deleted successfully');
      setDeleteCategoryId(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, idx) => ({
      ...item,
      displayOrder: idx
    }));
    setCategories(updatedItems);

    try {
      const orders = updatedItems.map(item => ({ id: item._id, displayOrder: item.displayOrder }));
      await api.put('/cms/categories/reorder', { orders });
      toast.success('Category order saved');
    } catch (error) {
      toast.error('Failed to save category order');
      fetchCategories();
    }
  };

  const handleToggleActive = async (category: Category) => {
    const nextStatus = category.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const { data } = await api.put(`/cms/categories/${category._id}`, {
        status: nextStatus,
        isActive: nextStatus === 'Active'
      });
      setCategories(prev => prev.map(c => c._id === category._id ? data : c));
      toast.success(`Category is now ${nextStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Filter possible parents to avoid cycles
  const parentCandidates = categories.filter(c => !editingCategory || c._id !== editingCategory._id);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="h-6 w-6 text-purple-500" /> Category Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Structure your storefront catalog by grouping products. Configure parent categories, banner hero graphics, and SEO meta information.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* List / Reorder */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="h-8 w-8 text-purple-500 animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-12 text-center text-zinc-400">
          <Layers className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
          <p className="font-semibold text-sm">No categories created yet</p>
          <p className="text-xs text-zinc-400 mt-1">Create categories to segment the sculptures gallery catalog.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>List of Categories (Drag to Reorder)</span>
            <span>Total: {categories.length}</span>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="divide-y divide-zinc-200 dark:divide-zinc-800"
                >
                  {categories.map((category, index) => {
                    const imgUrl = typeof category.categoryImage === 'object'
                      ? category.categoryImage?.secure_url || ''
                      : category.categoryImage;

                    return (
                      <Draggable key={category._id} draggableId={category._id} index={index}>
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
                              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-grab active:cursor-grabbing self-center sm:self-auto shrink-0 p-1"
                            >
                              <Move size={18} />
                            </div>

                            {/* Image preview */}
                            <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0 self-center sm:self-auto">
                              <img src={imgUrl} alt={category.title} className="w-full h-full object-cover" />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">{category.title}</h3>
                                {category.parentCategory && (
                                  <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 rounded">
                                    Sub of: {category.parentCategory.title || 'Parent'}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-2">
                                Slug: <span className="font-mono bg-zinc-50 dark:bg-zinc-950 px-1 py-0.5 rounded text-amber-600 dark:text-amber-500">/{category.slug}</span>
                                {category.seoTitle && <Globe size={12} className="text-emerald-500" title="SEO optimized" />}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 self-end sm:self-auto shrink-0">
                              <button
                                onClick={() => handleToggleActive(category)}
                                className={`text-xs px-2.5 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors border ${category.status === 'Active' || category.isActive
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500'
                                  : category.status === 'Archived'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500'
                                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                                  }`}
                              >
                                {category.status || (category.isActive ? 'Active' : 'Inactive')}
                              </button>

                              <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
                                <button
                                  onClick={() => openEditModal(category)}
                                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                                  title="Edit category"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button
                                  onClick={() => setDeleteCategoryId(category._id)}
                                  className="p-1.5 hover:bg-red-500/10 rounded text-red-500 hover:text-red-600 transition-colors"
                                  title="Delete category"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
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
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Configure details, banner assets, and search tags.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </header>

            {/* Tabs */}
            <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`py-3 text-sm font-bold border-b-2 px-4 transition-all ${activeTab === 'general'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
              >
                General Info
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`py-3 text-sm font-bold border-b-2 px-4 transition-all ${activeTab === 'seo'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
              >
                SEO & Meta Tags
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              {activeTab === 'general' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImageUpload
                      label="Thumbnail Cover Photo *"
                      value={categoryImage}
                      onChange={setCategoryImage}
                      placeholder="Category listing photo"
                      aspectRatio="aspect-square"
                    />
                    <ImageUpload
                      label="Category Banner Image (Optional)"
                      value={bannerImage}
                      onChange={setBannerImage}
                      placeholder="Category landing page banner"
                      aspectRatio="aspect-video"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. Marble Sculptures"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 rounded-xl text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5 flex justify-between">
                        <span>URL Slug *</span>
                        {!isSlugManuallyEdited && <span className="text-[10px] text-purple-500 lowercase">Auto-linked</span>}
                      </label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="e.g. marble-sculptures"
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 rounded-xl text-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                        Parent Category (Optional)
                      </label>
                      <select
                        value={parentCategoryId}
                        onChange={(e) => setParentCategoryId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 rounded-xl text-sm appearance-none cursor-pointer text-zinc-700 dark:text-zinc-300"
                      >
                        <option value="">None (Top-Level)</option>
                        {parentCandidates.map((c) => (
                          <option key={c._id} value={c._id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                        Publish Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 rounded-xl text-sm appearance-none cursor-pointer text-zinc-700 dark:text-zinc-300"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Short Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Brief teaser copy for listing cards..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 rounded-xl text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Full Description (Optional)
                    </label>
                    <textarea
                      rows={4}
                      value={fullDescription}
                      onChange={(e) => setFullDescription(e.target.value)}
                      placeholder="Detailed overview for the category category page..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 rounded-xl text-sm resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="e.g. Fine Marble Sculptures & Statues | Gabha Studio"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      SEO Meta Description
                    </label>
                    <textarea
                      rows={3}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Provide keyword-rich snippet for Google search index rankings..."
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 rounded-xl text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      SEO Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="e.g. marble, sculpture, statues, temple carvings"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-purple-500 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

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
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-75"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteCategoryId !== null}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? If there are any associated products under this category, the server will block this deletion to prevent database corruption."
        confirmText="Delete Category"
        type="danger"
      />
    </div>
  );
};

export default CategoryModule;
