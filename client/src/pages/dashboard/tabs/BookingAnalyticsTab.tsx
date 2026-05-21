import React from 'react';
import { Calendar, CheckSquare, Clock, XSquare, Activity } from 'lucide-react';

const BookingAnalyticsTab = ({ data }: { data: any }) => {
  const { bookingAnalytics } = data;

  const stats = [
    { title: 'Total Bookings', value: bookingAnalytics.total, icon: <Calendar size={24} />, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Active Bookings', value: bookingAnalytics.active, icon: <Activity size={24} />, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Completed Bookings', value: bookingAnalytics.completed, icon: <CheckSquare size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Cancelled Bookings', value: bookingAnalytics.cancelled, icon: <XSquare size={24} />, color: 'text-rose-600', bg: 'bg-rose-100' },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Booking Value Insights</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-gray-500">Average Booking Value</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">₹{bookingAnalytics.averageValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm text-gray-500">Highest Booking Value</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">₹{bookingAnalytics.highestValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Operational Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-gray-500">Completion Rate</span>
              <span className="font-bold text-emerald-500">{bookingAnalytics.completionRate}%</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800">
              <span className="text-gray-500">Pending Deliveries</span>
              <span className="font-bold text-amber-500">{bookingAnalytics.pending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Upcoming Deliveries (Scheduled)</span>
              <span className="font-bold text-blue-500">{bookingAnalytics.upcomingDeliveries}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingAnalyticsTab;
