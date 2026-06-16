import React, { useEffect, useState } from 'react';
import { Search, Filter, Mail, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

interface Subscriber {
  _id: string;
  email: string;
  source: string;
  status: 'Active' | 'Unsubscribed';
  createdAt: string;
}

const NewsletterList = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/newsletter', {
        params: {
          search,
          status: statusFilter
        }
      });
      setSubscribers(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load subscribers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [search, statusFilter]);

  const handleToggleStatus = async (id: string, currentStatus: 'Active' | 'Unsubscribed') => {
    const newStatus = currentStatus === 'Active' ? 'Unsubscribed' : 'Active';
    try {
      await api.put(`/newsletter/${id}/status`, { status: newStatus });
      toast.success(`Subscriber is now ${newStatus}`);
      setSubscribers(prev => prev.map(s => s._id === id ? { ...s, status: newStatus } : s));
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle size={12} /> Active
          </span>
        );
      case 'Unsubscribed':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <XCircle size={12} /> Unsubscribed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Newsletter Subscribers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage email subscriptions and newsletter audience lists.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-850 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by email..."
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
            <option value="All">All Subscribers</option>
            <option value="Active">Active</option>
            <option value="Unsubscribed">Unsubscribed</option>
          </select>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-850 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
            <p>Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            <Mail size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No subscribers found</p>
            <p className="text-sm mt-1">There are no subscribers matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4">Subscription Date</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Source Page</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Toggle Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-sm text-gray-750 dark:text-gray-300">
                {subscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(sub.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {sub.email}
                    </td>
                    <td className="px-6 py-4">
                      {sub.source || 'Website Footer'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(sub.status)}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(sub._id, sub.status)}
                        className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors ${sub.status === 'Active' ? 'border-red-250 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20' : 'border-green-250 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'}`}
                      >
                        {sub.status === 'Active' ? 'Unsubscribe' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterList;
