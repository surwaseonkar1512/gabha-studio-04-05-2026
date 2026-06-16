import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, Eye, Check, Clock, Trash2, MailOpen, AlertCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

interface ContactInquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'New' | 'Contacted' | 'Closed';
  createdAt: string;
}

const ContactsList = () => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // View Modal State
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/contacts', {
        params: {
          search,
          status: statusFilter
        }
      });
      setInquiries(data);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [search, statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: 'New' | 'Contacted' | 'Closed') => {
    try {
      await api.put(`/contacts/${id}/status`, { status: newStatus });
      toast.success(`Inquiry status updated to ${newStatus}`);
      setInquiries(prev => prev.map(item => item._id === id ? { ...item, status: newStatus } : item));
      if (selectedInquiry?._id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status.');
    }
  };

  const handleExportCSV = () => {
    const downloadUrl = `${api.defaults.baseURL}/contacts?exportCSV=true&search=${search}&status=${statusFilter}`;
    // Fetch directly using window.open or Axios to download with auth header.
    // Since we require authorization headers, we should download via an authed fetch:
    api.get('/contacts', {
      params: { search, status: statusFilter, exportCSV: 'true' },
      responseType: 'blob'
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contact_Inquiries_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }).catch(err => {
      console.error(err);
      toast.error('Failed to export CSV.');
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">New Inquiry</span>;
      case 'Contacted':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Contacted</span>;
      case 'Closed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Closed / Resolved</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Us Inbox</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage message inquiries received from the public Contact page.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm transition-colors dark:bg-zinc-800 dark:hover:bg-zinc-700"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-850 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search inquiries (Name, Email, Phone, Message)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-205 dark:border-zinc-800 bg-transparent rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 px-3 py-2 border border-gray-205 dark:border-zinc-800 rounded-lg shrink-0">
            <Filter size={16} className="text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-205 dark:border-zinc-800 bg-transparent rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="All">All Inquiries</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* inquiries Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-850 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
            <p>Loading inquiries...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            <MailOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No inquiries found</p>
            <p className="text-sm mt-1">There are no contact inquiries matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">Received Date</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Message Snippet</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-sm text-gray-750 dark:text-gray-300">
                {inquiries.map((inq) => (
                  <tr key={inq._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {inq.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{inq.email}</span>
                        <span className="text-xs text-gray-500">{inq.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium max-w-[200px] truncate">
                      {inq.subject}
                    </td>
                    <td className="px-6 py-4 max-w-[250px] truncate text-gray-500">
                      {inq.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inq.status)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <select
                          value={inq.status}
                          onChange={(e) => handleUpdateStatus(inq._id, e.target.value as any)}
                          className="text-xs border border-gray-205 dark:border-zinc-800 bg-transparent rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW INQUIRY DETAILS DIALOG */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-850 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inquiry Details</h2>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                  Received on {new Date(selectedInquiry.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-400">Sender Name</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedInquiry.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-400">Phone Number</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedInquiry.phone}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs font-bold uppercase text-gray-400">Email Address</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedInquiry.email}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
                <span className="block text-xs font-bold uppercase text-gray-400 mb-1">Subject / Product Interest</span>
                <span className="text-sm font-semibold text-gray-950 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg block">
                  {selectedInquiry.subject}
                </span>
              </div>

              <div className="border-t border-gray-100 dark:border-zinc-800 pt-4">
                <span className="block text-xs font-bold uppercase text-gray-400 mb-1">Inquiry Message</span>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl leading-relaxed border border-gray-100 dark:border-zinc-800/80">
                  {selectedInquiry.message}
                </p>
              </div>

              <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 flex justify-between items-center">
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-400 mb-1">Status</span>
                  {getStatusBadge(selectedInquiry.status)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'Contacted')}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-medium"
                  >
                    Mark Contacted
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedInquiry._id, 'Closed')}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                  >
                    Close Inquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsList;
