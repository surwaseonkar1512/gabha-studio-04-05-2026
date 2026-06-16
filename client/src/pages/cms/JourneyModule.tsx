import React, { useState, useEffect } from 'react';
import { Clock, Plus, Pencil, Trash2, X, RefreshCw, Check, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import ConfirmModal from '../../components/ui/ConfirmModal';
import toast from 'react-hot-toast';

interface JourneyMilestone {
  _id: string;
  year: string;
  title: string;
  description: string;
  image?: string;
  displayOrder: number;
  isActive: boolean;
}

const JourneyModule = () => {
  const [milestones, setMilestones] = useState<JourneyMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<JourneyMilestone | null>(null);

  // Form states
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const [deleteMilestoneId, setDeleteMilestoneId] = useState<string | null>(null);

  const fetchMilestones = async () => {
    try {
      const { data } = await api.get('/cms/journey');
      setMilestones(data);
    } catch (error) {
      toast.error('Failed to load journey milestones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMilestones();
  }, []);

  const openAddModal = () => {
    setEditingMilestone(null);
    setYear('');
    setTitle('');
    setDescription('');
    setImage('');
    setDisplayOrder(milestones.length);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (m: JourneyMilestone) => {
    setEditingMilestone(m);
    setYear(m.year);
    setTitle(m.title);
    setDescription(m.description || '');
    setImage(m.image || '');
    setDisplayOrder(m.displayOrder);
    setIsActive(m.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!year) {
      toast.error('Year is required');
      return;
    }
    if (!title) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    const payload = {
      year,
      title,
      description,
      image: image || undefined,
      displayOrder,
      isActive
    };

    try {
      if (editingMilestone) {
        await api.put(`/cms/journey/${editingMilestone._id}`, payload);
        toast.success('Journey milestone updated successfully');
      } else {
        await api.post('/cms/journey', payload);
        toast.success('Journey milestone added successfully');
      }
      setIsModalOpen(false);
      fetchMilestones();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save milestone');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteMilestoneId) return;
    try {
      await api.delete(`/cms/journey/${deleteMilestoneId}`);
      toast.success('Milestone deleted successfully');
      setDeleteMilestoneId(null);
      fetchMilestones();
    } catch (error) {
      toast.error('Failed to delete milestone');
    }
  };

  const handleToggleActive = async (milestone: JourneyMilestone) => {
    try {
      const { data } = await api.put(`/cms/journey/${milestone._id}`, { isActive: !milestone.isActive });
      setMilestones(prev => prev.map(m => m._id === milestone._id ? data : m));
      toast.success(`Milestone is now ${!milestone.isActive ? 'Active' : 'Inactive'}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const moveMilestone = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= milestones.length) return;

    const reordered = [...milestones];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    // Map new display orders
    const orders = reordered.map((m, idx) => ({
      id: m._id,
      displayOrder: idx
    }));

    try {
      // Optimistic update
      setMilestones(reordered.map((m, idx) => ({ ...m, displayOrder: idx })));
      await api.put('/cms/journey/reorder', { orders });
      toast.success('Journey order updated');
    } catch (error) {
      toast.error('Failed to update order');
      fetchMilestones();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="h-6 w-6 text-orange-500" /> Our Story Journey Timeline
          </h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Manage the chronological milestones shown on the public "Our Story" page.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={16} /> Add Milestone
        </button>
      </div>

      {/* List / Table of milestones */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      ) : milestones.length === 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-12 text-center text-zinc-400">
          <Clock className="h-12 w-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
          <p className="font-semibold text-sm">No journey milestones created yet</p>
          <p className="text-xs text-zinc-400 mt-1">Add chronological events to build the timeline on the Our Story page.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-gray-50 dark:bg-zinc-950">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Order</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Image</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Year</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Title</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Description</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
              {milestones.map((m, idx) => (
                <tr key={m._id} className={m.isActive ? '' : 'opacity-60 bg-gray-50/50 dark:bg-zinc-950/20'}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveMilestone(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded disabled:opacity-30"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveMilestone(idx, 'down')}
                        disabled={idx === milestones.length - 1}
                        className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded disabled:opacity-30"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-10 w-16 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                      {m.image ? (
                        <img src={m.image} alt={m.title} className="h-full w-full object-cover" />
                      ) : (
                        <Clock className="h-5 w-5 text-zinc-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">{m.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{m.title}</td>
                  <td className="px-6 py-4 max-w-xs truncate text-gray-500 dark:text-zinc-400">{m.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(m)}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border transition-colors ${
                        m.isActive
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500'
                          : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {m.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                        title="Edit milestone"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteMilestoneId(m._id)}
                        className="p-1.5 hover:bg-red-500/10 rounded text-red-500 hover:text-red-600 transition-colors"
                        title="Delete milestone"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingMilestone ? 'Edit Journey Milestone' : 'Add Journey Milestone'}
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
                label="Milestone Image"
                value={image}
                onChange={setImage}
                placeholder="Upload milestone representation (landscape ratio recommended)"
                aspectRatio="aspect-[4/3]"
              />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Year *
                    </label>
                    <input
                      type="text"
                      required
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g. 2002"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-orange-500 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. The Beginning"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-orange-500 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-orange-500 rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-3 select-none cursor-pointer border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950 h-[46px]">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm font-bold text-gray-700 dark:text-zinc-300">Set Active Status</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this step in the studio's journey..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-orange-500 rounded-xl text-sm resize-none"
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
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-75"
                >
                  {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                  {saving ? 'Saving...' : 'Save Milestone'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={deleteMilestoneId !== null}
        onClose={() => setDeleteMilestoneId(null)}
        onConfirm={handleDelete}
        title="Delete Journey Milestone"
        message="Are you sure you want to permanently delete this milestone? It will be removed from your timeline presentation on the public website immediately."
        confirmText="Delete Milestone"
        type="danger"
      />
    </div>
  );
};

export default JourneyModule;
