import React from 'react';
import { format } from 'date-fns';

const OrderStatus = ({ order, onStatusChange, onViewDetails }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'completed': return '✅';
      case 'cancelled': return '❌';
      default: return '📝';
    }
  };

  const getProgressWidth = (status) => {
    switch(status) {
      case 'pending': return '25%';
      case 'preparing': return '50%';
      case 'completed': return '100%';
      case 'cancelled': return '100%';
      default: return '0%';
    }
  };

  const getProgressColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500';
      case 'preparing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Pending', icon: '⏳' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'completed', label: 'Completed', icon: '✅' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      {/* Order Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Order #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-500">
            {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
          <span className="mr-1">{getStatusIcon(order.status)}</span>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
      </div>

      {/* Order Items Summary */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Items:</p>
        <div className="space-y-1">
          {order.Menus?.slice(0, 3).map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-600">x{item.OrderItem.quantity}</span>
            </div>
          ))}
          {order.Menus?.length > 3 && (
            <p className="text-xs text-gray-500">+{order.Menus.length - 3} more items</p>
          )}
        </div>
      </div>

      {/* Order Total */}
      <div className="flex justify-between items-center mb-4 pt-2 border-t border-gray-100">
        <span className="font-semibold text-gray-700">Total Amount:</span>
        <span className="text-xl font-bold text-orange-500">₹{order.totalAmount}</span>
      </div>

      {/* Progress Bar */}
      {order.status !== 'cancelled' && (
        <div className="mb-4">
          <div className="flex justify-between mb-1 text-xs text-gray-600">
            <span>Pending</span>
            <span>Preparing</span>
            <span>Completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getProgressColor(order.status)} transition-all duration-500`}
              style={{ width: getProgressWidth(order.status) }}
            ></div>
          </div>
        </div>
      )}

      {/* Status Steps (Alternative visual) */}
      {order.status !== 'cancelled' && (
        <div className="flex items-center justify-between mb-4">
          {statusSteps.map((step, index) => (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-lg
                  ${order.status === step.key ? 'bg-orange-500 text-white' : 
                    (statusSteps.findIndex(s => s.key === order.status) >= index ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500')}
                `}>
                  {step.icon}
                </div>
                <span className="text-xs mt-1 text-gray-600">{step.label}</span>
              </div>
              {index < statusSteps.length - 1 && (
                <div className={`
                  flex-1 h-1 mx-2
                  ${statusSteps.findIndex(s => s.key === order.status) > index ? 'bg-green-500' : 'bg-gray-200'}
                `}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Cancelled Message */}
      {order.status === 'cancelled' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm flex items-center">
            <span className="mr-2">❌</span>
            This order has been cancelled
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onStatusChange && order.status !== 'cancelled' && order.status !== 'completed' && (
          <select
            value={order.status}
            onChange={(e) => onStatusChange(order.id, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="pending">⏳ Pending</option>
            <option value="preparing">👨‍🍳 Preparing</option>
            <option value="completed">✅ Completed</option>
            <option value="cancelled">❌ Cancelled</option>
          </select>
        )}
        <button
          onClick={() => onViewDetails(order)}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          View Details
        </button>
      </div>

      {/* Payment Status Badge */}
      <div className="mt-3 text-right">
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
          ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
        `}>
          {order.paymentStatus === 'paid' ? '💰 Paid' : '⏱️ Payment Pending'}
        </span>
      </div>
    </div>
  );
};

// Order Status Timeline Component (Optional - for detailed view)
export const OrderTimeline = ({ order }) => {
  const events = [
    { status: 'Order Placed', time: order.createdAt, icon: '📝' },
    { status: 'Payment', time: order.paymentStatus === 'paid' ? order.updatedAt : null, icon: '💰' },
    { status: 'Preparing', time: order.status === 'preparing' ? order.updatedAt : null, icon: '👨‍🍳' },
    { status: 'Completed', time: order.status === 'completed' ? order.updatedAt : null, icon: '✅' },
  ];

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, index) => (
          <li key={index}>
            <div className="relative pb-8">
              {index < events.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                ></span>
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`
                    h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white
                    ${event.time ? 'bg-green-500' : 'bg-gray-300'}
                  `}>
                    <span className="text-white text-sm">{event.icon}</span>
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className={`text-sm ${event.time ? 'text-gray-900' : 'text-gray-400'}`}>
                      {event.status}
                    </p>
                  </div>
                  {event.time && (
                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                      {format(new Date(event.time), 'hh:mm a')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderStatus;