import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Save, X, ClipboardList, Info, Download } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface MasterItem {
  description: string;
  amount: number;
}

interface QuotationMaster {
  _id: string;
  name: string;
  items: MasterItem[];
  gstPercentage?: number;
  createdAt: string;
}

const QuotationMasterModule: React.FC = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [items, setItems] = useState<MasterItem[]>([{ description: '', amount: 0 }]);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  // Fetch all quotation templates
  const { data: masters, isLoading } = useQuery<QuotationMaster[]>({
    queryKey: ['quotation-masters'],
    queryFn: async () => {
      const { data } = await api.get('/quotation-masters');
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newMaster: { name: string; items: MasterItem[], gstPercentage: number }) => {
      return api.post('/quotation-masters', newMaster);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation-masters'] });
      toast.success('Quotation Template created successfully');
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create template');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; items: MasterItem[], gstPercentage: number } }) => {
      return api.put(`/quotation-masters/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation-masters'] });
      toast.success('Quotation Template updated successfully');
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update template');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/quotation-masters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotation-masters'] });
      toast.success('Template deleted successfully');
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast.error('Failed to delete template');
      setDeleteConfirmId(null);
    }
  });

  const resetForm = () => {
    setName('');
    setItems([{ description: '', amount: 0 }]);
    setGstPercentage(18);
    setEditingId(null);
    setIsOpen(false);
  };

  const handleEditClick = (master: QuotationMaster) => {
    setEditingId(master._id);
    setName(master.name);
    setItems(master.items.length > 0 ? master.items : [{ description: '', amount: 0 }]);
    setGstPercentage(master.gstPercentage !== undefined ? master.gstPercentage : 18);
    setIsOpen(true);
  };

  const handleAddItemRow = () => {
    setItems(prev => [...prev, { description: '', amount: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof MasterItem, value: string | number) => {
    setItems(prev => {
      const updated = [...prev];
      if (field === 'amount') {
        updated[index] = { ...updated[index], amount: Math.max(0, Number(value)) };
      } else {
        updated[index] = { ...updated[index], description: String(value) };
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    const filteredItems = items.filter(item => item.description.trim() !== '');
    if (filteredItems.length === 0) {
      toast.error('Please enter at least one item description');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { name, items: filteredItems, gstPercentage } });
    } else {
      createMutation.mutate({ name, items: filteredItems, gstPercentage });
    }
  };

  const calculateTotal = (masterItems: MasterItem[]) => {
    return masterItems.reduce((acc, item) => acc + item.amount, 0);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotation Masters</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Predefine your service packages and price templates</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsOpen(true);
          }}
          className="flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
        >
          <Plus size={16} className="mr-2" /> Add New Template
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {masters?.map(master => (
            <div key={master._id} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{master.name}</h3>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEditClick(master)}
                      className="p-1.5 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
                      title="Edit Template"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        window.open(`${api.defaults.baseURL}/quotation-masters/${master._id}/pdf`, '_blank');
                      }}
                      className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
                      title="Download Sample PDF"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteConfirmId(master._id);
                        setDeleteConfirmName(master.name);
                      }}
                      className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 dark:border-zinc-800 pt-3">
                  {master.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>• {item.description}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-200">₹{item.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Total Pre-tax</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">₹{calculateTotal(master.items).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-300 font-bold">Total with GST ({master.gstPercentage !== undefined ? master.gstPercentage : 18}%)</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">₹{(calculateTotal(master.items) * (1 + (master.gstPercentage !== undefined ? master.gstPercentage : 18) / 100)).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}

          {(!masters || masters.length === 0) && (
            <div className="col-span-full bg-white dark:bg-zinc-900 rounded-xl p-8 text-center border border-dashed border-gray-300 dark:border-zinc-800">
              <ClipboardList className="mx-auto mb-3 opacity-20 text-gray-500" size={40} />
              <h3 className="font-bold text-gray-900 dark:text-white">No Templates Yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Predefine templates to save time when generating quotations.</p>
            </div>
          )}
        </div>
      )}

      {/* CREATE/EDIT MODAL DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit Quotation Template' : 'Add New Template'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Template Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Wedding Package, Pre-Wedding Package"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Predefined Service Items</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <Plus size={14} className="mr-1" /> Add Row
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="e.g. Full Day Art, Cinematic Highlights"
                        value={item.description}
                        onChange={e => handleItemChange(idx, 'description', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                      <div className="w-32 relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={item.amount || ''}
                          onChange={e => handleItemChange(idx, 'amount', e.target.value)}
                          className="w-full pl-6 pr-3 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Default GST Percentage</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={gstPercentage}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setGstPercentage(val > 99 ? 99 : val < 0 ? 0 : val);
                    }}
                    className="w-20 px-3 py-2 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">%</span>
                </div>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-emerald-800 dark:text-emerald-300">Pre-tax Template Total</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">₹{calculateTotal(items).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-emerald-200/50 dark:border-emerald-800/50">
                  <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Total with GST ({gstPercentage}%)</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">₹{(calculateTotal(items) * (1 + gstPercentage / 100)).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow transition-colors"
              >
                <Save size={16} className="mr-2" /> Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) {
            deleteMutation.mutate(deleteConfirmId);
          }
        }}
        title="Delete Template?"
        message={
          <>
            Are you sure you want to delete template "{deleteConfirmName}"? <br />
            <strong>This action cannot be undone.</strong>
          </>
        }
        confirmText="Delete"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default QuotationMasterModule;
