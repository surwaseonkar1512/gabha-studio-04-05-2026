import React, { useEffect, useState } from 'react';
import { Search, Filter, Users, Phone, Mail, MapPin, DollarSign, Calendar, ArrowUpDown } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

interface Customer {
  name: string;
  phone: string;
  email: string;
  location: string;
  leadsCount: number;
  quotesCount: number;
  bookingsCount: number;
  totalPaid: number;
  totalBooked: number;
  latestStage: string;
  createdAt: string;
}

const CustomersList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search/Filters
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  
  // Sorting
  const [sortBy, setSortBy] = useState<'totalBooked' | 'bookingsCount' | 'name' | 'createdAt'>('totalBooked');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/dashboard/customers');
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load customers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter & Sort Logic
  useEffect(() => {
    let result = [...customers];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) || 
        c.phone.toLowerCase().includes(q) || 
        c.location.toLowerCase().includes(q)
      );
    }

    // Stage filter
    if (stageFilter !== 'All') {
      result = result.filter(c => c.latestStage === stageFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        comparison = a[sortBy] - b[sortBy];
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredCustomers(result);
  }, [search, stageFilter, sortBy, sortOrder, customers]);

  const toggleSort = (field: 'totalBooked' | 'bookingsCount' | 'name' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'New Lead':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-850 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Proposal Sent':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Won':
      case 'Booking':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'Completed':
        return 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-400';
      case 'Lost':
      default:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customers Directory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View and manage converted customers, leads history, and booking values.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-200 dark:border-zinc-850 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, phone or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-250 dark:border-zinc-800 bg-transparent rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-amber-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 px-3 py-2 border border-gray-250 dark:border-zinc-800 rounded-lg shrink-0">
            <Filter size={16} className="text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">Pipeline Stage:</span>
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-250 dark:border-zinc-800 bg-transparent rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none"
          >
            <option value="All">All Stages</option>
            <option value="New Lead">New Lead</option>
            <option value="Contacted">Contacted</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Won">Won</option>
            <option value="Completed">Completed</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Customers Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-850 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full mb-4"></div>
            <p>Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No customers found</p>
            <p className="text-sm mt-1">There are no customers matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort('name')}>
                    <div className="flex items-center gap-1.5">
                      Customer <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort('bookingsCount')}>
                    <div className="flex items-center gap-1.5">
                      Bookings/Quotes/Leads <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4 cursor-pointer" onClick={() => toggleSort('totalBooked')}>
                    <div className="flex items-center gap-1.5">
                      Total Booked Value <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-6 py-4">Paid / Pending</th>
                  <th className="px-6 py-4">Latest Stage</th>
                  <th className="px-6 py-4 cursor-pointer text-right" onClick={() => toggleSort('createdAt')}>
                    <div className="flex items-center justify-end gap-1.5">
                      Added Date <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 text-sm text-gray-750 dark:text-gray-300">
                {filteredCustomers.map((customer, idx) => {
                  const pendingAmount = Math.max(0, customer.totalBooked - customer.totalPaid);
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="flex items-center gap-1.5 text-xs">
                            <Phone size={12} className="text-gray-400" /> {customer.phone}
                          </p>
                          {customer.email && customer.email !== 'N/A' && (
                            <p className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Mail size={12} className="text-gray-400" /> {customer.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1 text-xs">
                          <MapPin size={12} className="text-gray-400 shrink-0" /> {customer.location}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded text-xs font-bold border border-amber-200 dark:border-amber-900/30" title="Bookings">
                            {customer.bookingsCount} B
                          </span>
                          <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded text-xs font-bold border border-blue-200 dark:border-blue-900/30" title="Quotes">
                            {customer.quotesCount} Q
                          </span>
                          <span className="px-2 py-0.5 bg-gray-55 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 rounded text-xs font-bold border border-gray-200 dark:border-zinc-700" title="Total Leads">
                            {customer.leadsCount} L
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-950 dark:text-white">
                        ₹{customer.totalBooked.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            Paid: ₹{customer.totalPaid.toLocaleString('en-IN')}
                          </p>
                          {pendingAmount > 0 && (
                            <p className="text-xs text-rose-500 font-semibold">
                              Pending: ₹{pendingAmount.toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStageColor(customer.latestStage)}`}>
                          {customer.latestStage}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-xs text-gray-500">
                        {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersList;
