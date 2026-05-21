import React from 'react';
import { CreditCard, AlertCircle, Clock } from 'lucide-react';

const PaymentAnalyticsTab = ({ data }: { data: any }) => {
  const { paymentAnalytics } = data;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue Received</p>
          <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-500 mt-1">₹{paymentAnalytics.totalRevenue.toLocaleString('en-IN')}</h4>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-rose-100 dark:border-rose-900/30 shadow-sm">
          <p className="text-sm text-gray-500">Total Pending Payment</p>
          <h4 className="text-xl font-bold text-rose-600 dark:text-rose-500 mt-1">₹{paymentAnalytics.totalPending.toLocaleString('en-IN')}</h4>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-100 dark:border-zinc-800 shadow-sm">
          <p className="text-sm text-gray-500">Advance Collected</p>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">₹{paymentAnalytics.advanceCollected.toLocaleString('en-IN')}</h4>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-100 dark:border-zinc-800 shadow-sm">
          <p className="text-sm text-gray-500">Final Payments Collected</p>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mt-1">₹{paymentAnalytics.finalCollected.toLocaleString('en-IN')}</h4>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
              <AlertCircle className="mr-2 text-amber-500" size={20} /> Top Pending Payments
            </h3>
            <p className="text-sm text-gray-500 mt-1">Customers with highest outstanding balances</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-950/50 border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Customer Name</th>
                <th className="p-4 font-medium">Booking ID</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Total Amount</th>
                <th className="p-4 font-medium text-right">Paid Amount</th>
                <th className="p-4 font-medium text-right text-rose-500">Pending</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {paymentAnalytics.topPendingPayments.length > 0 ? (
                paymentAnalytics.topPendingPayments.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="p-4 font-medium text-gray-900 dark:text-white">{p.customerName}</td>
                    <td className="p-4 text-sm text-gray-500">{p.bookingId}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-900 dark:text-gray-300">₹{p.total.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right text-emerald-600 dark:text-emerald-500">₹{p.paid.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right font-bold text-rose-600 dark:text-rose-400">₹{p.pending.toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <CheckCircle size={32} className="mx-auto mb-3 opacity-20 text-emerald-500" />
                    <p>No pending payments! All accounts are settled.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Need CheckCircle import
import { CheckCircle } from 'lucide-react';

export default PaymentAnalyticsTab;
