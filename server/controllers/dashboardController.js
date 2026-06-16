const Booking = require('../models/Booking');
const Lead = require('../models/Lead');
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const Quotation = require('../models/Quotation');

// @desc    Get dashboard analytics
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    let isDateFiltered = false;
    if (startDate && endDate) {
      isDateFiltered = true;
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Numeric Metrics
    const totalLeads = await Lead.countDocuments(dateFilter);
    const newLeads = await Lead.countDocuments({ ...dateFilter, status: 'New' });
    const totalContactUs = await Contact.countDocuments(dateFilter);
    const newContactUs = await Contact.countDocuments({ ...dateFilter, status: 'New' });
    const totalSubscribers = await Newsletter.countDocuments(dateFilter);
    const activeSubscribers = await Newsletter.countDocuments({ ...dateFilter, status: 'Active' });
    
    // Quotations
    const quotationsSent = await Quotation.countDocuments({ ...dateFilter, status: 'Sent' });
    const quotationsApproved = await Quotation.countDocuments({ ...dateFilter, status: 'Approved' });
    const wonDeals = await Lead.countDocuments({ ...dateFilter, status: 'Won' });

    // Calculate revenue from approved quotations
    const approvedQuotations = await Quotation.find({ ...dateFilter, status: 'Approved' });
    const revenue = approvedQuotations.reduce((sum, q) => sum + (q.total || 0), 0);

    // Existing collections
    const leadsToday = await Lead.countDocuments({ createdAt: { $gte: today } });
    const leadsThisWeek = await Lead.countDocuments({ createdAt: { $gte: startOfWeek } });
    const leadsThisMonth = await Lead.countDocuments({ createdAt: { $gte: startOfMonth } });
    const leadsThisYear = await Lead.countDocuments({ createdAt: { $gte: startOfYear } });
    
    const leads = await Lead.find(dateFilter);
    const expenses = await Expense.find(dateFilter ? {
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    } : {});
    const allBookings = await Booking.find().populate('lead');
    
    // Lead Analytics
    const totalNewLeads = leads.length;
    let contactedCount = 0;
    let quotedCount = 0;
    let convertedCount = 0;
    let completedCount = 0;
    let withoutQuotationCount = 0;
    const sourceMap = {};

    leads.forEach(l => {
      if (['Contacted', 'Quotation Sent', 'Negotiation', 'Won', 'Lost'].includes(l.status)) contactedCount++;
      if (['Quotation Sent', 'Negotiation', 'Won'].includes(l.status)) quotedCount++;
      if (l.status === 'Won') convertedCount++;
      if (l.quotationSkipped) withoutQuotationCount++;
      
      const s = l.source || 'Unknown';
      sourceMap[s] = (sourceMap[s] || 0) + 1;
    });

    const conversionRate = totalNewLeads > 0 ? Math.round((convertedCount / totalNewLeads) * 100) : 0;
    const dropRate = 100 - conversionRate;
    
    let mostActiveSource = 'Unknown';
    let maxSourceCount = 0;
    Object.keys(sourceMap).forEach(key => {
      if (sourceMap[key] > maxSourceCount) {
        maxSourceCount = sourceMap[key];
        mostActiveSource = key;
      }
    });

    // Booking Analytics
    const filteredBookings = isDateFiltered 
      ? allBookings.filter(b => b.createdAt >= new Date(startDate) && b.createdAt <= new Date(endDate))
      : allBookings;

    const totalBookings = filteredBookings.length;
    const activeBookings = filteredBookings.filter(b => b.status === 'Active');
    const pendingBookings = activeBookings.length;
    const completedBookings = filteredBookings.filter(b => b.status === 'Completed').length;
    const cancelledBookings = filteredBookings.filter(b => b.status === 'Cancelled').length;
    const bookingCompletionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
    
    let highestBookingValue = 0;
    let totalBookingValue = 0;
    filteredBookings.forEach(b => {
      if (b.totalAmount > highestBookingValue) highestBookingValue = b.totalAmount;
      totalBookingValue += b.totalAmount;
    });
    const avgBookingValue = totalBookings > 0 ? Math.round(totalBookingValue / totalBookings) : 0;

    // Revenue Trends
    let totalRevenue = revenue;
    let advanceCollected = 0;
    let finalCollected = 0;
    const monthlyDataMap = {};

    allBookings.forEach(booking => {
      booking.payments.forEach((payment, index) => {
        const pDate = new Date(payment.date);
        let inRange = true;
        if (isDateFiltered) {
          inRange = pDate >= new Date(startDate) && pDate <= new Date(endDate);
        }

        if (inRange) {
          if (index === 0) advanceCollected += payment.amount;
          if (payment.isFinal) finalCollected += payment.amount;

          const monthKey = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyDataMap[monthKey]) monthlyDataMap[monthKey] = { name: monthKey, revenue: 0, expenses: 0 };
          monthlyDataMap[monthKey].revenue += payment.amount;
        }
      });
    });

    // Top pending payments
    let totalPendingPayment = 0;
    const pendingList = [];
    allBookings.filter(b => b.status === 'Active').forEach(b => {
      const pending = b.totalAmount - b.paidAmount;
      if (pending > 0) {
        totalPendingPayment += pending;
        pendingList.push({
          bookingId: b.bookingId,
          customerName: b.lead ? b.lead.name : 'Unknown',
          total: b.totalAmount,
          paid: b.paidAmount,
          pending: pending,
          status: b.status
        });
      }
    });

    pendingList.sort((a, b) => b.pending - a.pending);
    const topPendingPayments = pendingList.slice(0, 5);
    const mostPendingCustomer = pendingList.length > 0 ? { name: pendingList[0].customerName, amount: pendingList[0].pending } : null;

    // Expense Analytics
    let totalExpenses = 0;
    const expensesByCategory = {};

    expenses.forEach(exp => {
      totalExpenses += exp.amount;
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
      
      const eDate = new Date(exp.date);
      const monthKey = `${eDate.getFullYear()}-${String(eDate.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyDataMap[monthKey]) monthlyDataMap[monthKey] = { name: monthKey, revenue: 0, expenses: 0 };
      monthlyDataMap[monthKey].expenses += exp.amount;
    });

    const expenseCategoryData = Object.keys(expensesByCategory).map(key => ({
      name: key,
      value: expensesByCategory[key]
    })).sort((a, b) => b.value - a.value);

    // Monthly trends
    const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.name.localeCompare(b.name));
    let highestRevMonth = { name: 'N/A', revenue: 0 };
    let lowestRevMonth = { name: 'N/A', revenue: Infinity };
    
    monthlyData.forEach(m => {
      if (m.revenue > highestRevMonth.revenue) highestRevMonth = m;
      if (m.revenue < lowestRevMonth.revenue && m.revenue > 0) lowestRevMonth = m;
    });
    if (lowestRevMonth.revenue === Infinity) lowestRevMonth.revenue = 0;

    const netProfit = totalRevenue - totalExpenses;

    // Customer Insights
    const customerStats = {};
    allBookings.forEach(b => {
      if (b.lead) {
        const id = b.lead._id.toString();
        if (!customerStats[id]) {
          customerStats[id] = { name: b.lead.name, revenue: 0, bookingsCount: 0 };
        }
        customerStats[id].revenue += b.paidAmount;
        customerStats[id].bookingsCount += 1;
      }
    });

    let mostValuable = { name: 'N/A', revenue: 0 };
    let mostActiveCust = { name: 'N/A', projects: 0 };
    let repeatCount = 0;

    Object.values(customerStats).forEach(c => {
      if (c.revenue > mostValuable.revenue) mostValuable = c;
      if (c.bookingsCount > mostActiveCust.projects) mostActiveCust = { name: c.name, projects: c.bookingsCount };
      if (c.bookingsCount > 1) repeatCount++;
    });

    const upcomingDeliveriesCount = allBookings.filter(b => 
      b.status === 'Active' && 
      b.deliveryDate && 
      new Date(b.deliveryDate) >= today
    ).length;

    // Products interest
    const productMap = {};
    leads.forEach(l => {
      const p = l.productName || 'General Service';
      productMap[p] = (productMap[p] || 0) + 1;
    });
    const productAnalyticsData = Object.keys(productMap).map(key => ({
      name: key,
      value: productMap[key]
    })).sort((a, b) => b.value - a.value);

    const lowStockCount = await Product.countDocuments({
      $expr: {
        $lte: ['$inventory.availableStock', '$inventory.lowStockThreshold']
      }
    });

    // ----------------------------------------------------
    // CHARTS DATA
    // ----------------------------------------------------
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Leads by Month
    const leadsHistory = await Lead.find({ createdAt: { $gte: sixMonthsAgo } });
    const leadsByMonthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      leadsByMonthMap[monthKey] = 0;
    }
    leadsHistory.forEach(l => {
      const monthKey = new Date(l.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (leadsByMonthMap[monthKey] !== undefined) {
        leadsByMonthMap[monthKey]++;
      }
    });
    const leadsByMonth = Object.keys(leadsByMonthMap).map(key => ({
      month: key,
      count: leadsByMonthMap[key]
    }));

    // Revenue Analytics Chart (by Month)
    const quotationsHistory = await Quotation.find({ createdAt: { $gte: sixMonthsAgo }, status: 'Approved' });
    const revenueByMonthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      revenueByMonthMap[monthKey] = 0;
    }
    quotationsHistory.forEach(q => {
      const monthKey = new Date(q.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (revenueByMonthMap[monthKey] !== undefined) {
        revenueByMonthMap[monthKey] += q.total || 0;
      }
    });
    const revenueByMonth = Object.keys(revenueByMonthMap).map(key => ({
      month: key,
      revenue: revenueByMonthMap[key]
    }));

    // Lead Status Distribution
    const statusCounts = {
      'New': await Lead.countDocuments({ status: 'New' }),
      'Contacted': await Lead.countDocuments({ status: 'Contacted' }),
      'Quotation Sent': await Lead.countDocuments({ status: 'Quotation Sent' }),
      'Negotiation': await Lead.countDocuments({ status: 'Negotiation' }),
      'Won': await Lead.countDocuments({ status: 'Won' }),
      'Lost': await Lead.countDocuments({ status: 'Lost' })
    };
    const leadStatusDistribution = Object.keys(statusCounts).map(key => ({
      status: key,
      count: statusCounts[key]
    }));

    res.json({
      metrics: {
        totalLeads,
        newLeads,
        totalContactUs,
        newContactUs,
        totalSubscribers,
        activeSubscribers,
        quotationsSent,
        quotationsApproved,
        wonDeals,
        revenue
      },
      charts: {
        leadsByMonth,
        leadsByProduct: productAnalyticsData,
        leadStatusDistribution,
        revenueByMonth
      },
      overview: {
        totalRevenue: revenue,
        totalExpenses,
        netProfit: revenue - totalExpenses,
        conversionRate,
        activeBookings: pendingBookings,
        lowStockCount
      },
      leadAnalytics: {
        totalNewLeads,
        receivedToday: leadsToday,
        receivedThisWeek: leadsThisWeek,
        receivedThisMonth: leadsThisMonth,
        receivedThisYear: leadsThisYear,
        totalContacted: contactedCount,
        totalQuoted: quotedCount,
        totalConverted: convertedCount,
        totalCompleted: completedCount,
        conversionRate,
        dropRate,
        withoutQuotation: withoutQuotationCount,
        mostActiveSource,
        productAnalytics: productAnalyticsData
      },
      bookingAnalytics: {
        total: totalBookings,
        active: activeBookings.length,
        pending: pendingBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        upcomingDeliveries: upcomingDeliveriesCount,
        completionRate: bookingCompletionRate,
        highestValue: highestBookingValue,
        averageValue: avgBookingValue
      },
      productAnalytics: productAnalyticsData,
      paymentAnalytics: {
        totalRevenue,
        totalPending: totalPendingPayment,
        advanceCollected,
        finalCollected,
        remainingBalances: totalPendingPayment,
        mostPendingCustomer,
        topPendingPayments
      },
      revenueAnalytics: {
        totalRevenue,
        totalExpenses,
        netProfit,
        monthlyTrends: monthlyData,
        highestRevenueMonth: highestRevMonth.name !== 'N/A' ? `${highestRevMonth.name} (₹${highestRevMonth.revenue})` : 'N/A',
        lowestRevenueMonth: lowestRevMonth.name !== 'N/A' ? `${lowestRevMonth.name} (₹${lowestRevMonth.revenue})` : 'N/A'
      },
      expenseAnalytics: {
        totalExpenses,
        expenseCategoryData
      },
      customerInsights: {
        mostValuable: { name: mostValuable.name, revenue: mostValuable.revenue },
        highestPaying: { name: mostValuable.name, revenue: mostValuable.revenue },
        repeatCustomers: repeatCount,
        mostActive: mostActiveCust
      }
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getCustomersList = async (req, res, next) => {
  try {
    const leads = await Lead.find({}).lean();
    const bookings = await Booking.find({}).lean();
    const quotations = await Quotation.find({}).lean();

    const customersMap = {};

    leads.forEach(l => {
      const key = (l.phone || l.email || l._id.toString()).trim().toLowerCase();
      if (!customersMap[key]) {
        customersMap[key] = {
          name: l.name,
          phone: l.phone,
          email: l.email || 'N/A',
          location: l.location || 'N/A',
          leadsCount: 0,
          quotesCount: 0,
          bookingsCount: 0,
          totalPaid: 0,
          totalBooked: 0,
          latestStage: l.stage,
          createdAt: l.createdAt
        };
      } else {
        if (new Date(l.createdAt) > new Date(customersMap[key].createdAt)) {
          customersMap[key].latestStage = l.stage;
          customersMap[key].createdAt = l.createdAt;
        }
      }
      customersMap[key].leadsCount += 1;
    });

    quotations.forEach(q => {
      if (q.leadId) {
        const lead = leads.find(l => l._id.toString() === q.leadId.toString());
        if (lead) {
          const key = (lead.phone || lead.email || lead._id.toString()).trim().toLowerCase();
          if (customersMap[key]) {
            customersMap[key].quotesCount += 1;
          }
        }
      }
    });

    bookings.forEach(b => {
      let lead = null;
      if (b.lead) {
        lead = leads.find(l => l._id.toString() === b.lead.toString());
      }
      if (lead) {
        const key = (lead.phone || lead.email || lead._id.toString()).trim().toLowerCase();
        if (customersMap[key]) {
          customersMap[key].bookingsCount += 1;
          customersMap[key].totalPaid += b.paidAmount || 0;
          customersMap[key].totalBooked += b.totalAmount || 0;
        }
      }
    });

    const customersList = Object.values(customersMap).sort((a, b) => b.totalBooked - a.totalBooked);
    res.json(customersList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardData,
  getCustomersList
};
