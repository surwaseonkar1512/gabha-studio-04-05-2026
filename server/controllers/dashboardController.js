const Booking = require('../models/Booking');
const Lead = require('../models/Lead');
const Expense = require('../models/Expense');
const Product = require('../models/Product');
const Quotation = require('../models/Quotation');

// @desc    Get dashboard analytics
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // ----------------------------------------------------
    // DATE FILTERS
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // DB QUERIES (Fetch raw data for in-memory JS processing)
    // ----------------------------------------------------
    // We fetch ALL leads to calculate absolute time metrics easily,
    // or we can run separate count queries. Since datasets might be small, 
    // let's do targeted counts for absolute time metrics to be safe.
    
    // Absolute Time Metrics (Leads)
    const leadsToday = await Lead.countDocuments({ createdAt: { $gte: today } });
    const leadsThisWeek = await Lead.countDocuments({ createdAt: { $gte: startOfWeek } });
    const leadsThisMonth = await Lead.countDocuments({ createdAt: { $gte: startOfMonth } });
    const leadsThisYear = await Lead.countDocuments({ createdAt: { $gte: startOfYear } });
    
    // Filtered Datasets
    const leads = await Lead.find(dateFilter);
    const expenses = await Expense.find(dateFilter ? {
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    } : {});
    // We need all bookings for some customer insights, but let's filter what we can
    const allBookings = await Booking.find().populate('lead');
    
    // ----------------------------------------------------
    // LEAD ANALYTICS
    // ----------------------------------------------------
    const totalNewLeads = leads.length;
    let contactedCount = 0;
    let quotedCount = 0;
    let convertedCount = 0;
    let completedCount = 0;
    let withoutQuotationCount = 0;
    const sourceMap = {};

    leads.forEach(l => {
      if (['Contacted', 'Quote Sent', 'Booking', 'Completed'].includes(l.stage)) contactedCount++;
      if (['Quote Sent', 'Booking', 'Completed'].includes(l.stage)) quotedCount++;
      if (['Booking', 'Completed'].includes(l.stage)) convertedCount++;
      if (l.stage === 'Completed') completedCount++;
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

    // ----------------------------------------------------
    // BOOKING ANALYTICS
    // ----------------------------------------------------
    // Filter bookings based on global date filter (createdAt)
    const filteredBookings = isDateFiltered 
      ? allBookings.filter(b => b.createdAt >= new Date(startDate) && b.createdAt <= new Date(endDate))
      : allBookings;

    const totalBookings = filteredBookings.length;
    const activeBookings = filteredBookings.filter(b => b.status === 'Active');
    const pendingBookings = activeBookings.length; // Same as active for now
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

    // ----------------------------------------------------
    // REVENUE & PAYMENT ANALYTICS
    // ----------------------------------------------------
    let totalRevenue = 0;
    let advanceCollected = 0;
    let finalCollected = 0;
    const monthlyDataMap = {}; // Time series

    allBookings.forEach(booking => {
      booking.payments.forEach((payment, index) => {
        const pDate = new Date(payment.date);
        let inRange = true;
        if (isDateFiltered) {
          inRange = pDate >= new Date(startDate) && pDate <= new Date(endDate);
        }

        if (inRange) {
          totalRevenue += payment.amount;
          if (index === 0) advanceCollected += payment.amount;
          if (payment.isFinal) finalCollected += payment.amount;

          const monthKey = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyDataMap[monthKey]) monthlyDataMap[monthKey] = { name: monthKey, revenue: 0, expenses: 0 };
          monthlyDataMap[monthKey].revenue += payment.amount;
        }
      });
    });

    // Top pending payments (Calculated over ALL active bookings, regardless of date filter)
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

    // Sort pending list by highest pending amount
    pendingList.sort((a, b) => b.pending - a.pending);
    const topPendingPayments = pendingList.slice(0, 5); // Top 5
    const mostPendingCustomer = pendingList.length > 0 ? { name: pendingList[0].customerName, amount: pendingList[0].pending } : null;

    // ----------------------------------------------------
    // EXPENSE ANALYTICS
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // MONTHLY TRENDS (Revenue vs Expenses)
    // ----------------------------------------------------
    const monthlyData = Object.values(monthlyDataMap).sort((a, b) => a.name.localeCompare(b.name));
    let highestRevMonth = { name: 'N/A', revenue: 0 };
    let lowestRevMonth = { name: 'N/A', revenue: Infinity };
    
    monthlyData.forEach(m => {
      if (m.revenue > highestRevMonth.revenue) highestRevMonth = m;
      if (m.revenue < lowestRevMonth.revenue && m.revenue > 0) lowestRevMonth = m;
    });
    if (lowestRevMonth.revenue === Infinity) lowestRevMonth.revenue = 0;

    const netProfit = totalRevenue - totalExpenses;

    // ----------------------------------------------------
    // CUSTOMER INSIGHTS
    // ----------------------------------------------------
    const customerStats = {}; // Map leadId -> { name, revenue, bookingsCount }
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

    // Calculate upcoming deliveries count
    const upcomingDeliveriesCount = allBookings.filter(b => 
      b.status === 'Active' && 
      b.deliveryDate && 
      new Date(b.deliveryDate) >= today
    ).length;

    // Calculate product interest count (leads by product name)
    const productMap = {};
    leads.forEach(l => {
      const p = l.productName || 'General Service';
      productMap[p] = (productMap[p] || 0) + 1;
    });
    const productAnalyticsData = Object.keys(productMap).map(key => ({
      name: key,
      value: productMap[key]
    })).sort((a, b) => b.value - a.value);

    // Calculate low stock products count
    const lowStockCount = await Product.countDocuments({
      $expr: {
        $lte: ['$inventory.availableStock', '$inventory.lowStockThreshold']
      }
    });

    // ----------------------------------------------------
    // FINAL RESPONSE BUILDER
    // ----------------------------------------------------
    res.json({
      overview: {
        totalRevenue,
        totalExpenses,
        netProfit,
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
        highestPaying: { name: mostValuable.name, revenue: mostValuable.revenue }, // Same as most valuable for now
        repeatCustomers: repeatCount,
        mostActive: mostActiveCust
      }
    });

  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getCustomersList = async (req, res) => {
  try {
    const leads = await Lead.find();
    const bookings = await Booking.find();
    const quotations = await Quotation.find();

    const customers = leads.map(l => {
      // Find related bookings
      const leadBookings = bookings.filter(b => b.lead && b.lead.toString() === l._id.toString());
      // Find related quotations
      const leadQuotations = quotations.filter(q => q.lead && q.lead.toString() === l._id.toString());

      const totalBooked = leadBookings.reduce((sum, b) => sum + b.totalAmount, 0);
      const totalPaid = leadBookings.reduce((sum, b) => sum + b.paidAmount, 0);

      return {
        name: l.name,
        phone: l.phone,
        email: l.email || 'N/A',
        location: l.location || 'N/A',
        leadsCount: 1,
        quotesCount: leadQuotations.length,
        bookingsCount: leadBookings.length,
        totalPaid,
        totalBooked,
        latestStage: l.stage,
        createdAt: l.createdAt
      };
    });

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers list:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardData,
  getCustomersList
};
