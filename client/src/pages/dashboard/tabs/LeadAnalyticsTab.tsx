import React from 'react';
import { Users, UserPlus, FileText, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

const LeadAnalyticsTab = ({ data }: { data: any }) => {
  const { leadAnalytics } = data;

  const funnelData = [
    { name: 'Total Leads', count: leadAnalytics.totalNewLeads },
    { name: 'Contacted', count: leadAnalytics.totalContacted },
    { name: 'Quoted', count: leadAnalytics.totalQuoted },
    { name: 'Converted', count: leadAnalytics.totalConverted },
    { name: 'Completed', count: leadAnalytics.totalCompleted },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-100 dark:border-zinc-800">
          <p className="text-sm text-gray-500">Received Today</p>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{leadAnalytics.receivedToday}</h4>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-100 dark:border-zinc-800">
          <p className="text-sm text-gray-500">This Week</p>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{leadAnalytics.receivedThisWeek}</h4>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-100 dark:border-zinc-800">
          <p className="text-sm text-gray-500">This Month</p>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{leadAnalytics.receivedThisMonth}</h4>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-100 dark:border-zinc-800">
          <p className="text-sm text-gray-500">This Year</p>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{leadAnalytics.receivedThisYear}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Lead Conversion Funnel</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#3f3f46" opacity={0.2} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 12}} width={100} />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', backgroundColor: '#18181b', border: 'none', color: '#fff' }} />
                <Bar dataKey="count" name="Leads" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === funnelData.length - 1 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Key Lead Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800">
                <span className="text-gray-500">Conversion Rate</span>
                <span className="font-bold text-emerald-500">{leadAnalytics.conversionRate}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800">
                <span className="text-gray-500">Drop Percentage</span>
                <span className="font-bold text-rose-500">{leadAnalytics.dropRate}%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800">
                <span className="text-gray-500">Skipped Quotation</span>
                <span className="font-bold text-amber-500">{leadAnalytics.withoutQuotation}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Top Source</span>
                <span className="font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded text-xs">{leadAnalytics.mostActiveSource}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
             <div className="flex items-center text-sm text-gray-500">
                <Users size={16} className="mr-2" />
                Total Database: {leadAnalytics.totalNewLeads} Leads
             </div>
          </div>
        </div>
      </div>

      {/* Product Popularity & Demand Analysis */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Product Popularity & Demand</h3>
        {leadAnalytics.productAnalytics && leadAnalytics.productAnalytics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leadAnalytics.productAnalytics.map((product: any, index: number) => {
              const maxVal = Math.max(...leadAnalytics.productAnalytics.map((p: any) => p.value));
              const percentage = maxVal > 0 ? (product.value / maxVal) * 100 : 0;
              return (
                <div key={index} className="bg-gray-50 dark:bg-zinc-950 p-4 border border-gray-100 dark:border-zinc-800/50 rounded-xl hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-900 dark:text-white text-sm truncate pr-2">{product.name}</span>
                    <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/40 rounded-full text-[10px] font-bold shrink-0">
                      {product.value} Inquir{product.value !== 1 ? 'ies' : 'y'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full transition-all duration-1000 animate-pulse"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 italic">No product popularity data available yet.</div>
        )}
      </div>
    </div>
  );
};

export default LeadAnalyticsTab;
