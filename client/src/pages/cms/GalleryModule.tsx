import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Image as ImageIcon, Plus, Pencil, Trash2, Move, X, RefreshCw, UploadCloud, Check } from 'lucide-react';
import api from '../../api/axiosInstance';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface GalleryImage {
  url: string;
  displayOrder: number;
}

interface Gallery {
  _id: string;
  title: string;
  images: GalleryImage[];
  isActive: boolean;
  displayOrder: number;
}

const GalleryModule = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null);

  const fetchGalleries = async () => {
    try {
      const { data } = await api.get('/cms/gallery');
      setGalleries(data);
    } catch (error) {
      toast.error('Failed to load galleries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const openAddModal = () => {
    setEditingGallery(null);
    setTitle('');
    setIsActive(true);
    setImages([]);
    setIsModalOpen(true);
  };

  const openEditModal = (gallery: Gallery) => {
    setEditingGallery(gallery);
    setTitle(gallery.title);
    setIsActive(gallery.isActive);
    // Sort images by displayOrder before rendering
    setImages([...gallery.images].sort((a, b) => a.displayOrder - b.displayOrder));
    setIsModalOpen(true);
  };

  const handleMultipleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const availableSlots = 15 - images.length;

    if (files.length > availableSlots) {
      toast.error(`You can only add up to ${availableSlots} more image(s). Max limit is 15.`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const { data } = await api.post('/cms/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const newImages = data.urls.map((url: string, index: number) => ({
        url,
        displayOrder: images.length + index
      }));

      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== index);
      return updated.map((img, idx) => ({ ...img, displayOrder: idx }));
    });
    toast.success('Image removed from slot');
  };

  const handleImageDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updated = items.map((item, idx) => ({
      ...item,
      displayOrder: idx
    }));
    setImages(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      toast.error('Gallery title is required');
      return;
    }
    if (images.length === 0) {
      toast.error('At least one gallery image is required');
      return;
    }

    setSaving(true);
    const payload = {
      title,
      images,
      isActive,
      displayOrder: editingGallery ? editingGallery.displayOrder : galleries.length
    };

    try {
      if (editingGallery) {
        await api.put(`/cms/gallery/${editingGallery._id}`, payload);
        toast.success('Gallery updated successfully');
      } else {
        await api.post('/cms/gallery', payload);
        toast.success('Gallery created successfully');
      }
      setIsModalOpen(false);
      fetchGalleries();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save gallery');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteGalleryId) return;
    try {
      await api.delete(`/cms/gallery/${deleteGalleryId}`);
      toast.success('Gallery deleted successfully');
      setDeleteGalleryId(null);
      fetchGalleries();
    } catch (error) {
      toast.error('Failed to delete gallery');
    }
  };

  const handleGalleryDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(galleries);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, idx) => ({
      ...item,
      displayOrder: idx
    }));
    setGalleries(updatedItems);

    try {
      const orders = updatedItems.map(item => ({ id: item._id, displayOrder: item.displayOrder }));
      await api.put('/cms/gallery/reorder', { orders });
      toast.success('Gallery order updated');
    } catch (error) {
      toast.error('Failed to save gallery order');
      fetchGalleries();
    }
  };

  const handleToggleActive = async (gallery: Gallery) => {
    try {
      const { data } = await api.put(`/cms/gallery/${gallery._id}`, { isActive: !gallery.isActive });
      setGalleries(prev => prev.map(g => g._id === gallery._id ? data : g));
      toast.success(`Gallery is now ${!gallery.isActive ? 'Active' : 'Inactive'}`);
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
            <ImageIcon className="h-6 w-6 text-emerald-500" /> Gallery Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Organize site photo showcases, drag-and-drop sort, toggle views, and manage multi-image gallery sets.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Add Gallery Section
        </button>
      </div>

      {/* Galleries list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      ) : galleries.length === 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-12 text-center text-zinc-400">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
          <p className="font-semibold text-sm">No galleries created yet</p>
          <p className="text-xs text-zinc-400 mt-1">Create a gallery section and populate it with portfolio images.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>List of Galleries (Drag to Reorder)</span>
            <span>Total: {galleries.length}</span>
          </div>

          <DragDropContext onDragEnd={handleGalleryDragEnd}>
            <Droppable droppableId="galleries">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="divide-y divide-zinc-200 dark:divide-zinc-800"
                >
                  {galleries.map((gallery, index) => (
                    <Draggable key={gallery._id} draggableId={gallery._id} index={index}>
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

                          {/* Preview Grid Grid */}
                          <div className="flex -space-x-4 overflow-hidden py-1 self-center sm:self-auto">
                            {gallery.images.slice(0, 5).map((img, idx) => (
                              <img
                                key={idx}
                                src={img.url}
                                alt={`Sub-preview ${idx}`}
                                className="inline-block h-12 w-12 rounded-full ring-2 ring-white dark:ring-zinc-900 object-cover shrink-0"
                              />
                            ))}
                            {gallery.images.length > 5 && (
                              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 ring-2 ring-white dark:ring-zinc-900 text-xs font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
                                +{gallery.images.length - 5}
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">{gallery.title}</h3>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                              Images: {gallery.images.length} (Max 15)
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-3 self-end sm:self-auto shrink-0">
                            <button
                              onClick={() => handleToggleActive(gallery)}
                              className={`text-xs px-2.5 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors border ${gallery.isActive
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500'
                                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                                }`}
                            >
                              {gallery.isActive ? 'Active' : 'Inactive'}
                            </button>

                            <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
                              <button
                                onClick={() => openEditModal(gallery)}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                                title="Edit gallery details"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteGalleryId(gallery._id)}
                                className="p-1.5 hover:bg-red-500/10 rounded text-red-500 hover:text-red-600 transition-colors"
                                title="Delete gallery"
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
                {editingGallery ? 'Edit Gallery Section' : 'Create Gallery Section'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Gallery Title / Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Marble Masterpieces"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 select-none cursor-pointer border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950 h-[46px]">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Set Active</span>
                  </label>
                </div>
              </div>

              {/* Upload area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
                  Upload Gallery Photos (Max 15 images)
                </label>
                <div
                  onClick={() => !uploading && images.length < 15 && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors flex flex-col items-center justify-center space-y-2 ${images.length >= 15 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleMultipleUpload}
                    disabled={uploading || images.length >= 15}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center text-emerald-500 space-y-2">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                      <span className="text-xs font-bold">Uploading images...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-zinc-400 space-y-1">
                      <UploadCloud className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                      <p className="text-xs font-medium">
                        <span className="text-emerald-600 font-bold">Click to select files</span> (Multiple allowed)
                      </p>
                      <p className="text-[10px] text-zinc-400">Current: {images.length}/15 slots occupied</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Images list for reordering */}
              {images.length > 0 && (
                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Sort & Manage Gallery Photos ({images.length})
                  </div>

                  <DragDropContext onDragEnd={handleImageDragEnd}>
                    <Droppable droppableId="gallery-images">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[300px] overflow-y-auto custom-scrollbar"
                        >
                          {images.map((img, index) => (
                            <Draggable key={img.url} draggableId={img.url} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex items-center p-3 gap-3 ${snapshot.isDragging ? 'bg-zinc-50 dark:bg-zinc-800' : 'bg-white dark:bg-zinc-900'
                                    }`}
                                >
                                  <div {...provided.dragHandleProps} className="text-zinc-400 cursor-grab active:cursor-grabbing p-1">
                                    <Move size={14} />
                                  </div>
                                  <img src={img.url} alt={`Thumb ${index}`} className="h-10 w-10 rounded object-cover border border-zinc-200 dark:border-zinc-700 shrink-0" />
                                  <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate flex-1">
                                    Slot {index + 1}: {img.url.split('/').pop()}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="p-1 hover:bg-red-500/10 rounded text-red-500 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
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
                  disabled={saving || uploading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-75"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save Gallery'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteGalleryId !== null}
        onClose={() => setDeleteGalleryId(null)}
        onConfirm={handleDelete}
        title="Delete Gallery Section"
        message="Are you sure you want to permanently delete this gallery section and remove all its photo slots? This action is destructive and cannot be undone."
        confirmText="Delete Gallery"
        type="danger"
      />
    </div>
  );
};

export default GalleryModule;
