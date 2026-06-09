import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Layers, Plus, Pencil, Trash2, Move, X, RefreshCw, Check } from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  categoryImage: string;
  title: string;
  description?: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
}

const CategoryModule = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [categoryImage, setCategoryImage] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);
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
    setTitle('');
    setDescription('');
    setSlug('');
    setIsActive(true);
    setIsSlugManuallyEdited(false);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryImage(category.categoryImage);
    setTitle(category.title);
    setDescription(category.description || '');
    setSlug(category.slug);
    setIsActive(category.isActive);
    setIsSlugManuallyEdited(true); // Treat as manual so slug stays locked
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryImage) {
      toast.error('Category image cover is required');
      return;
    }
    if (!title) {
      toast.error('Title is required');
      return;
    }
    if (!slug) {
      toast.error('Slug is required');
      return;
    }

    setSaving(true);
    const payload = {
      categoryImage,
      title,
      description: description || undefined,
      slug,
      isActive,
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
    try {
      const { data } = await api.put(`/cms/categories/${category._id}`, { isActive: !category.isActive });
      setCategories(prev => prev.map(c => c._id === category._id ? data : c));
      toast.success(`Category is now ${!category.isActive ? 'Active' : 'Inactive'}`);
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
            <Layers className="h-6 w-6 text-purple-500" /> Category Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Group sculptured catalog items. Define custom path slugs, descriptions, cover images, and reorder tab slots.
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
                  {categories.map((category, index) => (
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
                            <img src={category.categoryImage} alt={category.title} className="w-full h-full object-cover" />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">{category.title}</h3>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                              Slug: <span className="font-mono bg-zinc-50 dark:bg-zinc-950 px-1 py-0.5 rounded text-amber-600 dark:text-amber-500">/{category.slug}</span>
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-3 self-end sm:self-auto shrink-0">
                            <button
                              onClick={() => handleToggleActive(category)}
                              className={`text-xs px-2.5 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors border ${category.isActive
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500'
                                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                                }`}
                            >
                              {category.isActive ? 'Active' : 'Inactive'}
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
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              <ImageUpload
                label="Category Cover Image *"
                value={categoryImage}
                onChange={setCategoryImage}
                placeholder="Upload category cover photo (aspect 4:3 or 1:1)"
                aspectRatio="aspect-video"
              />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Category Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Marble Sculptures"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5 flex justify-between">
                    <span>Category Slug (URL Path) *</span>
                    {!isSlugManuallyEdited && <span className="text-[10px] text-amber-500 font-bold lowercase">Auto-linked</span>}
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="e.g. marble-sculptures"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <label className="flex items-center gap-3 select-none cursor-pointer border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Set Active</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Description / Catchphrase (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a small summary or subtitle describing this segment..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm resize-none"
                  />
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
