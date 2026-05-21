import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

const RevenueAnalyticsTab = ({ data }: { data: any }) => {
  const { revenueAnalytics } = data;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">₹{revenueAnalytics.totalRevenue.toLocaleString('en-IN')}</h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
            <TrendingDown size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">₹{revenueAnalytics.totalExpenses.toLocaleString('en-IN')}</h3>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 pointer-events-none"></div>
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 z-10">
            <DollarSign size={24} />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 z-10">Net Profit</p>
          <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 z-10">₹{revenueAnalytics.netProfit.toLocaleString('en-IN')}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue vs Expenses (Monthly Trend)</h3>
          <div className="h-[350px] w-full">
            {revenueAnalytics.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueAnalytics.monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', backgroundColor: '#18181b', border: 'none', color: '#fff' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev2)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorExp2)" />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No data available for this period.</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Profitability Highlights</h3>
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-lg border border-gray-100 dark:border-zinc-800">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Calendar size={16} className="mr-2" /> Highest Revenue Month
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{revenueAnalytics.highestRevenueMonth}</h4>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-zinc-950 rounded-lg border border-gray-100 dark:border-zinc-800">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <Calendar size={16} className="mr-2" /> Lowest Revenue Month
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">{revenueAnalytics.lowestRevenueMonth}</h4>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
               <div className="flex items-center text-sm text-emerald-600 dark:text-emerald-500 mb-1 font-medium">
                Profit Margin
              </div>
              <h4 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {revenueAnalytics.totalRevenue > 0 ? Math.round((revenueAnalytics.netProfit / revenueAnalytics.totalRevenue) * 100) : 0}%
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalyticsTab;
