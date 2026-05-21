import React from 'react';
import { Award, Users, Star, Activity } from 'lucide-react';

const CustomerInsightsTab = ({ data }: { data: any }) => {
  const { customerInsights } = data;

  const insights = [
    { 
      title: 'Most Valuable Customer', 
      value: customerInsights.mostValuable.name, 
      subValue: `₹${customerInsights.mostValuable.revenue.toLocaleString('en-IN')} LTV`,
      icon: <Award size={24} />, 
      color: 'text-amber-600', 
      bg: 'bg-amber-100' 
    },
    { 
      title: 'Highest Paying Customer', 
      value: customerInsights.highestPaying.name, 
      subValue: `₹${customerInsights.highestPaying.revenue.toLocaleString('en-IN')}`,
      icon: <DollarSign size={24} />, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100' 
    },
    { 
      title: 'Most Active Customer', 
      value: customerInsights.mostActive.name, 
      subValue: `${customerInsights.mostActive.projects} Projects`,
      icon: <Activity size={24} />, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      title: 'Repeat Customers', 
      value: customerInsights.repeatCustomers, 
      subValue: `Customers with >1 bookings`,
      icon: <Users size={24} />, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-100' 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{insight.title}</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 truncate max-w-[150px]">{insight.value}</h3>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mt-1">{insight.subValue}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${insight.bg} ${insight.color} dark:bg-opacity-20 flex-shrink-0`}>
              {insight.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 text-center mt-8">
        <Star size={48} className="mx-auto text-amber-500 mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Relationship Management</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto">
          You currently have <strong>{customerInsights.repeatCustomers}</strong> repeat customers. Cultivating long-term relationships is key to steady cash flow. Consider sending a thank-you note or a discount code for future shoots to your Most Valuable Customer, <strong>{customerInsights.mostValuable.name}</strong>.
        </p>
      </div>
    </div>
  );
};

// Fix missing import
import { DollarSign } from 'lucide-react';

export default CustomerInsightsTab;
