import React, { useState, useEffect } from 'react';
import { Info, Save, RefreshCw, Clock, Plus, Pencil, Trash2, X, Check, ArrowUp, ArrowDown } from 'lucide-react';
import api from '../../api/axiosInstance';
import ImageUpload from '../../components/cms/ImageUpload';
import RichTextEditor from '../../components/cms/RichTextEditor';
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

const AboutUsModule = () => {
  const [activeTab, setActiveTab] = useState<'content' | 'journey'>('content');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Content Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [leftImage, setLeftImage] = useState('');
  const [rightImage, setRightImage] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaLink, setCtaLink] = useState('');

  // Journey timeline states
  const [milestones, setMilestones] = useState<JourneyMilestone[]>([]);
  const [loadingJourney, setLoadingJourney] = useState(true);
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<JourneyMilestone | null>(null);

  // Milestone Form states
  const [milestoneYear, setMilestoneYear] = useState('');
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneImage, setMilestoneImage] = useState('');
  const [milestoneOrder, setMilestoneOrder] = useState(0);
  const [milestoneIsActive, setMilestoneIsActive] = useState(true);

  const [deleteMilestoneId, setDeleteMilestoneId] = useState<string | null>(null);

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

  const fetchMilestones = async () => {
    try {
      const { data } = await api.get('/cms/journey');
      setMilestones(data);
    } catch (error) {
      toast.error('Failed to load timeline milestones');
    } finally {
      setLoadingJourney(false);
    }
  };

  useEffect(() => {
    fetchAboutUs();
    fetchMilestones();
  }, []);

  const handleContentSubmit = async (e: React.FormEvent) => {
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

  // Milestone action triggers
  const openAddMilestoneModal = () => {
    setEditingMilestone(null);
    setMilestoneYear('');
    setMilestoneTitle('');
    setMilestoneDescription('');
    setMilestoneImage('');
    setMilestoneOrder(milestones.length);
    setMilestoneIsActive(true);
    setIsMilestoneModalOpen(true);
  };

  const openEditMilestoneModal = (m: JourneyMilestone) => {
    setEditingMilestone(m);
    setMilestoneYear(m.year);
    setMilestoneTitle(m.title);
    setMilestoneDescription(m.description || '');
    setMilestoneImage(m.image || '');
    setMilestoneOrder(m.displayOrder);
    setMilestoneIsActive(m.isActive);
    setIsMilestoneModalOpen(true);
  };

  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneYear) {
      toast.error('Year is required');
      return;
    }
    if (!milestoneTitle) {
      toast.error('Title is required');
      return;
    }

    setSavingMilestone(true);
    const payload = {
      year: milestoneYear,
      title: milestoneTitle,
      description: milestoneDescription,
      image: milestoneImage || undefined,
      displayOrder: milestoneOrder,
      isActive: milestoneIsActive
    };

    try {
      if (editingMilestone) {
        await api.put(`/cms/journey/${editingMilestone._id}`, payload);
        toast.success('Milestone updated successfully');
      } else {
        await api.post('/cms/journey', payload);
        toast.success('Milestone added successfully');
      }
      setIsMilestoneModalOpen(false);
      fetchMilestones();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save milestone');
    } finally {
      setSavingMilestone(false);
    }
  };

  const handleMilestoneDelete = async () => {
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

  const handleToggleMilestoneActive = async (milestone: JourneyMilestone) => {
    try {
      const { data } = await api.put(`/cms/journey/${milestone._id}`, { isActive: !milestone.isActive });
      setMilestones(prev => prev.map(m => m._id === milestone._id ? data : m));
      toast.success(`Milestone status updated`);
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
      setMilestones(reordered.map((m, idx) => ({ ...m, displayOrder: idx })));
      await api.put('/cms/journey/reorder', { orders });
      toast.success('Timeline reordered');
    } catch (error) {
      toast.error('Failed to update order');
      fetchMilestones();
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
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Info className="h-6 w-6 text-blue-500" /> Our Story / About Us Management
        </h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Configure the storytelling header details and chronologic milestones displayed on the public website.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('content')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'content'
              ? 'border-amber-500 text-amber-600 dark:text-amber-500'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Intro & Header Content
        </button>
        <button
          onClick={() => setActiveTab('journey')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'journey'
              ? 'border-amber-500 text-amber-600 dark:text-amber-500'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Clock size={16} /> Journey Timeline Milestones
        </button>
      </div>

      {/* TAB CONTENT: Static Intro Form */}
      {activeTab === 'content' && (
        <form onSubmit={handleContentSubmit} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
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
                placeholder="e.g. Crafting clay with passion"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-amber-500 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUpload
              label="Left Showcase Image (Optional)"
              value={leftImage}
              onChange={setLeftImage}
              placeholder="Upload left side artwork display (square crop 1:1)"
              aspectRatio="aspect-square"
            />
            <ImageUpload
              label="Right Showcase Image (Optional)"
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
            placeholder="Craft your narrative..."
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
      )}

      {/* TAB CONTENT: Timeline Milestones list */}
      {activeTab === 'journey' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Timeline Journey Milestones</h3>
            <button
              onClick={openAddMilestoneModal}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
            >
              <Plus size={14} /> Add Milestone
            </button>
          </div>

          {loadingJourney ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="h-6 w-6 text-orange-500 animate-spin" />
            </div>
          ) : milestones.length === 0 ? (
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl p-12 text-center text-zinc-400">
              <Clock className="h-10 w-10 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
              <p className="font-semibold text-xs">No milestones saved yet</p>
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
                    <tr key={m._id} className={m.isActive ? '' : 'opacity-65 bg-gray-50/50 dark:bg-zinc-950/20'}>
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
                            <Clock className="h-4 w-4 text-zinc-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">{m.year}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{m.title}</td>
                      <td className="px-6 py-4 max-w-xs truncate text-gray-500 dark:text-zinc-400">{m.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleMilestoneActive(m)}
                          className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border transition-colors ${
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
                            onClick={() => openEditMilestoneModal(m)}
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
        </div>
      )}

      {/* Add/Edit Milestone Modal */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col custom-scrollbar">
            <header className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white dark:bg-zinc-900 z-10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingMilestone ? 'Edit Journey Milestone' : 'Add Journey Milestone'}
              </h2>
              <button
                onClick={() => setIsMilestoneModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleMilestoneSubmit} className="p-6 space-y-6 flex-1">
              <ImageUpload
                label="Milestone Image"
                value={milestoneImage}
                onChange={setMilestoneImage}
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
                      value={milestoneYear}
                      onChange={(e) => setMilestoneYear(e.target.value)}
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
                      value={milestoneTitle}
                      onChange={(e) => setMilestoneTitle(e.target.value)}
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
                      value={milestoneOrder}
                      onChange={(e) => setMilestoneOrder(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-orange-500 rounded-xl text-sm"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <label className="flex items-center gap-3 select-none cursor-pointer border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-950 h-[46px]">
                      <input
                        type="checkbox"
                        checked={milestoneIsActive}
                        onChange={(e) => setMilestoneIsActive(e.target.checked)}
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
                    value={milestoneDescription}
                    onChange={(e) => setMilestoneDescription(e.target.value)}
                    placeholder="Describe this step in the studio's journey..."
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-orange-500 rounded-xl text-sm resize-none"
                  />
                </div>
              </div>

              <footer className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 pb-2">
                <button
                  type="button"
                  onClick={() => setIsMilestoneModalOpen(false)}
                  className="px-5 py-2.5 border border-zinc-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 text-sm font-bold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMilestone}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-75"
                >
                  {savingMilestone ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                  {savingMilestone ? 'Saving...' : 'Save Milestone'}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete Milestone Confirmation */}
      <ConfirmModal
        isOpen={deleteMilestoneId !== null}
        onClose={() => setDeleteMilestoneId(null)}
        onConfirm={handleMilestoneDelete}
        title="Delete Journey Milestone"
        message="Are you sure you want to permanently delete this milestone? It will be removed from your timeline presentation on the public website immediately."
        confirmText="Delete Milestone"
        type="danger"
      />
    </div>
  );
};

export default AboutUsModule;
