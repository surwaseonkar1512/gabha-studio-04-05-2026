import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Users, Calendar, DollarSign, CreditCard, Star, PieChart } from 'lucide-react';
import { format, subDays, startOfMonth, subMonths, startOfQuarter, startOfYear } from 'date-fns';
import api from '../../api/axiosInstance';

// Tab Components
import BusinessOverviewTab from './tabs/BusinessOverviewTab';
import LeadAnalyticsTab from './tabs/LeadAnalyticsTab';
import BookingAnalyticsTab from './tabs/BookingAnalyticsTab';
import RevenueAnalyticsTab from './tabs/RevenueAnalyticsTab';
import PaymentAnalyticsTab from './tabs/PaymentAnalyticsTab';
import ExpenseAnalyticsTab from './tabs/ExpenseAnalyticsTab';
import CustomerInsightsTab from './tabs/CustomerInsightsTab';

const TABS = [
  { id: 'overview', label: 'Business Overview', icon: <LayoutDashboard size={18} /> },
  { id: 'leads', label: 'Lead Analytics', icon: <Users size={18} /> },
  { id: 'bookings', label: 'Booking Analytics', icon: <Calendar size={18} /> },
  { id: 'revenue', label: 'Revenue & Profit', icon: <DollarSign size={18} /> },
  { id: 'expenses', label: 'Expense Analytics', icon: <PieChart size={18} /> },
  { id: 'payments', label: 'Payment Analytics', icon: <CreditCard size={18} /> },
  { id: 'customers', label: 'Customer Insights', icon: <Star size={18} /> },
];

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('This Month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const getDateFilter = () => {
    const today = new Date();
    let start, end = today;
    
    switch (dateRange) {
      case 'Today':
        start = today;
        break;
      case 'This Week':
        start = subDays(today, 7);
        break;
      case 'This Month':
        start = startOfMonth(today);
        break;
      case 'Last Month':
        start = startOfMonth(subMonths(today, 1));
        end = subDays(startOfMonth(today), 1);
        break;
      case 'Quarterly':
        start = startOfQuarter(today);
        break;
      case 'Yearly':
        start = startOfYear(today);
        break;
      case 'Custom':
        return { startDate: customRange.start, endDate: customRange.end };
      default:
        start = startOfMonth(today);
    }
    return { 
      startDate: format(start, 'yyyy-MM-dd'), 
      endDate: format(end, 'yyyy-MM-dd') 
    };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', dateRange, customRange],
    queryFn: async () => {
      const dates = getDateFilter();
      const res = await api.get('/dashboard', { params: dates });
      return res.data;
    }
  });

  const renderTabContent = () => {
    if (isLoading) return <div className="flex justify-center items-center h-[50vh]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div></div>;
    if (error || !data) return <div className="text-red-500 p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-rose-200 dark:border-rose-900/30">Failed to load analytics data.</div>;

    switch (activeTab) {
      case 'overview': return <BusinessOverviewTab data={data} />;
      case 'leads': return <LeadAnalyticsTab data={data} />;
      case 'bookings': return <BookingAnalyticsTab data={data} />;
      case 'revenue': return <RevenueAnalyticsTab data={data} />;
      case 'expenses': return <ExpenseAnalyticsTab data={data} />;
      case 'payments': return <PaymentAnalyticsTab data={data} />;
      case 'customers': return <CustomerInsightsTab data={data} />;
      default: return <BusinessOverviewTab data={data} />;
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header & Global Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Business Intelligence</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Comprehensive analytics and performance tracking</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white font-medium shadow-sm"
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Last Month</option>
            <option>Quarterly</option>
            <option>Yearly</option>
            <option>Custom</option>
          </select>
          
          {dateRange === 'Custom' && (
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-1 shadow-sm">
              <input 
                type="date" value={customRange.start} onChange={e => setCustomRange({...customRange, start: e.target.value})}
                className="px-2 py-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input 
                type="date" value={customRange.end} onChange={e => setCustomRange({...customRange, end: e.target.value})}
                className="px-2 py-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden shrink-0">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="flex p-1 gap-1 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-500'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800/50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Tab Content */}
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Dashboard;
