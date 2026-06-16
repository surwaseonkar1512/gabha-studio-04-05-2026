import React from 'react';
import { TrendingUp, DollarSign, Briefcase, Users, MessageSquare, Mail, Award, LineChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const BusinessOverviewTab = ({ data }: { data: any }) => {
  const { overview, revenueAnalytics, metrics, charts } = data;

  const stats = [
    { title: 'Total Revenue', value: `₹${overview?.totalRevenue.toLocaleString('en-IN')}`, icon: <TrendingUp size={24} />, color: 'text-indigo-650 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { title: 'Total Expenses', value: `₹${overview?.totalExpenses.toLocaleString('en-IN')}`, icon: <DollarSign size={24} />, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { title: 'Net Profit', value: `₹${overview?.netProfit.toLocaleString('en-IN')}`, icon: <Briefcase size={24} />, color: 'text-emerald-655 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Active Bookings', value: overview?.activeBookings || 0, icon: <Users size={24} />, color: 'text-amber-650 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  const secondaryStats = [
    { title: 'New Leads', value: metrics?.newLeads || 0, total: metrics?.totalLeads || 0, subtitle: 'Unassigned/New pipeline leads', icon: <Users size={20} />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10' },
    { title: 'Newsletter Subscribers', value: metrics?.activeSubscribers || 0, total: metrics?.totalSubscribers || 0, subtitle: 'Active newsletter audience', icon: <Mail size={20} />, color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/10' },
    { title: 'Contact Us Queries', value: metrics?.newContactUs || 0, total: metrics?.totalContactUs || 0, subtitle: 'New inbox contact form messages', icon: <MessageSquare size={20} />, color: 'text-purple-650 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/10' },
    { title: 'Approved Quotations', value: metrics?.quotationsApproved || 0, total: metrics?.quotationsSent || 0, subtitle: 'Approved vs total sent quotes', icon: <Award size={20} />, color: 'text-amber-655 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 flex items-center justify-between hover:-translate-y-1 transition-transform duration-300 shadow-sm">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Secondary CRM & Public Activity Widgets */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <LineChart size={18} className="text-amber-500" /> Website Engagement & Pipeline Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {secondaryStats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-transform duration-300 shadow-xs">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {stat.value} <span className="text-sm font-normal text-gray-450 dark:text-gray-400">/ {stat.total}</span>
                  </h4>
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-455">{stat.subtitle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue vs Expenses Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue vs Expenses Overview</h3>
          <div className="h-[350px] w-full">
            {revenueAnalytics?.monthlyTrends?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueAnalytics.monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', backgroundColor: '#18181b', border: 'none', color: '#fff' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No data available for this period.</div>
            )}
          </div>
        </div>

        {/* Lead Status Distribution Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Lead Status Breakdown</h3>
          <div className="h-[350px] w-full">
            {charts?.leadStatusDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.leadStatusDistribution} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="status" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} width={95} />
                  <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', backgroundColor: '#18181b', border: 'none', color: '#fff' }} />
                  <Bar dataKey="count" name="Leads" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20}>
                    {charts.leadStatusDistribution.map((entry: any, index: number) => {
                      const colors = ['#3b82f6', '#eab308', '#a855f7', '#10b981', '#ef4444', '#6b7280'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No distribution data.</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default BusinessOverviewTab;
