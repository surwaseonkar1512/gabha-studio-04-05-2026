import React from 'react';
import { Users, TrendingUp, DollarSign, Calendar } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Total Leads', value: '124', icon: <Users size={24} />, change: '+12%', color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'New Bookings', value: '32', icon: <Calendar size={24} />, change: '+5%', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Revenue', value: '₹2.4L', icon: <TrendingUp size={24} />, change: '+18%', color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Expenses', value: '₹45K', icon: <DollarSign size={24} />, change: '-2%', color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back to Gabha Studio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</h3>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} mt-2 block`}>
                {stat.change} from last month
              </span>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg} ${stat.color} dark:bg-opacity-20`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6 min-h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Leads Pipeline</h3>
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-zinc-600">
            Chart Placeholder (Recharts)
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Tasks</h3>
          <div className="space-y-4">
             {/* Task list placeholder */}
             {[1, 2, 3].map((_, i) => (
               <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-50 dark:border-zinc-800/50 last:border-0">
                 <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                 <div>
                   <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">Follow up with Client {i + 1}</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">Today at 2:00 PM</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
