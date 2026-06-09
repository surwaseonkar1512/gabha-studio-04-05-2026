import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, Download, Send, CheckCircle, Clock, X, FileText, ClipboardList, Eye, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  productName?: string;
  location?: string;
  fullAddress?: string;
  notesRequirements?: string;
}

interface QuotationItem {
  description: string;
  amount: number;
}

interface QuotationMaster {
  _id: string;
  name: string;
  items: QuotationItem[];
}

interface Quotation {
  _id: string;
  quotationNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerLocation?: string;
  customerAddress?: string;
  productName?: string;
  notes?: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected';
  items: QuotationItem[];
  gstEnabled: boolean;
  subTotal: number;
  gstAmount: number;
  total: number;
  createdAt: string;
}

const QuotationModule: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'create'>('list');
  const [customerMode, setCustomerMode] = useState<'existing' | 'manual'>('existing');

  // Search & Filter state for List
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [productName, setProductName] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Sent' | 'Approved' | 'Rejected'>('Draft');

  const [items, setItems] = useState<QuotationItem[]>([{ description: '', amount: 0 }]);
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [leadSearch, setLeadSearch] = useState('');

  // Fetch all leads
  const { data: leads } = useQuery<Lead[]>({
    queryKey: ['leads-list'],
    queryFn: async () => {
      const { data } = await api.get('/leads');
      return data;
    }
  });

  // Fetch all templates (masters)
  const { data: masters } = useQuery<QuotationMaster[]>({
    queryKey: ['quotation-masters-list'],
    queryFn: async () => {
      const { data } = await api.get('/quotation-masters');
      return data;
    }
  });

  // Fetch all quotations
  const { data: quotations, isLoading: isQuotationsLoading } = useQuery<Quotation[]>({
    queryKey: ['quotations-list', searchQuery, statusFilter],
    queryFn: async () => {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'All') params.status = statusFilter;
      const { data } = await api.get('/quotations', { params });
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      return api.post('/quotations', quoteData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations-list'] });
      toast.success('Quotation created successfully');
      setView('list');
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create quotation');
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.put(`/quotations/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations-list'] });
      toast.success('Quotation status updated');
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/quotations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations-list'] });
      toast.success('Quotation deleted successfully');
      setDeleteConfirmId(null);
    },
    onError: () => {
      toast.error('Failed to delete quotation');
      setDeleteConfirmId(null);
    }
  });

  const resetForm = () => {
    setSelectedLead(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setProductName('');
    setCustomerLocation('');
    setCustomerAddress('');
    setNotes('');
    setStatus('Draft');
    setItems([{ description: '', amount: 0 }]);
    setGstEnabled(false);
    setGstPercentage(18);
    setLeadSearch('');
  };

  const handleSelectLead = (lead: Lead) => {
    setSelectedLead(lead);
    setCustomerName(lead.name);
    setCustomerPhone(lead.phone);
    setCustomerEmail(lead.email || '');
    setProductName(lead.productName || '');
    setCustomerLocation(lead.location || '');
    setCustomerAddress(lead.fullAddress || '');
    setNotes(lead.notesRequirements || '');
  };

  const handleAddItemRow = () => {
    setItems(prev => [...prev, { description: '', amount: 0 }]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) {
      toast.error('At least one item row is required');
      return;
    }
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: string | number) => {
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

  const handleLoadTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const master = masters?.find(m => m._id === selectedId);
    if (master) {
      setItems(master.items.map(item => ({ description: item.description, amount: item.amount })));
      toast.success(`Loaded "${master.name}" template rows!`);
    }
    e.target.value = '';
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((acc, item) => acc + item.amount, 0);
    const gstAmount = gstEnabled ? subTotal * (gstPercentage / 100) : 0;
    const total = subTotal + gstAmount;
    return { subTotal, gstAmount, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Customer Name and Phone are required');
      return;
    }

    const filteredItems = items.filter(item => item.description.trim() !== '');
    if (filteredItems.length === 0) {
      toast.error('Please enter at least one item row');
      return;
    }

    const payload = {
      leadId: selectedLead?._id || null,
      customerName,
      customerPhone,
      customerEmail,
      customerLocation,
      customerAddress,
      productName,
      notes,
      status,
      items: filteredItems,
      gstEnabled,
      gstPercentage
    };

    createMutation.mutate(payload);
  };

  // Filtered leads for selector modal/dropdown
  const filteredLeads = leads?.filter(lead => {
    const lower = leadSearch.toLowerCase();
    return (
      lead.name.toLowerCase().includes(lower) ||
      lead.phone.toLowerCase().includes(lower) ||
      lead.productName?.toLowerCase().includes(lower) ||
      lead.location?.toLowerCase().includes(lower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Quotation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Generate proposals, manage pricing packages, and track quotation histories
          </p>
        </div>
        {view === 'list' && (
          <button
            onClick={() => {
              resetForm();
              setView('create');
              setCustomerMode('existing');
            }}
            className="flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            <Plus size={16} className="mr-2" /> New Quotation
          </button>
        )}
      </div>

      {view === 'list' ? (
        <>
          {/* HISTORY FILTERS */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-4 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center flex-shrink-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search by quote no, customer, phone, location..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-950 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800">
                <span className="text-xs font-bold text-gray-400 uppercase">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-gray-700 dark:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {(searchQuery !== '' || statusFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                  }}
                  className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* QUOTATION HISTORY TABLE */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 text-xs font-bold text-gray-400 uppercase">
                    <th className="px-6 py-4">Quote ID</th>
                    <th className="px-6 py-4">Customer Details</th>
                    <th className="px-6 py-4">Product / service</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Grand Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800/50 text-sm">
                  {isQuotationsLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : quotations?.map(quote => (
                    <tr key={quote._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                        {quote.quotationNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{quote.customerName}</div>
                        <div className="text-xs text-gray-500">{quote.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {quote.productName || <span className="text-gray-400 dark:text-zinc-600">—</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {quote.customerLocation || <span className="text-gray-400 dark:text-zinc-600">—</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{quote.total.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={quote.status}
                          onChange={e => updateStatusMutation.mutate({ id: quote._id, status: e.target.value })}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border-none outline-none cursor-pointer ${getStatusBadge(quote.status)}`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Sent">Sent</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => window.open(`${api.defaults.baseURL}/quotations/${quote._id}/pdf`, '_blank')}
                          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 font-bold transition-colors"
                        >
                          <Download size={14} /> PDF
                        </button>
                        <button
                          onClick={() => {
                            const text = `Hello ${quote.customerName},\n\nHere is your quotation (${quote.quotationNumber}) for ₹${quote.total.toLocaleString('en-IN')}.\n\nYou can download the PDF here: ${api.defaults.baseURL}/quotations/${quote._id}/pdf\n\nBest regards,\nGabha Studio`;
                            window.open(`https://api.whatsapp.com/send?phone=91${quote.customerPhone}&text=${encodeURIComponent(text)}`, '_blank');
                          }}
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                        >
                          <Send size={14} /> WA
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(quote._id)}
                          className="inline-flex items-center text-xs text-red-600 hover:text-red-700 font-bold transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {(!quotations || quotations.length === 0) && !isQuotationsLoading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <ClipboardList className="mx-auto mb-2 opacity-20 text-gray-400" size={36} />
                        <span className="text-sm font-semibold">No quotations generated yet</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* WIZARD & CREATION FORM */
        <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <button
                onClick={() => setView('list')}
                className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" /> Back to History
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                New Quotation Proposal
              </span>
            </div>

            {/* SELECTION POPUP OR STEP */}
            {customerName === '' && customerPhone === '' ? (
              <div className="space-y-6">
                <h3 className="text-md font-bold text-gray-900 dark:text-white">Choose Customer Setup Mode</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setCustomerMode('existing')}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${customerMode === 'existing' ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'}`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Existing Customer</h4>
                      <p className="text-xs text-gray-500 mt-1">Select from inquiries or CRM leads to auto-fill details</p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      setCustomerMode('manual');
                      setCustomerName('New Customer');
                      setCustomerPhone('+91 ');
                    }}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${customerMode === 'manual' ? 'border-emerald-500 bg-emerald-50/10' : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'}`}
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">Create Manual Entry</h4>
                      <p className="text-xs text-gray-500 mt-1">Manually key-in a new customer billing profile from scratch</p>
                    </div>
                  </div>
                </div>

                {customerMode === 'existing' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Search Inquiries & Leads</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search lead by customer name, product or city..."
                        value={leadSearch}
                        onChange={e => setLeadSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-zinc-800 rounded-lg divide-y divide-gray-100 dark:divide-zinc-850">
                      {filteredLeads?.map(lead => (
                        <div
                          key={lead._id}
                          onClick={() => handleSelectLead(lead)}
                          className="p-3 text-xs flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{lead.name}</div>
                            <div className="text-gray-500">{lead.phone} • {lead.email || 'No email'}</div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded-full font-semibold">{lead.productName}</span>
                            <div className="text-[10px] text-gray-400 mt-1">{lead.location}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* QUOTATION DETAILS ENTRY FORM */
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Customer Billing Details</label>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline"
                    >
                      Change Customer
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Customer Name"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Product / Service Name"
                        value={productName}
                        onChange={e => setProductName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Location / Area"
                        value={customerLocation}
                        onChange={e => setCustomerLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Full Billing Address"
                        value={customerAddress}
                        onChange={e => setCustomerAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="col-span-full">
                      <textarea
                        placeholder="Extra notes or specifications..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* TEMPLATE SELECTION (LOAD FROM MASTER) */}
                <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-850 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                    <RefreshCw size={14} className="animate-pulse" /> Load from Quotation Master (Templates)
                  </div>
                  <select
                    onChange={handleLoadTemplate}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    defaultValue=""
                  >
                    <option value="">-- Choose a pre-defined master package template --</option>
                    {masters?.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400">
                    Selecting a master auto-populates the item list below. You can still modify any of the amounts or descriptions.
                  </p>
                </div>

                {/* DYNAMIC ITEM ROWS */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Itemized Pricing Breakdown</label>
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
                          placeholder="Service description"
                          value={item.description}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                          required
                        />
                        <div className="w-32 relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={item.amount || ''}
                            onChange={e => handleItemChange(idx, 'amount', e.target.value)}
                            className="w-full pl-6 pr-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
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

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={gstEnabled}
                        onChange={e => setGstEnabled(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold cursor-pointer" onClick={() => setGstEnabled(!gstEnabled)}>Apply GST ({gstPercentage}%)</span>
                      {gstEnabled && (
                        <div className="flex items-center ml-1">
                          <input
                            type="number"
                            min="0"
                            max="99"
                            value={gstPercentage}
                            onChange={e => {
                              const val = Number(e.target.value);
                              setGstPercentage(val > 99 ? 99 : val < 0 ? 0 : val);
                            }}
                            className="w-12 px-1.5 py-0.5 text-xs border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded focus:ring-1 focus:ring-emerald-500 text-center text-gray-900 dark:text-white"
                          />
                          <span className="ml-1 text-xs text-gray-500">%</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="font-bold">Status:</span>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value as any)}
                        className="bg-transparent font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-colors"
                  >
                    Save & Generate Quotation
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* LETTERHEAD LIVE PREVIEW PANEL */}
          <div className="w-full lg:w-96 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider mb-4">
                <Eye size={14} /> Live Invoice Preview
              </div>

              {/* Letterhead Mock container */}
              <div className="border border-gray-100 dark:border-zinc-800 rounded-lg p-4 bg-gray-50/50 dark:bg-zinc-950/20 text-[10px] space-y-4">
                <div className="text-center pb-2 border-b border-gray-200 dark:border-zinc-800/80">
                  <h4 className="font-extrabold text-xs text-gray-900 dark:text-white tracking-widest uppercase">Gabha Studio</h4>
                  <p className="text-gray-400 text-[8px] mt-0.5">Art Gallery & Art Services</p>
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="font-bold text-gray-400 uppercase block text-[8px]">Client Billing Profile</span>
                    <div className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{customerName || '—'}</div>
                    <div className="text-gray-500 mt-0.5">{customerPhone || '—'}</div>
                    {customerEmail && <div className="text-gray-500">{customerEmail}</div>}
                    {customerLocation && <div className="text-gray-500 mt-1">Location: {customerLocation}</div>}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-400 uppercase block text-[8px]">Proposal Overview</span>
                    <div className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">GS-MOCK</div>
                    <div className="text-gray-500 mt-0.5">{new Date().toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Items table */}
                <div className="space-y-1.5 border-t border-b border-gray-200 dark:border-zinc-800/80 py-2.5">
                  <div className="flex justify-between font-bold text-gray-400 text-[8px] uppercase">
                    <span>Description</span>
                    <span>Amount</span>
                  </div>
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span className="truncate max-w-[180px]">{item.description || 'New service item'}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-200">₹{item.amount.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing totals */}
                <div className="space-y-1 text-right">
                  <div className="flex justify-end gap-2 text-gray-500">
                    <span>Subtotal:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">₹{calculateTotals().subTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {gstEnabled && (
                    <div className="flex justify-end gap-2 text-gray-500">
                      <span>GST ({gstPercentage}%):</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200">₹{calculateTotals().gstAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1.5 border-t border-gray-150 dark:border-zinc-800/50">
                    <span>Grand Total:</span>
                    <span>₹{calculateTotals().total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
              <strong>PDF Generation Note:</strong> Saving a proposal generates a professional signature-ready letterhead PDF suitable for instant sharing.
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
        title="Delete Quotation?"
        message={
          <>
            Are you sure you want to delete this quotation? <br />
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

export default QuotationModule;
