import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Filter, Phone, Mail, MoreVertical, LayoutGrid, List as ListIcon, GripVertical, FileText, Download, Send, Trash2, Calculator, X, Navigation, Edit2, Calendar, Check } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  stage: string;
  createdAt: string;
  productName: string;
  location?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  locationType?: string;
  notesRequirements?: string;
  hasQuotation?: boolean;
  quotationSkipped?: boolean;
  message?: string;
  activityLogs?: any[];
  reminders?: any[];
}

interface QuotationItem {
  description: string;
  amount: string | number;
}

const STAGES = ['New Lead', 'Contacted', 'Quote Sent', 'Booking', 'Completed'];

const LeadsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchName, setSearchName] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeadData, setNewLeadData] = useState({
    name: '',
    phone: '',
    email: '',
    productName: '',
    location: '',
    fullAddress: '',
    notesRequirements: '',
    latitude: '' as string | number,
    longitude: '' as string | number,
    locationType: 'Manual',
    priority: 'Medium'
  });
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);

  const handleGPSCapture = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Reverse geocoding via OpenStreetMap Nominatim
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`, {
          headers: { 'Accept-Language': 'en' }
        })
          .then(res => res.json())
          .then(data => {
            let detectedLoc = '';
            if (data && data.address) {
              const addr = data.address;
              const parts = [
                addr.suburb || addr.neighbourhood || addr.village || addr.quarter || addr.subdivision,
                addr.city || addr.town || addr.municipality || addr.county,
                addr.state || addr.region
              ].filter(Boolean);
              if (parts.length > 0) {
                detectedLoc = parts.join(', ');
              } else if (data.display_name) {
                detectedLoc = data.display_name.split(',').slice(0, 3).join(',').trim();
              }
            }

            setNewLeadData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lon,
              locationType: 'GPS',
              location: detectedLoc || `GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
              fullAddress: prev.fullAddress || data.display_name || ''
            }));
            setGpsLoading(false);
            setGpsSuccess(true);
            toast.success('Live location captured successfully!');
          })
          .catch(err => {
            console.error('Reverse geocoding error:', err);
            setNewLeadData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lon,
              locationType: 'GPS',
              location: prev.location || `GPS Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
            }));
            setGpsLoading(false);
            setGpsSuccess(true);
            toast.success('Live location captured successfully!');
          });
      },
      (error) => {
        console.error(error);
        toast.error('Could not retrieve your location. Please enter it manually.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Manage Lead Modal State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'quotations' | 'activity' | 'reminders'>('details');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLeadData, setEditLeadData] = useState<any>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteItems, setQuoteItems] = useState<QuotationItem[]>([{ description: '', amount: '' }]);
  const [quotationNotes, setQuotationNotes] = useState('');
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstPercentage, setGstPercentage] = useState(18);
  const [discount, setDiscount] = useState<string | number>('');
  const [shipping, setShipping] = useState<string | number>('');
  const [paymentTerms, setPaymentTerms] = useState('');

  // Reminders State
  const [newReminder, setNewReminder] = useState({ title: '', description: '', dueDate: '', priority: 'Medium' });

  // Advance Payment Modal State
  const [advanceModalState, setAdvanceModalState] = useState<{ isOpen: boolean; leadId: string; quotationId?: string; totalAmount: number | string } | null>(null);
  const [advancePaymentData, setAdvancePaymentData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'UPI',
    reference: '',
    notes: '',
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [paymentProofs, setPaymentProofs] = useState<File[]>([]);

  // Quote Intercept Modal State
  const [quoteInterceptState, setQuoteInterceptState] = useState<{ isOpen: boolean; leadId: string } | null>(null);

  // Delete Confirm Modal State
  const [deleteConfirmState, setDeleteConfirmState] = useState<string | null>(null);
  const [deleteQuotationConfirmState, setDeleteQuotationConfirmState] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/leads/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
      setSelectedLead(null);
      setDeleteConfirmState(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
      setDeleteConfirmState(null);
    }
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('leadId', data.leadId);
      if (data.quotationId) formData.append('quotationId', data.quotationId);
      formData.append('totalAmount', data.totalAmount.toString());
      formData.append('payment', JSON.stringify(data.payment));
      if (data.deliveryDate) formData.append('deliveryDate', data.deliveryDate);
      if (data.notes) formData.append('notes', data.notes);

      if (data.proofs) {
        data.proofs.forEach((file: File) => formData.append('proofs', file));
      }

      const res = await api.post('/bookings/advance', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setAdvanceModalState(null);
      setAdvancePaymentData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'UPI',
        reference: '',
        notes: '',
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setPaymentProofs([]);
      toast.success('Booking created & Advance payment recorded');
    },
    onError: () => toast.error('Failed to create booking')
  });

  const { data: leads, isLoading, error } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data } = await api.get('/leads');
      return data;
    }
  });

  useEffect(() => {
    const leadId = searchParams.get('leadId');
    if (leadId && leads && !selectedLead) {
      const lead = leads.find(l => l._id === leadId);
      if (lead) {
        setSelectedLead(lead);
        searchParams.delete('leadId');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, leads, selectedLead, setSearchParams]);

  const { data: quotations, refetch: refetchQuotations } = useQuery({
    queryKey: ['quotations', selectedLead?._id],
    queryFn: async () => {
      const { data } = await api.get(`/quotations/lead/${selectedLead?._id}`);
      return data;
    },
    enabled: !!selectedLead && activeTab === 'quotations'
  });

  const { data: masters } = useQuery<any[]>({
    queryKey: ['quotation-masters-list'],
    queryFn: async () => {
      const { data } = await api.get('/quotation-masters');
      return data;
    }
  });

  const { data: reminders, refetch: refetchReminders } = useQuery({
    queryKey: ['reminders', selectedLead?._id],
    queryFn: async () => {
      const { data } = await api.get(`/reminders/lead/${selectedLead?._id}`);
      return data;
    },
    enabled: !!selectedLead && activeTab === 'reminders'
  });

  const updateLeadStageMutation = useMutation({
    mutationFn: async ({ id, stage, quotationSkipped }: { id: string, stage: string, quotationSkipped?: boolean }) => {
      const payload: any = { stage };
      if (quotationSkipped !== undefined) payload.quotationSkipped = quotationSkipped;
      const { data } = await api.put(`/leads/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err: any, variables, context: any) => {
      toast.error(err.response?.data?.message || 'Failed to update lead stage');
      if (context?.previousLeads) {
        queryClient.setQueryData(['leads'], context.previousLeads);
      }
    }
  });

  const createLeadMutation = useMutation({
    mutationFn: async (leadData: typeof newLeadData) => {
      const { data } = await api.post('/leads', { ...leadData, source: 'Manual Entry' });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsAddModalOpen(false);
      setNewLeadData({
        name: '',
        phone: '',
        email: '',
        productName: '',
        location: '',
        fullAddress: '',
        notesRequirements: '',
        latitude: '',
        longitude: '',
        locationType: 'Manual'
      });
      setGpsSuccess(false);
      toast.success('Lead added successfully');
    },
    onError: () => toast.error('Failed to add lead')
  });

  const editLeadMutation = useMutation({
    mutationFn: async (leadData: any) => {
      const { _id, ...rest } = leadData;
      const { data } = await api.put(`/leads/${_id}`, rest);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      setIsEditModalOpen(false);
      setEditLeadData(null);
      setSelectedLead(data);
      toast.success('Lead updated successfully');
    },
    onError: () => toast.error('Failed to update lead')
  });

  const createQuotationMutation = useMutation({
    mutationFn: async (quoteData: any) => {
      const { data } = await api.post('/quotations', quoteData);
      return data;
    },
    onSuccess: () => {
      toast.success('Quotation generated successfully');
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      refetchQuotations();
      setDiscount('');
      setShipping('');
      setPaymentTerms('');
      setIsQuoting(false);
      setQuoteItems([{ description: '', amount: '' }]);
      setGstEnabled(false);
    },
    onError: () => toast.error('Failed to create quotation')
  });

  const createReminderMutation = useMutation({
    mutationFn: async (reminderData: any) => {
      const { data } = await api.post('/reminders', reminderData);
      return data;
    },
    onSuccess: () => {
      toast.success('Reminder added successfully');
      setNewReminder({ title: '', description: '', dueDate: '', priority: 'Medium' });
      refetchReminders();
    },
    onError: () => toast.error('Failed to add reminder')
  });

  const updateReminderMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data } = await api.put(`/reminders/${id}`, { status });
      return data;
    },
    onSuccess: () => refetchReminders()
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/reminders/${id}`);
      return data;
    },
    onSuccess: () => refetchReminders()
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New Lead': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Contacted': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Quote Sent': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Booking': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStageBorder = (stage: string) => {
    switch (stage) {
      case 'New Lead': return 'border-t-blue-500';
      case 'Contacted': return 'border-t-amber-500';
      case 'Quote Sent': return 'border-t-purple-500';
      case 'Booking': return 'border-t-emerald-500';
      case 'Completed': return 'border-t-gray-500';
      default: return 'border-t-gray-500';
    }
  };

  const filteredLeads = leads?.filter(lead => {
    if (searchName) {
      const matchName = lead.name.toLowerCase().includes(searchName.toLowerCase());
      const matchPhone = lead.phone.includes(searchName);
      if (!matchName && !matchPhone) return false;
    }
    if (searchProduct) {
      if (!lead.productName || !lead.productName.toLowerCase().includes(searchProduct.toLowerCase())) return false;
    }
    if (searchLocation) {
      if (!lead.location || !lead.location.toLowerCase().includes(searchLocation.toLowerCase())) return false;
    }
    if (startDate) {
      const leadTime = new Date(lead.createdAt).getTime();
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (leadTime < start.getTime()) return false;
    }
    if (endDate) {
      const leadTime = new Date(lead.createdAt).getTime();
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (leadTime > end.getTime()) return false;
    }
    return true;
  }) || [];

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId;
    const oldStage = source.droppableId;
    const leadId = draggableId;

    // Strict forward-only transition check
    const currentIndex = STAGES.indexOf(oldStage);
    const newIndex = STAGES.indexOf(newStage);

    if (newIndex !== currentIndex + 1) {
      toast.error(`Invalid move. You can only move from ${oldStage} to ${STAGES[currentIndex + 1] || 'nowhere'}.`);
      return;
    }

    if (newStage === 'Quote Sent') {
      // Intercept Contacted -> Quote Sent
      setQuoteInterceptState({ isOpen: true, leadId });
      return;
    }

    if (newStage === 'Booking') {
      // Intercept! Open Advance Payment Modal
      try {
        const { data: quotes } = await api.get(`/quotations/lead/${leadId}`);
        let totalAmount = '';
        let quotationId;
        if (quotes && quotes.length > 0) {
          totalAmount = quotes[0].total; // Using the latest quote
          quotationId = quotes[0]._id;
        }
        setAdvanceModalState({ isOpen: true, leadId, quotationId, totalAmount });
      } catch (err) {
        setAdvanceModalState({ isOpen: true, leadId, totalAmount: '' });
      }
      return; // Stop standard drag logic
    }

    const previousLeads = queryClient.getQueryData<Lead[]>(['leads']);
    if (previousLeads) {
      const updatedLeads = previousLeads.map(l =>
        l._id === leadId ? { ...l, stage: newStage } : l
      );
      queryClient.setQueryData(['leads'], updatedLeads);
    }

    updateLeadStageMutation.mutate({ id: leadId, stage: newStage });
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    // Validate items
    const validItems = quoteItems.filter(item => item.description.trim() !== '' && item.amount !== '');
    if (validItems.length === 0) {
      toast.error('Please add at least one valid item');
      return;
    }

    createQuotationMutation.mutate({
      leadId: selectedLead._id,
      items: validItems.map(item => ({ ...item, amount: Number(item.amount) })),
      gstEnabled,
      gstPercentage,
      notes: quotationNotes,
      discount: Number(discount) || 0,
      shipping: Number(shipping) || 0,
      terms: paymentTerms
    });
  };

  const addQuoteItem = () => setQuoteItems([...quoteItems, { description: '', amount: '' }]);
  const removeQuoteItem = (index: number) => setQuoteItems(quoteItems.filter((_, i) => i !== index));
  const updateQuoteItem = (index: number, field: keyof QuotationItem, value: string) => {
    const newItems = [...quoteItems];
    newItems[index][field] = value;
    setQuoteItems(newItems);
  };

  const subTotal = quoteItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
  const discountVal = Number(discount) || 0;
  const shippingVal = Number(shipping) || 0;
  const taxableAmount = Math.max(0, subTotal - discountVal);
  const gstAmount = gstEnabled ? taxableAmount * (gstPercentage / 100) : 0;
  const grandTotal = taxableAmount + gstAmount + shippingVal;

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="text-red-500">Error loading leads</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CRM Leads</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your inquiries, pipeline and quotations</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-100 dark:bg-zinc-800 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
              <ListIcon size={18} />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'board' ? 'bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm font-medium"
          >
            <Plus size={18} className="mr-2" /> Add Lead
          </button>
        </div>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden flex-shrink-0">
        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-4 p-4">
          <div className="relative">
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Customer Name / Phone</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={14} />
              <input
                type="text"
                placeholder="Search name or phone..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Product / Service</label>
            <input
              type="text"
              placeholder="Search product..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Location / Area</label>
            <input
              type="text"
              placeholder="Search location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Created From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Created To</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all"
              />
              {(searchName || searchProduct || searchLocation || startDate || endDate) && (
                <button
                  onClick={() => {
                    setSearchName('');
                    setSearchProduct('');
                    setSearchLocation('');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline shrink-0"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View - Hidden on Desktop */}
        <div className="flex lg:hidden items-center justify-between p-4">
          <div className="relative flex-1 mr-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
            <input
              type="text"
              placeholder="Quick search by name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <button
            onClick={() => setIsFilterPopupOpen(true)}
            className="relative flex items-center px-4 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-xs font-bold"
          >
            <Filter size={14} className="mr-1.5" />
            Filters
            {(() => {
              const activeCount = [searchProduct, searchLocation, startDate, endDate].filter(Boolean).length;
              return activeCount > 0 ? (
                <span className="ml-1.5 w-5 h-5 flex items-center justify-center bg-amber-500 text-white rounded-full text-[9px] font-bold">
                  {activeCount}
                </span>
              ) : null;
            })()}
          </button>
        </div>
      </div>

      {/* MOBILE FILTER POPUP DIALOG */}
      {isFilterPopupOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Filter CRM Leads</h2>
              <button
                onClick={() => setIsFilterPopupOpen(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Customer Name or Phone</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={14} />
                  <input
                    type="text"
                    placeholder="Search name or phone..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Product Name</label>
                <input
                  type="text"
                  placeholder="Filter by product..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Location / City</label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex gap-3">
              <button
                onClick={() => {
                  setSearchName('');
                  setSearchProduct('');
                  setSearchLocation('');
                  setStartDate('');
                  setEndDate('');
                }}
                className="flex-1 py-2.5 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFilterPopupOpen(false)}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold shadow transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOARD VIEW */}
      {viewMode === 'board' && (
        <div className="flex-1 overflow-x-auto pb-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 min-w-max h-full items-start">
              {STAGES.map(stage => {
                const stageLeads = filteredLeads.filter(l => l.stage === stage);

                return (
                  <div key={stage} className="w-80 flex flex-col bg-gray-50 dark:bg-zinc-950/50 rounded-xl border border-gray-200 dark:border-zinc-800/50 max-h-full">
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-800/50 flex justify-between items-center bg-white/50 dark:bg-zinc-900/50 rounded-t-xl">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200">{stage}</h3>
                      <span className="bg-white dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-full border border-gray-200 dark:border-zinc-700 shadow-sm">
                        {stageLeads.length}
                      </span>
                    </div>

                    <Droppable droppableId={stage}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}
                        >
                          {stageLeads.map((lead, index) => (
                            <Draggable key={lead._id} draggableId={lead._id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedLead(lead)}
                                  className={`mb-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-4 border-t-4 cursor-pointer transition-all ${getStageBorder(lead.stage)} ${snapshot.isDragging ? 'shadow-xl ring-2 ring-amber-500 opacity-90 scale-105' : 'hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-md'}`}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{lead.name}</h4>
                                      {lead.priority && (
                                        <span className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                                          lead.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-450' :
                                          lead.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-455' :
                                          'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-450'
                                        }`}>
                                          {lead.priority}
                                        </span>
                                      )}
                                    </div>
                                    <GripVertical className="text-gray-300 dark:text-zinc-600 h-4 w-4 flex-shrink-0" />
                                  </div>
                                  <div className="space-y-1.5 mb-3">
                                    {lead.productName && (
                                      <div className="inline-block px-2 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 text-[11px] font-bold rounded-md">
                                        {lead.productName}
                                      </div>
                                    )}
                                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                      <Phone size={12} className="mr-1.5" /> {lead.phone}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-gray-50 dark:border-zinc-800/50">
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-400 dark:text-zinc-500 font-medium">
                                        {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {lead.hasQuotation && (
                                        <span className="flex items-center px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold tracking-wide uppercase">
                                          <FileText size={10} className="mr-1" /> Quoted
                                        </span>
                                      )}
                                      {lead.quotationSkipped && (
                                        <span className="flex items-center px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded text-[10px] font-bold tracking-wide uppercase">
                                          Skipped Quote
                                        </span>
                                      )}
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
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            {filteredLeads && filteredLeads.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-zinc-950">
                  <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-zinc-800">
                    <th className="px-6 py-4 font-medium">Lead Name</th>
                    <th className="px-6 py-4 font-medium">Contact</th>
                    <th className="px-6 py-4 font-medium">Stage</th>
                    <th className="px-6 py-4 font-medium">Quotation</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                  {filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                          {lead.priority && (
                            <span className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                              lead.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-450' :
                              lead.priority === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-455' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-450'
                            }`}>
                              {lead.priority}
                            </span>
                          )}
                        </div>
                        {lead.productName && (
                          <div className="text-xs text-amber-600 dark:text-amber-500 font-semibold">{lead.productName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <Phone size={14} className="mr-2 text-gray-400 dark:text-gray-500" /> {lead.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStageColor(lead.stage)}`}>
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.hasQuotation ? (
                          <span className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                            <FileText size={14} className="mr-1" /> Quoted
                          </span>
                        ) : lead.quotationSkipped ? (
                          <span className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                            Skipped
                          </span>
                        ) : (
                          <span className="text-gray-400 dark:text-zinc-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                  <LayoutGrid size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No leads found</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Get started by creating a new lead.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MANAGE LEAD MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLead.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStageColor(selectedLead.stage)}`}>
                    {selectedLead.stage}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Phone size={12} className="mr-1" /> {selectedLead.phone}
                  </span>
                  {selectedLead.quotationSkipped && (
                    <span className="px-2.5 py-1 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      No Quotation Created
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditLeadData(selectedLead);
                    setIsEditModalOpen(true);
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                  title="Edit Lead"
                >
                  <Edit2 size={20} />
                </button>
                {(selectedLead.stage === 'New Lead' || selectedLead.stage === 'Contacted') && (
                  <button
                    onClick={() => setDeleteConfirmState(selectedLead._id)}
                    disabled={deleteLeadMutation.isPending}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-full transition-colors disabled:opacity-50"
                    title="Delete Lead"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedLead(null);
                    setIsQuoting(false);
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="px-6 border-b border-gray-100 dark:border-zinc-800 flex gap-6 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => { setActiveTab('details'); setIsQuoting(false); }}
                className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'details' ? 'border-amber-500 text-amber-600 dark:text-amber-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                Lead Details
              </button>
              <button
                onClick={() => { setActiveTab('activity'); setIsQuoting(false); }}
                className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'activity' ? 'border-amber-500 text-amber-600 dark:text-amber-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                Activity Log
              </button>
              <button
                onClick={() => { setActiveTab('reminders'); setIsQuoting(false); }}
                className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reminders' ? 'border-amber-500 text-amber-600 dark:text-amber-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                Reminders
              </button>
              <button
                onClick={() => setActiveTab('quotations')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center whitespace-nowrap ${activeTab === 'quotations' ? 'border-amber-500 text-amber-600 dark:text-amber-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                <FileText size={16} className="mr-2" /> Quotations
                {selectedLead.hasQuotation && <span className="ml-2 w-2 h-2 rounded-full bg-blue-500"></span>}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">

               {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Contact & Status Information */}
                  <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Contact & Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLead.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email Address</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLead.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lead Source</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLead.source}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date Added</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(selectedLead.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lead Priority</p>
                        <select
                          value={selectedLead.priority || 'Medium'}
                          onChange={(e) => {
                            editLeadMutation.mutate({ ...selectedLead, priority: e.target.value });
                          }}
                          disabled={editLeadMutation.isPending}
                          className="px-2 py-1 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-xs rounded font-bold focus:ring-1 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sync Status / Pipeline Stage</p>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getStageColor(selectedLead.stage)}`}>
                          {selectedLead.stage}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Product & Artwork Interest */}
                  <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Product / Artwork Interest</h3>
                    
                    {selectedLead.productDetails && (selectedLead.productDetails.title || selectedLead.productDetails.sku) ? (
                      <div className="flex gap-4 items-start bg-white dark:bg-zinc-950 p-4 rounded-lg border border-gray-200/60 dark:border-zinc-850">
                        {selectedLead.productDetails.image && (
                          <img 
                            src={selectedLead.productDetails.image} 
                            alt={selectedLead.productDetails.title} 
                            className="w-20 h-20 object-cover rounded-lg border border-gray-150 dark:border-zinc-800"
                          />
                        )}
                        <div className="space-y-1">
                          <h4 className="font-bold text-gray-950 dark:text-white text-sm">
                            {selectedLead.productDetails.title || selectedLead.productName}
                          </h4>
                          {selectedLead.productDetails.sku && (
                            <p className="text-xs text-gray-500">
                              <span className="font-semibold">SKU:</span> {selectedLead.productDetails.sku}
                            </p>
                          )}
                          {selectedLead.productDetails.price !== undefined && (
                            <p className="text-sm font-bold text-amber-600 dark:text-amber-500">
                              ₹{Number(selectedLead.productDetails.price).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Product/Service Interest</p>
                        <span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 font-bold rounded-lg text-xs uppercase tracking-wide">
                          {selectedLead.productName || 'General Inquiry'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lead Specific Requirements */}
                  <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Specific Requirements</h3>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quantity Requested</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {selectedLead.requirementDetails?.quantity || 1} units
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Color Preference</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {selectedLead.requirementDetails?.colorPreference || 'Any / Default'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target Delivery Date</p>
                        <p className="text-sm font-bold text-gray-950 dark:text-white">
                          {selectedLead.requirementDetails?.preferredDeliveryDate 
                            ? new Date(selectedLead.requirementDetails.preferredDeliveryDate).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric'
                              })
                            : 'Not Specified'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4 pt-3 border-t border-gray-200/50 dark:border-zinc-850">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location/City</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedLead.location || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Location Type</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedLead.locationType ? (
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedLead.locationType === 'GPS' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-400'}`}>
                                {selectedLead.locationType}
                              </span>
                            ) : 'Manual'}
                          </p>
                        </div>
                      </div>
                      {selectedLead.latitude && selectedLead.longitude && (
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">GPS Coordinates</p>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${selectedLead.latitude},${selectedLead.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline gap-1.5"
                          >
                            <Navigation size={12} className="text-blue-500" />
                            {Number(selectedLead.latitude).toFixed(6)}, {Number(selectedLead.longitude).toFixed(6)} (Open in Google Maps)
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Full Address</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed bg-white dark:bg-zinc-950 p-3 rounded-lg border border-gray-100 dark:border-zinc-900 min-h-[60px] whitespace-pre-line">
                          {selectedLead.fullAddress || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements / Notes card */}
                  <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Customer Inquiry Notes</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-zinc-950 p-3 rounded-lg border border-gray-100 dark:border-zinc-900 min-h-[80px] whitespace-pre-line">
                      {selectedLead.notesRequirements || selectedLead.notesRequirements === '' ? selectedLead.notesRequirements : (selectedLead?.message || 'No requirements specified.')}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Activity History</h3>
                    {selectedLead.activityLogs && selectedLead.activityLogs.length > 0 ? (
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {selectedLead.activityLogs.map((log: any, i: number) => (
                          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-amber-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                              <span className="text-xs font-bold">{i + 1}</span>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
                              <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className="font-bold text-gray-900 dark:text-white">{log.action}</div>
                                <time className="font-medium text-xs text-amber-600 dark:text-amber-500">{new Date(log.timestamp).toLocaleString()}</time>
                              </div>
                              {log.updatedBy && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Updated by {log.updatedBy}</div>
                              )}
                              {log.changes && log.changes.length > 0 && (
                                <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc pl-5 mt-2 space-y-1">
                                  {log.changes.map((change: any, j: number) => (
                                    <li key={j}>Changed <span className="font-bold">{change.field}</span> from "{change.oldValue || 'none'}" to "{change.newValue}"</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No activity logs found for this lead.</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'reminders' && (
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Add New Reminder</h3>
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newReminder.title || !newReminder.dueDate) {
                          toast.error('Title and Due Date are required');
                          return;
                        }
                        createReminderMutation.mutate({ ...newReminder, leadId: selectedLead._id });
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Title *</label>
                        <input
                          type="text"
                          required
                          value={newReminder.title}
                          onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm text-gray-900 dark:text-white"
                          placeholder="e.g. Call for followup"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Due Date & Time *</label>
                        <input
                          type="datetime-local"
                          required
                          value={newReminder.dueDate}
                          onChange={e => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Description</label>
                        <textarea
                          value={newReminder.description}
                          onChange={e => setNewReminder({ ...newReminder, description: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-800 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm text-gray-900 dark:text-white"
                          placeholder="Add any additional details here..."
                          rows={2}
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={createReminderMutation.isPending}
                          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-bold shadow-sm disabled:opacity-50"
                        >
                          {createReminderMutation.isPending ? 'Adding...' : 'Add Reminder'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-800">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Upcoming & Past Reminders</h3>
                    {reminders && reminders.length > 0 ? (
                      <div className="space-y-3">
                        {reminders.map((reminder: any) => (
                          <div key={reminder._id} className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-colors ${reminder.status === 'Completed' ? 'bg-gray-100 dark:bg-zinc-900/30 border-transparent opacity-60' : 'bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 shadow-sm'}`}>
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-sm font-bold ${reminder.status === 'Completed' ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>{reminder.title}</h4>
                              {reminder.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{reminder.description}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs font-medium">
                                <span className={`flex items-center ${reminder.status === 'Completed' ? 'text-gray-400' : new Date(reminder.dueDate).getTime() < Date.now() ? 'text-red-500' : 'text-amber-600 dark:text-amber-500'}`}>
                                  <Calendar size={12} className="mr-1" />
                                  {new Date(reminder.dueDate).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {reminder.status === 'Pending' && (
                                <button
                                  onClick={() => updateReminderMutation.mutate({ id: reminder._id, status: 'Completed' })}
                                  className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40 rounded-lg transition-colors"
                                  title="Mark as Completed"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteReminderMutation.mutate(reminder._id)}
                                className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                                title="Delete Reminder"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar size={32} className="mx-auto text-gray-300 dark:text-zinc-700 mb-3" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No reminders set for this lead.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'quotations' && (
                <div>
                  {!isQuoting ? (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quotation History</h3>
                        <button
                          onClick={() => setIsQuoting(true)}
                          disabled={selectedLead.stage === 'New Lead' || selectedLead.stage === 'Completed'}
                          className="flex items-center px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-gray-100 transition-colors text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          <Plus size={16} className="mr-2" /> Create Quotation
                        </button>
                      </div>

                      {(selectedLead.stage === 'New Lead' || selectedLead.stage === 'Completed') && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg text-sm mb-6 flex items-start border border-blue-100 dark:border-blue-900/30">
                          <Calculator size={18} className="mr-3 mt-0.5 shrink-0" />
                          <p>Quotation creation is disabled for leads in the <strong>{selectedLead.stage}</strong> stage. Please move the lead to "Contacted" or another active stage to generate a quote.</p>
                        </div>
                      )}

                      {quotations?.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
                          <FileText size={48} className="mx-auto text-gray-300 dark:text-zinc-700 mb-4" />
                          <p className="text-gray-500 dark:text-gray-400 font-medium">No quotations generated yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {quotations?.map((quote: any) => (
                            <div key={quote._id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center">
                                    {quote.quotationNumber}
                                    {quote.gstEnabled && <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 text-[10px] rounded uppercase tracking-wider font-bold border border-gray-200 dark:border-zinc-700">GST Applied</span>}
                                  </h4>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(quote.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                                  <p className="text-lg font-bold text-amber-600 dark:text-amber-500">₹{quote.total.toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                              <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800 flex-wrap">
                                <button
                                  onClick={() => window.open(`${api.defaults.baseURL}/quotations/${quote._id}/pdf`, '_blank')}
                                  className="flex-1 min-w-[120px] flex items-center justify-center px-3 py-1.5 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-xs font-medium"
                                  title="View PDF"
                                >
                                  <FileText size={14} className="mr-1.5" /> View
                                </button>
                                <button
                                  onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = `${api.defaults.baseURL}/quotations/${quote._id}/pdf`;
                                    link.download = `Quotation_${quote.quotationNumber}.pdf`;
                                    link.target = '_blank';
                                    link.click();
                                  }}
                                  className="flex-1 min-w-[120px] flex items-center justify-center px-3 py-1.5 border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-xs font-medium"
                                  title="Download PDF"
                                >
                                  <Download size={14} className="mr-1.5" /> Download
                                </button>
                                <button
                                  onClick={() => {
                                    const text = `Hello ${selectedLead.name},\n\nHere is your quotation (${quote.quotationNumber}) for ₹${quote.total.toLocaleString('en-IN')}.\n\nYou can view/download the PDF here: ${api.defaults.baseURL}/quotations/${quote._id}/pdf\n\nBest regards,\nGabha Studio`;
                                    window.open(`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
                                  }}
                                  className="flex-1 min-w-[120px] flex items-center justify-center px-3 py-1.5 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebe5d] transition-colors text-xs font-medium shadow-sm shadow-[#25D366]/20"
                                >
                                  <Send size={14} className="mr-1.5" /> WhatsApp
                                </button>
                                <button
                                  onClick={() => setDeleteQuotationConfirmState(quote._id)}
                                  className="flex-1 min-w-[120px] flex items-center justify-center px-3 py-1.5 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs font-medium"
                                  title="Delete Quotation"
                                >
                                  <Trash2 size={14} className="mr-1.5" /> Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleQuoteSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Build Quotation</h3>
                        <button
                          type="button"
                          onClick={() => { setIsQuoting(false); setQuoteItems([{ description: '', amount: '' }]); }}
                          className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl mb-6 space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-xs">
                          Load from Quotation Master (Templates)
                        </div>
                        <select
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            if (selectedId) {
                              const master = masters?.find(m => m._id === selectedId);
                              if (master) {
                                setQuoteItems(master.items.map((item: any) => ({ description: item.description, amount: String(item.amount) })));
                                setGstPercentage(master.gstPercentage !== undefined ? master.gstPercentage : 18);
                                toast.success(`Loaded "${master.name}" template rows!`);
                              }
                            }
                            e.target.value = '';
                          }}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 text-gray-900 dark:text-white rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                          defaultValue=""
                        >
                          <option value="">-- Choose a pre-defined master package template --</option>
                          {masters?.map(m => (
                            <option key={m._id} value={m._id}>{m.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-5 border border-gray-200 dark:border-zinc-800 mb-6">
                        <div className="flex justify-between items-end mb-4 border-b border-gray-200 dark:border-zinc-800 pb-4">
                          <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wider">Line Items</h4>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={gstEnabled}
                              onChange={e => setGstEnabled(e.target.checked)}
                              className="rounded text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer" onClick={() => setGstEnabled(!gstEnabled)}>Apply GST</span>
                            {gstEnabled && (
                              <div className="flex items-center ml-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  value={gstPercentage}
                                  onChange={e => {
                                    const val = Number(e.target.value);
                                    setGstPercentage(val > 99 ? 99 : val < 0 ? 0 : val);
                                  }}
                                  className="w-14 px-2 py-1 text-sm border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded focus:ring-1 focus:ring-amber-500 text-center text-gray-900 dark:text-white"
                                />
                                <span className="ml-1 text-sm text-gray-500">%</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {quoteItems.map((item, index) => (
                            <div key={index} className="flex gap-3 items-start group">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  placeholder="Description (e.g. Pre-wedding Shoot, Album)"
                                  value={item.description}
                                  onChange={(e) => updateQuoteItem(index, 'description', e.target.value)}
                                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white text-sm"
                                  required
                                />
                              </div>
                              <div className="w-32">
                                <input
                                  type="number"
                                  placeholder="Amount"
                                  value={item.amount}
                                  onChange={(e) => updateQuoteItem(index, 'amount', e.target.value)}
                                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white text-sm"
                                  required
                                />
                              </div>
                              {quoteItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeQuoteItem(index)}
                                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-0.5"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={addQuoteItem}
                          className="mt-4 flex items-center text-sm font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 transition-colors"
                        >
                          <Plus size={16} className="mr-1" /> Add Row
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Discount (₹)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={discount}
                            onChange={e => setDiscount(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Shipping / Delivery (₹)</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={shipping}
                            onChange={e => setShipping(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                      </div>

                      <div className="bg-gray-100 dark:bg-zinc-900 p-5 rounded-xl space-y-3 mb-6">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>Subtotal</span>
                          <span className="font-medium text-gray-900 dark:text-white">₹{subTotal.toLocaleString('en-IN')}</span>
                        </div>
                        {Number(discount) > 0 && (
                          <div className="flex justify-between text-sm text-red-600 dark:text-red-400 font-medium">
                            <span>Discount</span>
                            <span>-₹{Number(discount).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {gstEnabled && (
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>GST ({gstPercentage}%)</span>
                            <span className="font-medium text-gray-900 dark:text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {Number(shipping) > 0 && (
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Shipping / Delivery</span>
                            <span className="font-medium text-gray-900 dark:text-white">₹{Number(shipping).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 flex justify-between items-center">
                          <span className="font-bold text-gray-900 dark:text-white">Grand Total</span>
                          <span className="text-xl font-bold text-amber-600 dark:text-amber-500">₹{grandTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 mb-6">
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Payment & Delivery Terms</label>
                        <input
                          type="text"
                          value={paymentTerms}
                          onChange={e => setPaymentTerms(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm text-gray-900 dark:text-white"
                          placeholder="e.g. 50% advance, 50% on delivery. Dispatch within 7 days."
                        />
                      </div>

                      <div className="bg-gray-50 dark:bg-zinc-900/50 p-5 rounded-xl border border-gray-100 dark:border-zinc-800 mb-8">
                        <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Additional Notes</label>
                        <textarea
                          value={quotationNotes}
                          onChange={(e) => setQuotationNotes(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm text-gray-900 dark:text-white min-h-[80px]"
                          placeholder="Add any terms, conditions, or specific notes for this quotation..."
                        />
                      </div>

                      <div className="flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-950 pt-4 pb-2 border-t border-gray-100 dark:border-zinc-800">
                        <button
                          type="submit"
                          disabled={createQuotationMutation.isPending}
                          className="px-6 py-2.5 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-sm flex items-center"
                        >
                          {createQuotationMutation.isPending ? 'Generating PDF...' : 'Generate & Save Quotation'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add New Lead</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createLeadMutation.mutate(newLeadData);
              }}
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadData.name}
                  onChange={e => setNewLeadData({ ...newLeadData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={newLeadData.phone}
                  onChange={e => setNewLeadData({ ...newLeadData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={newLeadData.email}
                  onChange={e => setNewLeadData({ ...newLeadData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product/Service Name *</label>
                <input
                  type="text"
                  required
                  value={newLeadData.productName}
                  onChange={e => setNewLeadData({ ...newLeadData, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                  placeholder="e.g. Fine Art Portrait"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  value={newLeadData.priority || 'Medium'}
                  onChange={e => setNewLeadData({ ...newLeadData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-905 dark:text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Location (City/Area)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLeadData.location}
                    onChange={e => setNewLeadData({ ...newLeadData, location: e.target.value })}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                    placeholder="e.g. Mumbai"
                  />
                  <button
                    type="button"
                    onClick={handleGPSCapture}
                    disabled={gpsLoading}
                    className={`px-3 py-2 border rounded-lg flex items-center justify-center gap-1 font-bold text-xs uppercase tracking-wider transition-colors ${gpsSuccess ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-black text-black hover:bg-black hover:text-white dark:bg-zinc-900 dark:border-zinc-700 dark:text-white dark:hover:bg-white dark:hover:text-black'}`}
                  >
                    <Navigation className={`h-3 w-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                    {gpsLoading ? '...' : gpsSuccess ? 'GPS ✓' : 'GPS'}
                  </button>
                </div>
                {gpsSuccess && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                    ✓ Coordinates: {Number(newLeadData.latitude).toFixed(4)}, {Number(newLeadData.longitude).toFixed(4)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Address</label>
                <textarea
                  value={newLeadData.fullAddress}
                  onChange={e => setNewLeadData({ ...newLeadData, fullAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white resize-none h-16"
                  placeholder="Street address..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Requirements</label>
                <textarea
                  value={newLeadData.notesRequirements}
                  onChange={e => setNewLeadData({ ...newLeadData, notesRequirements: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white resize-none h-20"
                  placeholder="Inquiry requirements..."
                ></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLeadMutation.isPending}
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {createLeadMutation.isPending ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* QUOTATION INTERCEPT MODAL */}
      {quoteInterceptState?.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create Quotation?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              You are moving this lead to the "Quote Sent" stage. Would you like to build a formal quotation now, or continue without one?
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  // 1. Mutate lead stage
                  updateLeadStageMutation.mutate({ id: quoteInterceptState.leadId, stage: 'Quote Sent' });
                  // 2. Open Lead Modal on Quotations tab
                  const lead = leads?.find(l => l._id === quoteInterceptState.leadId);
                  if (lead) {
                    setSelectedLead(lead);
                    setActiveTab('quotations');
                    setIsQuoting(true);
                  }
                  // 3. Close intercept modal
                  setQuoteInterceptState(null);
                }}
                className="w-full px-4 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-sm flex items-center justify-center"
              >
                <Calculator size={18} className="mr-2" /> Create Quotation Now
              </button>
              <button
                onClick={() => {
                  // Mutate lead stage and set skipped flag
                  updateLeadStageMutation.mutate({ id: quoteInterceptState.leadId, stage: 'Quote Sent', quotationSkipped: true });
                  setQuoteInterceptState(null);
                }}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Continue Without Quotation
              </button>
              <button
                onClick={() => setQuoteInterceptState(null)}
                className="w-full px-4 py-2 mt-2 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Cancel Movement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADVANCE PAYMENT MODAL */}
      {advanceModalState?.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20">
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-400">Confirm Booking (Advance Payment)</h3>
              <button
                onClick={() => setAdvanceModalState(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createBookingMutation.mutate({
                  leadId: advanceModalState.leadId,
                  quotationId: advanceModalState.quotationId,
                  totalAmount: Number(advanceModalState.totalAmount),
                  deliveryDate: advancePaymentData.deliveryDate,
                  notes: advancePaymentData.notes,
                  payment: {
                    amount: Number(advancePaymentData.amount),
                    date: advancePaymentData.date,
                    method: advancePaymentData.method,
                    reference: advancePaymentData.reference,
                    notes: advancePaymentData.notes
                  },
                  proofs: paymentProofs
                });
              }}
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Total Project Amount (Rs) *</label>
                <input
                  type="number"
                  required
                  value={advanceModalState.totalAmount}
                  onChange={e => setAdvanceModalState({ ...advanceModalState, totalAmount: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Delivery Date *</label>
                <input
                  type="date"
                  required
                  value={advancePaymentData.deliveryDate}
                  onChange={e => setAdvancePaymentData({ ...advancePaymentData, deliveryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-emerald-300 dark:border-emerald-700/50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Advance Amount Received (Rs) *</label>
                <input
                  type="number"
                  required
                  value={advancePaymentData.amount}
                  onChange={e => setAdvancePaymentData({ ...advancePaymentData, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-emerald-300 dark:border-emerald-700/50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-bold"
                  placeholder="e.g. 5000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={advancePaymentData.date}
                    onChange={e => setAdvancePaymentData({ ...advancePaymentData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method *</label>
                  <select
                    value={advancePaymentData.method}
                    onChange={e => setAdvancePaymentData({ ...advancePaymentData, method: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Bank Transfer</option>
                    <option>Credit Card</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Reference (Optional)</label>
                <input
                  type="text"
                  value={advancePaymentData.reference}
                  onChange={e => setAdvancePaymentData({ ...advancePaymentData, reference: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                  placeholder="Txn ID or Cheque No."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Comments</label>
                <input
                  type="text"
                  value={advancePaymentData.notes}
                  onChange={e => setAdvancePaymentData({ ...advancePaymentData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                  placeholder="Any additional notes or comments..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Proof (Optional)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-zinc-950 hover:bg-gray-100 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="mb-1 text-xs text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">PNG, JPG or WEBP (Max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setPaymentProofs([...paymentProofs, ...Array.from(e.target.files)]);
                        }
                      }}
                    />
                  </label>
                </div>
                {paymentProofs.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {paymentProofs.map((file, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-zinc-700 group">
                        <img src={URL.createObjectURL(file)} alt="proof" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPaymentProofs(paymentProofs.filter((_, i) => i !== idx))}
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
                  type="button"
                  onClick={() => setAdvanceModalState(null)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {createBookingMutation.isPending ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT LEAD MODAL */}
      {isEditModalOpen && editLeadData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Lead</h3>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditLeadData(null); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                editLeadMutation.mutate(editLeadData);
              }}
              className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editLeadData.name}
                  onChange={e => setEditLeadData({ ...editLeadData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={editLeadData.phone}
                  onChange={e => setEditLeadData({ ...editLeadData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editLeadData.email || ''}
                  onChange={e => setEditLeadData({ ...editLeadData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product/Service Name *</label>
                <input
                  type="text"
                  required
                  value={editLeadData.productName}
                  onChange={e => setEditLeadData({ ...editLeadData, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                <select
                  value={editLeadData.priority || 'Medium'}
                  onChange={e => setEditLeadData({ ...editLeadData, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-905 dark:text-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Location (City/Area)</label>
                <input
                  type="text"
                  value={editLeadData.location || ''}
                  onChange={e => setEditLeadData({ ...editLeadData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
                <select
                  value={editLeadData.stage}
                  onChange={e => setEditLeadData({ ...editLeadData, stage: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                >
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes/Requirements</label>
                <textarea
                  value={editLeadData.notesRequirements || editLeadData.message || ''}
                  onChange={e => setEditLeadData({ ...editLeadData, notesRequirements: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditLeadData(null); }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLeadMutation.isPending}
                  className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {editLeadMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL FOR LEAD */}
      <ConfirmModal
        isOpen={!!deleteConfirmState}
        onClose={() => setDeleteConfirmState(null)}
        onConfirm={() => {
          if (deleteConfirmState) {
            deleteLeadMutation.mutate(deleteConfirmState);
          }
        }}
        title="Delete Lead?"
        message={
          <>
            Are you sure you want to delete this lead? <br />
            <strong>This action cannot be undone.</strong>
          </>
        }
        confirmText="Delete"
        type="danger"
        isLoading={deleteLeadMutation.isPending}
      />

      {/* DELETE CONFIRM MODAL FOR QUOTATION */}
      <ConfirmModal
        isOpen={!!deleteQuotationConfirmState}
        onClose={() => setDeleteQuotationConfirmState(null)}
        onConfirm={() => {
          if (deleteQuotationConfirmState) {
            api.delete(`/quotations/${deleteQuotationConfirmState}`).then(() => {
              toast.success('Quotation deleted');
              refetchQuotations();
              setDeleteQuotationConfirmState(null);
            }).catch(() => {
              toast.error('Failed to delete quotation');
              setDeleteQuotationConfirmState(null);
            });
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
        isLoading={false}
      />
    </div>
  );
};

export default LeadsList;
