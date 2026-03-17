// frontend/src/components/Orders/OrderList.js
import React, { useState, useEffect } from 'react';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Invoice from '../Billing/Invoice';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    fetchOrders();
    // Refresh orders every 30 seconds
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
      // You'll need to create this endpoint in your backend
      await orderAPI.updatePaymentStatus(orderId, newStatus);
      toast.success(`Payment status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' 
      ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Orders Management</h2>
        <div className="flex gap-4">
          <div className="text-sm bg-white px-4 py-2 rounded-lg shadow">
            <span className="text-gray-600">Total Orders: </span>
            <span className="font-bold text-orange-600">{orders.length}</span>
          </div>
          <div className="text-sm bg-white px-4 py-2 rounded-lg shadow">
            <span className="text-gray-600">Paid: </span>
            <span className="font-bold text-green-600">
              {orders.filter(o => o.paymentStatus === 'paid').length}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      {order.menus?.map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-400">×</span>
                          <span className="text-orange-600 font-medium">
                            {item.OrderItem?.quantity || 1}
                          </span>
                        </div>
                      ))}
                      {(!order.menus || order.menus.length === 0) && (
                        <span className="text-gray-400">No items</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-orange-600 text-lg">
                      ₹{parseFloat(order.totalAmount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-orange-500 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending" className="bg-yellow-50">⏳ Pending</option>
                      <option value="preparing" className="bg-blue-50">👨‍🍳 Preparing</option>
                      <option value="completed" className="bg-green-50">✅ Completed</option>
                      <option value="cancelled" className="bg-red-50">❌ Cancelled</option>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowInvoice(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
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