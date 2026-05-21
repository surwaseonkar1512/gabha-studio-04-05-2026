import React from 'react';
import { DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

const ExpenseAnalyticsTab = ({ data }: { data: any }) => {
  const { expenseAnalytics } = data;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-zinc-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">{payload[0].name}</p>
          <p style={{ color: payload[0].payload.fill }} className="text-sm font-medium">
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 flex items-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mr-6">
          <DollarSign size={32} />
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Total Tracked Expenses</p>
          <h3 className="text-4xl font-bold text-gray-900 dark:text-white mt-1">₹{expenseAnalytics.totalExpenses.toLocaleString('en-IN')}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <PieChartIcon className="mr-2 text-indigo-500" /> Expense Breakdown by Category
          </h3>
          <div className="h-[350px] w-full">
            {expenseAnalytics.expenseCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseAnalytics.expenseCategoryData}
                    cx="50%" cy="50%"
                    innerRadius={70} outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseAnalytics.expenseCategoryData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '13px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">No expense data available.</div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Expense Categories</h3>
          <div className="space-y-4">
            {expenseAnalytics.expenseCategoryData.length > 0 ? (
              expenseAnalytics.expenseCategoryData.map((cat: any, i: number) => (
                <div key={i} className="flex flex-col">
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">₹{cat.value.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((cat.value / expenseAnalytics.totalExpenses) * 100, 100)}%`,
                        backgroundColor: COLORS[i % COLORS.length]
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No expenses recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseAnalyticsTab;
