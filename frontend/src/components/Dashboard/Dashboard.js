// frontend/src/components/Dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format, subDays } from 'date-fns';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, revenueRes] = await Promise.all([
        dashboardAPI.getDailySummary(),
        dashboardAPI.getRevenueChart(timeRange)
      ]);
      
      setSummary(summaryRes.data);
      setRevenueData(revenueRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-orange-500 text-sm font-medium">Loading</span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate percentage for progress bars
  const completedPercentage = summary?.totalOrders > 0 
    ? ((summary.completedOrders / summary.totalOrders) * 100).toFixed(1) 
    : 0;

  const paidPercentage = summary?.totalOrders > 0
    ? ((summary.paidOrders / summary.totalOrders) * 100).toFixed(1)
    : 0;

  const maxRevenue = revenueData?.revenues ? Math.max(...revenueData.revenues, 1) : 1;
  const totalRevenuePeriod = revenueData?.totalRevenue || 0;
  const avgDailyRevenue = revenueData?.revenues?.length > 0 
    ? (totalRevenuePeriod / revenueData.revenues.length).toFixed(2) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header with gradient */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          
          {/* Time range selector */}
          <div className="mt-4 md:mt-0 flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            {[7, 30, 90].map(days => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === days
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : 'text-gray-600 hover:bg-orange-50'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Orders Card */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl group-hover:bg-orange-100 transition-colors">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                Today
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{summary?.totalOrders || 0}</h3>
            <p className="text-gray-500 text-sm">Total Orders</p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-green-500 bg-green-50 px-2 py-1 rounded-full">+{summary?.totalOrders || 0} today</span>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
        </div>

        {/* Completed Orders Card */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded-full">
                {completedPercentage}%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{summary?.completedOrders || 0}</h3>
            <p className="text-gray-500 text-sm">Completed Orders</p>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${completedPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-green-400 to-green-600"></div>
        </div>

        {/* Paid Orders Card */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
                ₹{summary?.totalRevenue?.toFixed(2) || '0'}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{summary?.paidOrders || 0}</h3>
            <p className="text-gray-500 text-sm">Paid Orders</p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-blue-500 bg-blue-50 px-2 py-1 rounded-full">{paidPercentage}% of total</span>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
        </div>

        {/* Pending Payment Card */}
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 rounded-xl group-hover:bg-yellow-100 transition-colors">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                Pending
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{summary?.pendingPaymentOrders || 0}</h3>
            <p className="text-gray-500 text-sm">Pending Payment</p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                ₹{(summary?.pendingPaymentOrders * (summary?.totalRevenue / summary?.paidOrders || 0)).toFixed(2) || '0'}
              </span>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
        </div>
      </div>

      {/* Revenue and Recent Orders Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Overview - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
              <p className="text-sm text-gray-500">Last {timeRange} days performance</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-orange-500">₹{totalRevenuePeriod.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 flex items-end justify-between gap-2 mb-4">
            {revenueData?.dates.map((date, index) => {
              const height = (revenueData.revenues[index] / maxRevenue) * 180;
              const isHighest = revenueData.revenues[index] === maxRevenue;
              
              return (
                <div key={date} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full flex justify-center">
                    {revenueData.revenues[index] > 0 && (
                      <span className="absolute -top-6 text-xs font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 px-2 py-1 rounded">
                        ₹{revenueData.revenues[index]}
                      </span>
                    )}
                    <div 
                      className={`w-full mx-1 rounded-t-lg transition-all duration-300 group-hover:opacity-80 ${
                        isHighest ? 'bg-gradient-to-t from-orange-500 to-orange-300' : 'bg-gradient-to-t from-orange-400 to-orange-200'
                      }`}
                      style={{ height: `${Math.max(height, 4)}px` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2 rotate-45 origin-top-left">
                    {format(new Date(date), 'dd MMM')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">{revenueData?.paidOrders?.reduce((a, b) => a + b, 0) || 0}</p>
              <p className="text-xs text-gray-500">Total Paid Orders</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">₹{avgDailyRevenue}</p>
              <p className="text-xs text-gray-500">Avg. Daily Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">
                {revenueData?.revenues?.filter(r => r > 0).length || 0}/{timeRange}
              </p>
              <p className="text-xs text-gray-500">Days with Revenue</p>
            </div>
          </div>
        </div>

        {/* Recent Orders - Takes 1 column */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
            <span className="text-xs text-gray-500">Today</span>
          </div>
          
          <div className="space-y-4">
            {summary?.orders?.slice(0, 5).map((order, index) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg
                    ${order.paymentStatus === 'paid' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    {order.paymentStatus === 'paid' ? '💰' : '⏱️'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{format(new Date(order.createdAt), 'hh:mm a')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-500">₹{order.totalAmount}</p>
                  <p className={`text-xs font-medium ${
                    order.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                  </p>
                </div>
              </div>
            ))}
            
            {(!summary?.orders || summary.orders.length === 0) && (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-400">No orders today</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Total Revenue Today</p>
                <p className="text-xl font-bold text-orange-500">₹{summary?.totalRevenue?.toFixed(2) || '0'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-xl font-bold text-green-500">{summary?.completedOrders || 0}/{summary?.totalOrders || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Card */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-orange-100 text-sm">Average Order Value</p>
            <p className="text-2xl font-bold">
              ₹{(summary?.totalRevenue / (summary?.paidOrders || 1)).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-orange-100 text-sm">Peak Hour</p>
            <p className="text-2xl font-bold">
              {new Date().getHours()}:00
            </p>
          </div>
          <div>
            <p className="text-orange-100 text-sm">Conversion Rate</p>
            <p className="text-2xl font-bold">
              {((summary?.paidOrders / (summary?.totalOrders || 1)) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-orange-100 text-sm">Pending Value</p>
            <p className="text-2xl font-bold">
              ₹{(summary?.pendingPaymentOrders * (summary?.totalRevenue / (summary?.paidOrders || 1))).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;