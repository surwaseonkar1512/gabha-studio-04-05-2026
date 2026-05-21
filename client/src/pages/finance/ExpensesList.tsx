import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Search, Filter, Plus, FileText, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  description?: string;
  date: string;
  method: string;
  vendorName?: string;
  proofUrls?: string[];
  createdBy: {
    _id: string;
    name: string;
  };
}

const EXPENSE_CATEGORIES = [
  'Electricity Bill', 'Raw Materials', 'Transport Charges', 
  'Salaries', 'Office Expenses', 'Vendor Payments', 
  'Equipment Purchases', 'Maintenance', 'Internet Bill', 
  'Marketing', 'Other'
];

const ExpensesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expenseData, setExpenseData] = useState({
    title: '', category: 'Office Expenses', amount: '', description: '', 
    date: new Date().toISOString().split('T')[0], method: 'UPI', vendorName: ''
  });
  const [proofs, setProofs] = useState<File[]>([]);
  const [imageViewerOpen, setImageViewerOpen] = useState<string | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: expenses, isLoading, error } = useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: async () => {
      const { data } = await api.get('/expenses');
      return data;
    }
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'proofs' && data[key]) formData.append(key, data[key]);
      });
      if (data.proofs) {
        data.proofs.forEach((file: File) => formData.append('proofs', file));
      }
      const res = await api.post('/expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsAddModalOpen(false);
      setExpenseData({ title: '', category: 'Office Expenses', amount: '', description: '', date: new Date().toISOString().split('T')[0], method: 'UPI', vendorName: '' });
      setProofs([]);
      toast.success('Expense added successfully');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add expense')
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/expenses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense deleted successfully');
      setDeleteConfirmId(null);
    },
    onError: () => toast.error('Failed to delete expense')
  });

  const filteredExpenses = expenses?.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (e.vendorName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? e.category === categoryFilter : true;
    const matchesMethod = methodFilter ? e.method === methodFilter : true;
    return matchesSearch && matchesCategory && matchesMethod;
  }) || [];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createExpenseMutation.mutate({ ...expenseData, proofs });
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  if (error) return <div className="text-red-500">Error loading expenses</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage all business expenses</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center font-medium shadow-sm transition-colors w-full sm:w-auto justify-center"
        >
          <Plus size={20} className="mr-2" /> Add Expense
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden flex-shrink-0">
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between border-b border-gray-200 dark:border-zinc-800">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Categories</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select 
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Title & Vendor</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Method</th>
                <th className="p-4 font-medium">Proofs</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {filteredExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4">
                    <p className="text-gray-900 dark:text-white text-sm">{new Date(expense.date).toLocaleDateString()}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{expense.title}</p>
                    {expense.vendorName && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{expense.vendorName}</p>}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900 dark:text-white">₹{expense.amount.toLocaleString('en-IN')}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{expense.method}</p>
                  </td>
                  <td className="p-4">
                    {expense.proofUrls && expense.proofUrls.length > 0 ? (
                      <div className="flex -space-x-2">
                        {expense.proofUrls.map((url, i) => (
                          <div 
                            key={i} 
                            onClick={() => setImageViewerOpen(url)}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 overflow-hidden cursor-pointer hover:scale-110 transition-transform"
                          >
                            <img src={url} alt="Proof" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setDeleteConfirmId(expense._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 font-medium text-sm transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <CreditCard size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No expenses found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-lg my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-950/50 rounded-t-xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Expense</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expense Title *</label>
                <input 
                  type="text" required
                  value={expenseData.title} onChange={e => setExpenseData({...expenseData, title: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                  <select 
                    required
                    value={expenseData.category} onChange={e => setExpenseData({...expenseData, category: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                  >
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹) *</label>
                  <input 
                    type="number" required
                    value={expenseData.amount} onChange={e => setExpenseData({...expenseData, amount: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <input 
                    type="date" required
                    value={expenseData.date} onChange={e => setExpenseData({...expenseData, date: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method *</label>
                  <select 
                    required
                    value={expenseData.method} onChange={e => setExpenseData({...expenseData, method: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor/Person Name</label>
                <input 
                  type="text"
                  value={expenseData.vendorName} onChange={e => setExpenseData({...expenseData, vendorName: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                  placeholder="e.g. Reliance Energy, Amazon"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea 
                  value={expenseData.description} onChange={e => setExpenseData({...expenseData, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm min-h-[80px]"
                />
              </div>

              {/* Upload Proof */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receipt/Proof (Optional)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-zinc-950 hover:bg-gray-100 dark:border-zinc-700 hover:border-zinc-600 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="mb-1 text-xs text-gray-500"><span className="font-semibold">Click to upload</span></p>
                      <p className="text-[10px] text-gray-500">PNG, JPG or WEBP (Max 5MB)</p>
                    </div>
                    <input 
                      type="file" className="hidden" multiple accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) setProofs([...proofs, ...Array.from(e.target.files)]);
                      }}
                    />
                  </label>
                </div>
                {proofs.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {proofs.map((file, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-zinc-700 group">
                        <img src={URL.createObjectURL(file)} alt="proof" className="w-full h-full object-cover" />
                        <button 
                          type="button" onClick={() => setProofs(proofs.filter((_, i) => i !== idx))}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-md p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
                <button 
                  type="button" onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={createExpenseMutation.isPending}
                  className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {createExpenseMutation.isPending ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId) deleteExpenseMutation.mutate(deleteConfirmId);
        }}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        type="danger"
        isLoading={deleteExpenseMutation.isPending}
      />

      {/* Full Screen Image Viewer */}
      {imageViewerOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setImageViewerOpen(null)}
        >
          <button 
            onClick={() => setImageViewerOpen(null)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 p-2"
          >
            <X size={32} />
          </button>
          <img 
            src={imageViewerOpen} 
            alt="Proof" 
            className="max-w-full max-h-[90vh] object-contain rounded animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default ExpensesList;
