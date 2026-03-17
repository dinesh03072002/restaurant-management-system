import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Invoice from '../Billing/Invoice';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const updatePaymentStatus = async (orderId, currentStatus) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    
    try {
      await orderAPI.updatePaymentStatus(orderId, newStatus);
      toast.success(`Payment status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' 
      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
  };

  const getPaymentStatusIcon = (status) => {
    return status === 'paid' ? '💰' : '⏱️';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Orders Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search order number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          />
          
          <div className="flex gap-3">
            <div className="text-sm bg-white px-4 py-2 rounded-lg shadow whitespace-nowrap">
              <span className="text-gray-600">Total: </span>
              <span className="font-bold text-orange-600">{orders.length}</span>
            </div>
            <div className="text-sm bg-white px-4 py-2 rounded-lg shadow whitespace-nowrap">
              <span className="text-gray-600">Paid: </span>
              <span className="font-bold text-green-600">
                {orders.filter(o => o.paymentStatus === 'paid').length}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      {order.menus?.map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-400">×</span>
                          <span className="text-orange-600 font-medium">{item.OrderItem?.quantity || 1}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-orange-600">₹{parseFloat(order.totalAmount).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-orange-500 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="preparing">👨‍🍳 Preparing</option>
                      <option value="completed">✅ Completed</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => updatePaymentStatus(order.id, order.paymentStatus)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-1 transition-all ${getPaymentStatusColor(order.paymentStatus)}`}
                    >
                      <span>{getPaymentStatusIcon(order.paymentStatus)}</span>
                      <span>{order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowInvoice(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Bill
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-bold text-gray-900">{order.orderNumber}</span>
                <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
              </div>
              <span className="font-bold text-orange-600">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Items:</p>
              <div className="flex flex-wrap gap-2">
                {order.menus?.map(item => (
                  <span key={item.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {item.name} × {item.OrderItem?.quantity || 1}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-orange-500 ${getStatusColor(order.status)}`}
              >
                <option value="pending">⏳ Pending</option>
                <option value="preparing">👨‍🍳 Preparing</option>
                <option value="completed">✅ Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
              
              <div className="flex gap-2">
                <button
                  onClick={() => updatePaymentStatus(order.id, order.paymentStatus)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border flex items-center justify-center gap-1 transition-all ${getPaymentStatusColor(order.paymentStatus)}`}
                >
                  <span>{getPaymentStatusIcon(order.paymentStatus)}</span>
                  <span>{order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>
                </button>
                
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowInvoice(true);
                  }}
                  className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Bill
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Invoice Modal */}
      {showInvoice && selectedOrder && (
        <Invoice
          order={selectedOrder}
          onClose={() => {
            setShowInvoice(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
};

export default OrderList;