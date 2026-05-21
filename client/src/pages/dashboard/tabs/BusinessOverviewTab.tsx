import React from 'react';
import { TrendingUp, DollarSign, Briefcase, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const BusinessOverviewTab = ({ data }: { data: any }) => {
  const { overview, revenueAnalytics } = data;

  const stats = [
    { title: 'Total Revenue', value: `₹${overview?.totalRevenue.toLocaleString('en-IN')}`, icon: <TrendingUp size={24} />, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Total Expenses', value: `₹${overview?.totalExpenses.toLocaleString('en-IN')}`, icon: <DollarSign size={24} />, color: 'text-rose-600', bg: 'bg-rose-100' },
    { title: 'Net Profit', value: `₹${overview?.netProfit.toLocaleString('en-IN')}`, icon: <Briefcase size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Active Bookings', value: overview?.activeBookings, icon: <Users size={24} />, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color} dark:bg-opacity-20`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue vs Expenses Overview</h3>
        <div className="h-[350px] w-full">
          {revenueAnalytics.monthlyTrends.length > 0 ? (
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
    </div>
  );
};

export default BusinessOverviewTab;
