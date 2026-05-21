import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, CreditCard, FileText, Download, CheckCircle, Clock, CalendarDays, X, Plus, Receipt, ChevronRight, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axiosInstance';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface Payment {
  _id: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  method: string;
  method: string;
  reference?: string;
  notes?: string;
  isFinal: boolean;
  proofUrls?: string[];
}

interface Booking {
  _id: string;
  bookingId: string;
  lead: {
    _id: string;
    name: string;
    phone: string;
    email: string;
    stage: string;
    createdAt: string;
  };
  quotation?: {
    _id: string;
    quotationNumber: string;
    createdAt: string;
  };
  totalAmount: number;
  paidAmount: number;
  payments: Payment[];
  status: string;
  createdAt: string;
}

const BookingsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline'>('overview');
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: '', date: new Date().toISOString().split('T')[0], method: 'UPI', reference: '', notes: '', isFinal: false });

  // Payment Confirm Modal State
  const [paymentConfirmState, setPaymentConfirmState] = useState(false);
  const [paymentProofs, setPaymentProofs] = useState<File[]>([]);
  const [imageViewerOpen, setImageViewerOpen] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: bookings, isLoading, error } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings');
      return data;
    }
  });

  const { data: bookingDetails } = useQuery<Booking>({
    queryKey: ['booking', selectedBooking?._id],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/${selectedBooking?._id}`);
      return data;
    },
    enabled: !!selectedBooking
  });

  const addPaymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append('amount', data.amount.toString());
      formData.append('date', data.date);
      formData.append('method', data.method);
      if (data.reference) formData.append('reference', data.reference);
      if (data.notes) formData.append('notes', data.notes);
      formData.append('isFinal', data.isFinal.toString());

      if (data.proofs) {
        data.proofs.forEach((file: File) => formData.append('proofs', file));
      }

      const res = await api.post(`/bookings/${selectedBooking?._id}/payment`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (updatedBooking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking', selectedBooking?._id] });
      setSelectedBooking(updatedBooking); // Optimistic UI update
      setIsAddingPayment(false);
      setPaymentData({ amount: '', date: new Date().toISOString().split('T')[0], method: 'UPI', reference: '', notes: '', isFinal: false });
      setPaymentProofs([]);
      toast.success('Payment added successfully');
    },
    onError: () => toast.error('Failed to add payment')
  });

  const filteredBookings = bookings?.filter(b => 
    (b.bookingId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.lead?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setPaymentConfirmState(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'Completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  if (error) return <div className="text-red-500">Error loading bookings</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bookings & Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage confirmed bookings and track invoices</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden flex-shrink-0">
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-all"
            />
          </div>
          <button className="flex items-center px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium">
            <Filter size={16} className="mr-2" /> Filter
          </button>
        </div>
      </div>

      {/* LIST VIEW */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden flex-1">
        <div className="overflow-x-auto h-full">
          {filteredBookings.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-zinc-950 sticky top-0 z-10">
                <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-zinc-800">
                  <th className="px-6 py-4 font-medium">Booking ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Total</th>
                  <th className="px-6 py-4 font-medium text-right">Balance</th>
                  <th className="px-6 py-4 font-medium text-center">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                {filteredBookings.map((booking) => {
                  const balance = booking.totalAmount - booking.paidAmount;
                  return (
                    <tr key={booking._id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center">
                          <CalendarDays size={14} className="mr-2 text-emerald-500" />
                          {booking.bookingId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{booking.lead?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{booking.lead?.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-gray-900 dark:text-white">
                        ₹{booking.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className={`font-medium ${balance > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
                          ₹{balance.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
                          Manage
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 dark:text-gray-500">
                <CreditCard size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No bookings found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Move a lead to the Booking stage to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* BOOKING DETAILS SIDE PANEL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50 dark:bg-zinc-900">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedBooking.bookingId}</h2>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Customer: <span className="font-medium text-gray-700 dark:text-gray-300">{selectedBooking.lead?.name}</span>
                </div>
              </div>
              <button
                onClick={() => { setSelectedBooking(null); setIsAddingPayment(false); }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
              >
                <X size={24} />
              </button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-zinc-800 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-medium">Total Amount</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">₹{selectedBooking.totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-medium">Paid</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-500">₹{selectedBooking.paidAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="p-4 text-center bg-gray-50/50 dark:bg-zinc-900/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider font-medium">Balance</p>
                <p className={`text-xl font-bold ${(selectedBooking.totalAmount - selectedBooking.paidAmount) > 0 ? 'text-amber-600 dark:text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                  ₹{(selectedBooking.totalAmount - selectedBooking.paidAmount).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 border-b border-gray-100 dark:border-zinc-800 flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'overview' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                <CreditCard size={16} className="mr-2" /> Payment History
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'timeline' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
              >
                <Clock size={16} className="mr-2" /> Unified Timeline
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 dark:bg-zinc-950 custom-scrollbar">

              {activeTab === 'overview' && (
                <div>
                  {!isAddingPayment ? (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invoices & Receipts</h3>
                        {(selectedBooking.totalAmount - selectedBooking.paidAmount) > 0 && selectedBooking.status === 'Active' && (
                          <button
                            onClick={() => setIsAddingPayment(true)}
                            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
                          >
                            <Plus size={16} className="mr-2" /> Add Payment
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        {selectedBooking.payments.map((payment, idx) => (
                          <div key={payment._id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                            {payment.isFinal && (
                              <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                                Final Settlement
                              </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="font-bold text-gray-900 dark:text-white flex items-center">
                                  {payment.invoiceNumber}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Paid on {new Date(payment.date).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Via {payment.method} {payment.reference && `(${payment.reference})`}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-500">₹{payment.amount.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800">
                              <button
                                onClick={() => window.open(`http://localhost:5000/api/bookings/${selectedBooking._id}/invoice/${payment._id}`, '_blank')}
                                className="w-full flex items-center justify-center px-4 py-2 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 transition-colors text-sm font-medium"
                              >
                                <Download size={16} className="mr-2" /> Download PDF Invoice
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handlePaymentSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Record New Payment</h3>
                        <button
                          type="button"
                          onClick={() => setIsAddingPayment(false)}
                          className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-800 shadow-sm space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Received (Rs) *</label>
                          <input
                            type="number"
                            required
                            max={selectedBooking.totalAmount - selectedBooking.paidAmount}
                            value={paymentData.amount}
                            onChange={e => setPaymentData({ ...paymentData, amount: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-emerald-300 dark:border-emerald-700/50 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white font-bold"
                            placeholder={`Max: ${selectedBooking.totalAmount - selectedBooking.paidAmount}`}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                            <input
                              type="date"
                              required
                              value={paymentData.date}
                              onChange={e => setPaymentData({ ...paymentData, date: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method *</label>
                            <select
                              value={paymentData.method}
                              onChange={e => setPaymentData({ ...paymentData, method: e.target.value })}
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
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction Reference</label>
                          <input
                            type="text"
                            value={paymentData.reference}
                            onChange={e => setPaymentData({ ...paymentData, reference: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                          <input
                            type="text"
                            value={paymentData.notes}
                            onChange={e => setPaymentData({ ...paymentData, notes: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-950 border border-gray-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white text-sm"
                          />
                        </div>
                        
                        <div className="pt-2">
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

                        <div className="pt-2">
                          <label className="flex items-center cursor-pointer p-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg">
                            <input
                              type="checkbox"
                              checked={paymentData.isFinal}
                              onChange={e => setPaymentData({ ...paymentData, isFinal: e.target.checked })}
                              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                            />
                            <span className="ml-3 text-sm font-bold text-gray-900 dark:text-white">Mark as Final Payment (Settlement)</span>
                          </label>
                          <p className="text-xs text-gray-500 mt-2 ml-1">This will generate a Final Invoice with complete payment history and mark the Booking as Completed.</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="submit"
                          disabled={addPaymentMutation.isPending}
                          className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
                        >
                          {addPaymentMutation.isPending ? 'Processing...' : 'Save Payment & Generate Invoice'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeTab === 'timeline' && bookingDetails && (
                <div className="relative pl-6 py-4">
                  {/* Vertical Line */}
                  <div className="absolute top-0 bottom-0 left-8 w-0.5 bg-gray-200 dark:bg-zinc-800"></div>

                  <div className="space-y-8">
                    {/* Event 1: Lead Creation */}
                    <div className="relative">
                      <div className="absolute -left-3 top-1 w-6 h-6 bg-white dark:bg-zinc-950 rounded-full border-2 border-gray-300 dark:border-zinc-600 flex items-center justify-center z-10">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-zinc-500 rounded-full"></div>
                      </div>
                      <div className="ml-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Lead Created</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(bookingDetails.lead.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Event 2: Quotation */}
                    {bookingDetails.quotation && (
                      <div className="relative">
                        <div className="absolute -left-3 top-1 w-6 h-6 bg-white dark:bg-zinc-950 rounded-full border-2 border-amber-300 dark:border-amber-600 flex items-center justify-center z-10">
                          <FileText size={10} className="text-amber-500" />
                        </div>
                        <div className="ml-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm">Quotation Accepted</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Quote {bookingDetails.quotation.quotationNumber} confirmed. Total: ₹{bookingDetails.totalAmount.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">{new Date(bookingDetails.quotation.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}

                    {/* Event 3: Booking Created */}
                    <div className="relative">
                      <div className="absolute -left-3 top-1 w-6 h-6 bg-white dark:bg-zinc-950 rounded-full border-2 border-blue-300 dark:border-blue-600 flex items-center justify-center z-10">
                        <CalendarDays size={10} className="text-blue-500" />
                      </div>
                      <div className="ml-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 p-4 rounded-xl shadow-sm">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Booking Confirmed</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{bookingDetails.bookingId} created.</p>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">{new Date(bookingDetails.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Payments Timeline */}
                    {bookingDetails.payments.map((payment, index) => (
                      <div key={payment._id} className="relative">
                        <div className="absolute -left-3 top-1 w-6 h-6 bg-white dark:bg-zinc-950 rounded-full border-2 border-emerald-400 flex items-center justify-center z-10">
                          <CreditCard size={10} className="text-emerald-500" />
                        </div>
                        <div className="ml-8 bg-white dark:bg-zinc-900 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl shadow-sm">
                          <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">
                            {index === 0 ? 'Advance Payment Received' : (payment.isFinal ? 'Final Settlement Received' : 'Payment Received')}
                          </h4>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">₹{payment.amount.toLocaleString('en-IN')} via {payment.method}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Invoice: {payment.invoiceNumber}</p>
                          <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">{new Date(payment.date).toLocaleString()}</p>
                          {payment.proofUrls && payment.proofUrls.length > 0 && (
                            <div className="mt-3 flex gap-2 flex-wrap">
                              {payment.proofUrls.map((url, i) => (
                                <div 
                                  key={i} 
                                  onClick={() => setImageViewerOpen(url)}
                                  className="w-12 h-12 rounded overflow-hidden border border-gray-200 dark:border-zinc-700 cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                                >
                                  <img src={url} alt="Proof" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Final Status */}
                    {bookingDetails.status === 'Completed' && (
                      <div className="relative">
                        <div className="absolute -left-3 top-1 w-6 h-6 bg-white dark:bg-zinc-950 rounded-full border-2 border-emerald-500 flex items-center justify-center z-10">
                          <CheckCircle size={12} className="text-emerald-500" />
                        </div>
                        <div className="ml-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 rounded-xl shadow-sm">
                          <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Project Completed</h4>
                          <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">All payments cleared. Final invoice generated.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT CONFIRM MODAL */}
      <ConfirmModal
        isOpen={paymentConfirmState}
        onClose={() => setPaymentConfirmState(false)}
        onConfirm={() => {
          addPaymentMutation.mutate(paymentData);
          setPaymentConfirmState(false);
        }}
        title={paymentData.isFinal ? "Final Settlement Confirmation" : "Confirm Payment Record"}
        message={
          <>
            You are about to record a payment of <strong>₹{Number(paymentData.amount).toLocaleString('en-IN')}</strong> via {paymentData.method}.
            {paymentData.isFinal && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                <strong>Warning:</strong> You have marked this as the final settlement. This will mark the entire project as "Completed" and generate the final comprehensive invoice.
              </div>
            )}
          </>
        }
        confirmText={paymentData.isFinal ? "Complete Project & Save" : "Save Payment"}
        type={paymentData.isFinal ? "warning" : "info"}
        isLoading={addPaymentMutation.isPending}
      />

      {/* FULL SCREEN IMAGE VIEWER */}
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
            alt="Payment Proof" 
            className="max-w-full max-h-[90vh] object-contain rounded animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
};

export default BookingsList;
