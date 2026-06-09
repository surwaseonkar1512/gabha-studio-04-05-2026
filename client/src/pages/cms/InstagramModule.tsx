import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Pencil, Trash2, Move, X, RefreshCw, ExternalLink, Check } from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface InstagramItem {
  _id: string;
  image: string;
  url: string;
  caption?: string;
  displayOrder: number;
}

const InstagramModule = () => {
  const [items, setItems] = useState<InstagramItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InstagramItem | null>(null);

  // Form states
  const [image, setImage] = useState('');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');

  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/cms/instagram');
      setItems(data);
    } catch (error) {
      toast.error('Failed to load Instagram items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setImage('');
    setUrl('');
    setCaption('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: InstagramItem) => {
    setEditingItem(item);
    setImage(item.image);
    setUrl(item.url);
    setCaption(item.caption || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      toast.error('Post image is required');
      return;
    }
    if (!url) {
      toast.error('Instagram post URL is required');
      return;
    }

    setSaving(true);
    const payload = {
      image,
      url,
      caption: caption || undefined,
      displayOrder: editingItem ? editingItem.displayOrder : items.length
    };

    try {
      if (editingItem) {
        await api.put(`/cms/instagram/${editingItem._id}`, payload);
        toast.success('Instagram item updated successfully');
      } else {
        await api.post('/cms/instagram', payload);
        toast.success('Instagram item added successfully');
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItemId) return;
    try {
      await api.delete(`/cms/instagram/${deleteItemId}`);
      toast.success('Item deleted successfully');
      setDeleteItemId(null);
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reordered = Array.from(items);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    const updated = reordered.map((item, idx) => ({
      ...item,
      displayOrder: idx
    }));
    setItems(updated);

    try {
      const orders = updated.map(item => ({ id: item._id, displayOrder: item.displayOrder }));
      await api.put('/cms/instagram/reorder', { orders });
      toast.success('Instagram feed order saved');
    } catch (error) {
      toast.error('Failed to save layout order');
      fetchItems();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Instagram Gallery Section
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Populate and rearrange the social media showcase grid showing current Instagram posts on the website.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Add IG Post
        </button>
      </div>

      {/* Grid of items */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="h-8 w-8 text-pink-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-12 text-center text-zinc-400">

          <p className="font-semibold text-sm">No Instagram posts linked yet</p>
          <p className="text-xs text-zinc-400 mt-1">Link your IG posts to render a live social media feed.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>Linked IG Posts (Drag to Reorder)</span>
            <span>Total posts: {items.length}</span>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="instagram-items">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="divide-y divide-zinc-200 dark:divide-zinc-800"
                >
                  {items.map((item, index) => (
                    <Draggable key={item._id} draggableId={item._id} index={index}>
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
                          <div className="h-16 w-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0 self-center sm:self-auto">
                            <img src={item.image} alt={item.caption || 'IG Image'} className="w-full h-full object-cover" />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">
                              {item.caption || <span className="text-zinc-400 italic font-normal">No caption</span>}
                            </h3>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-amber-500 hover:underline flex items-center gap-1 mt-1 font-semibold truncate max-w-sm"
                            >
                              View Instagram Post <ExternalLink size={12} />
                            </a>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-end gap-3 self-end sm:self-auto shrink-0">
                            <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                                title="Edit post link"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => setDeleteItemId(item._id)}
                                className="p-1.5 hover:bg-red-500/10 rounded text-red-500 hover:text-red-600 transition-colors"
                                title="Delete link"
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
                {editingItem ? 'Edit Instagram Item' : 'Add Instagram Item'}
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
                label="Instagram Post Capture *"
                value={image}
                onChange={setImage}
                placeholder="Upload vertical cropped IG cover (aspect 1:1 or 4:5)"
                aspectRatio="aspect-square"
              />

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Instagram Post URL Link *
                  </label>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.instagram.com/p/..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Optional Caption / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a small tag or reference caption for this post..."
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
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-75"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save Item'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={deleteItemId !== null}
        onClose={() => setDeleteItemId(null)}
        onConfirm={handleDelete}
        title="Remove Social Media Link"
        message="Are you sure you want to remove this linked Instagram post from your website feed? This action will not delete your post from Instagram itself."
        confirmText="Remove Post Link"
        type="danger"
      />
    </div>
  );
};

export default InstagramModule;
