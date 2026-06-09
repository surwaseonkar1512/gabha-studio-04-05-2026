import React, { useState, useEffect } from 'react';
import { FileText, Plus, Pencil, Trash2, X, RefreshCw, Star, Check } from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface Testimonial {
  _id: string;
  name: string;
  image?: string;
  designation?: string;
  message: string;
  rating: number;
  isActive: boolean;
}

const TestimonialsModule = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [designation, setDesignation] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [deleteTestimonialId, setDeleteTestimonialId] = useState<string | null>(null);

  const fetchTestimonials = async () => {
    try {
      const { data } = await api.get('/cms/testimonials');
      setTestimonials(data);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const openAddModal = () => {
    setEditingTestimonial(null);
    setName('');
    setImage('');
    setDesignation('');
    setRating(5);
    setMessage('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (t: Testimonial) => {
    setEditingTestimonial(t);
    setName(t.name);
    setImage(t.image || '');
    setDesignation(t.designation || '');
    setRating(t.rating);
    setMessage(t.message);
    setIsActive(t.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Customer name is required');
      return;
    }
    if (!message) {
      toast.error('Review message is required');
      return;
    }

    setSaving(true);
    const payload = {
      name,
      image: image || undefined,
      designation: designation || undefined,
      rating,
      message,
      isActive
    };

    try {
      if (editingTestimonial) {
        await api.put(`/cms/testimonials/${editingTestimonial._id}`, payload);
        toast.success('Testimonial updated successfully');
      } else {
        await api.post('/cms/testimonials', payload);
        toast.success('Testimonial added successfully');
      }
      setIsModalOpen(false);
      fetchTestimonials();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTestimonialId) return;
    try {
      await api.delete(`/cms/testimonials/${deleteTestimonialId}`);
      toast.success('Testimonial deleted successfully');
      setDeleteTestimonialId(null);
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      const { data } = await api.put(`/cms/testimonials/${testimonial._id}`, { isActive: !testimonial.isActive });
      setTestimonials(prev => prev.map(t => t._id === testimonial._id ? data : t));
      toast.success(`Testimonial is now ${!testimonial.isActive ? 'Active' : 'Inactive'}`);
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
            <FileText className="h-6 w-6 text-indigo-500" /> Testimonials Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Display validation from satisfied art collectors. Manage star ratings, names, designations, and visibility toggles.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {/* Grid of items */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-12 text-center text-zinc-400">
          <FileText className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
          <p className="font-semibold text-sm">No testimonials published yet</p>
          <p className="text-xs text-zinc-400 mt-1">Add client endorsements to construct the home reviews slider.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t._id}
              className={`bg-white dark:bg-zinc-900 border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 ${
                t.isActive ? 'border-zinc-200 dark:border-zinc-800' : 'border-dashed border-zinc-300 dark:border-zinc-800 opacity-60'
              }`}
            >
              <div className="space-y-4">
                {/* Header author details */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                    {t.image ? (
                      <img src={t.image} alt={t.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{t.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate text-sm">{t.name}</h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{t.designation || 'Collector'}</p>
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      size={14}
                      className={idx < t.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}
                    />
                  ))}
                </div>

                {/* Review body */}
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 italic">
                  "{t.message}"
                </p>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-6">
                <button
                  onClick={() => handleToggleActive(t)}
                  className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider transition-colors border ${
                    t.isActive
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500'
                      : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {t.isActive ? 'Active' : 'Inactive'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                    title="Edit review"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTestimonialId(t._id)}
                    className="p-1.5 hover:bg-red-500/10 rounded text-red-500 hover:text-red-600 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
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
                label="Customer Profile Image (Optional)"
                value={image}
                onChange={setImage}
                placeholder="Upload vertical square headshot (aspect 1:1)"
                aspectRatio="aspect-square"
              />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Client Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Designation / Location
                    </label>
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Interior Designer, CA"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Star Rating *
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm appearance-none cursor-pointer text-zinc-700 dark:text-zinc-300"
                    >
                      <option value={5}>5 Stars (Excellent)</option>
                      <option value={4}>4 Stars (Good)</option>
                      <option value={3}>3 Stars (Average)</option>
                      <option value={2}>2 Stars (Below Average)</option>
                      <option value={1}>1 Star (Poor)</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-3 select-none cursor-pointer border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950 h-[46px]">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Set Active</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Endorsement Message / Review *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write client feedback statement here..."
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
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-75"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save Testimonial'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteTestimonialId !== null}
        onClose={() => setDeleteTestimonialId(null)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message="Are you sure you want to permanently delete this testimonial? This endorsement review will be removed from your website display immediately."
        confirmText="Delete Review"
        type="danger"
      />
    </div>
  );
};

export default TestimonialsModule;
