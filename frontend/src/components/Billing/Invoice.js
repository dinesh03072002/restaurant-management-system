import React, { useRef } from 'react';
import { format } from 'date-fns';

const Invoice = ({ order, onClose }) => {
  const invoiceRef = useRef(null);

  const calculateSubtotal = () => {
    if (!order.menus || order.menus.length === 0) return 0;
    return order.menus.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * (item.OrderItem?.quantity || 1));
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to print');
      return;
    }

    const restaurantName = order.restaurantName || 'Restaurant Name';
    const restaurantAddress = order.restaurantAddress || '123 Main Street, City';
    const restaurantPhone = order.restaurantPhone || '+91 9876543210';
    const restaurantGST = order.restaurantGST || '22AAAAA0000A1Z5';

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.orderNumber}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
            .invoice-container { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px dashed #ccc; padding-bottom: 15px; }
            .restaurant-name { font-size: 20px; font-weight: bold; color: #333; margin: 0; }
            .restaurant-details { color: #666; margin: 3px 0; font-size: 12px; }
            .invoice-title { font-size: 18px; color: #ff6b6b; margin-top: 10px; }
            .invoice-info { background: #f5f5f5; padding: 10px; border-radius: 5px; margin-bottom: 15px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-label { color: #666; font-size: 12px; }
            .info-value { font-weight: bold; color: #333; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 13px; }
            th { background: #333; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #ddd; }
            .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .summary-row { display: flex; justify-content: space-between; margin: 5px 0; font-size: 13px; }
            .total { font-size: 16px; font-weight: bold; border-top: 2px solid #333; padding-top: 8px; margin-top: 8px; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; }
            .status-badge { display: inline-block; padding: 3px 8px; border-radius: 5px; font-size: 12px; font-weight: bold; }
            .paid { background: #2ecc71; color: white; }
            .pending { background: #f39c12; color: white; }
            @media (max-width: 600px) {
              .info-grid { grid-template-columns: 1fr; }
              table { font-size: 12px; }
              th, td { padding: 5px; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1 class="restaurant-name">🍽️ ${restaurantName}</h1>
              <p class="restaurant-details">${restaurantAddress}</p>
              <p class="restaurant-details">Phone: ${restaurantPhone}</p>
              <p class="restaurant-details">GST: ${restaurantGST}</p>
              <h2 class="invoice-title">TAX INVOICE</h2>
            </div>

            <div class="invoice-info">
              <div class="info-grid">
                <div>
                  <div class="info-label">Invoice No:</div>
                  <div class="info-value">INV-${order.orderNumber}</div>
                </div>
                <div>
                  <div class="info-label">Date:</div>
                  <div class="info-value">${format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</div>
                </div>
                <div>
                  <div class="info-label">Order No:</div>
                  <div class="info-value">${order.orderNumber}</div>
                </div>
                <div>
                  <div class="info-label">Payment Status:</div>
                  <div class="info-value">
                    <span class="status-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}">
                      ${order.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.menus?.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.OrderItem?.quantity || 1}</td>
                    <td>₹${parseFloat(item.price).toFixed(2)}</td>
                    <td>₹${(parseFloat(item.price) * (item.OrderItem?.quantity || 1)).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>₹${subtotal.toFixed(2)}</span>
              </div>
              <div class="summary-row">
                <span>Tax (5%):</span>
                <span>₹${tax.toFixed(2)}</span>
              </div>
              <div class="summary-row total">
                <span>Total:</span>
                <span>₹${total.toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              <p>This is a computer generated invoice</p>
              <p>Thank you for dining with us!</p>
              <p style="font-size: 10px; margin-top: 15px;">Powered by Restaurant Management System</p>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const restaurantName = order.restaurantName || 'Restaurant Name';
  const restaurantAddress = order.restaurantAddress || '123 Main Street, City';
  const restaurantPhone = order.restaurantPhone || '+91 9876543210';
  const restaurantGST = order.restaurantGST || '22AAAAA0000A1Z5';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-8" ref={invoiceRef}>
          {/* Header */}
          <div className="text-center mb-4 sm:mb-8 pb-4 sm:pb-6 border-b-2 border-dashed border-gray-300">
            <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">🍽️ {restaurantName}</h2>
            <p className="text-xs sm:text-base text-gray-600">{restaurantAddress}</p>
            <p className="text-xs sm:text-base text-gray-600">Phone: {restaurantPhone}</p>
            <p className="text-xs sm:text-base text-gray-600">GST: {restaurantGST}</p>
            <h3 className="text-lg sm:text-2xl font-bold text-orange-500 mt-2 sm:mt-4">TAX INVOICE</h3>
          </div>

          {/* Invoice Details */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-600">Invoice No:</p>
                <p className="text-sm font-semibold">INV-{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Date:</p>
                <p className="text-sm font-semibold">
                  {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Order No:</p>
                <p className="text-sm font-semibold">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Payment Status:</p>
                <p className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold mt-1 ${
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus === 'paid' ? '💰 PAID' : '⏱️ PENDING'}
                </p>
              </div>
            </div>
          </div>

          {/* Items Table - Responsive */}
          <div className="overflow-x-auto mb-4 sm:mb-6">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-left">Item</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-center">Qty</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-right">Price</th>
                  <th className="py-2 sm:py-3 px-2 sm:px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.menus?.map(item => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-2 sm:py-3 px-2 sm:px-4">{item.name}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">{item.OrderItem?.quantity || 1}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">₹{parseFloat(item.price).toFixed(2)}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-medium">
                      ₹{(parseFloat(item.price) * (item.OrderItem?.quantity || 1)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-base text-gray-600">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-base text-gray-600">
                <span>Tax (5%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base sm:text-xl font-bold pt-2 border-t-2 border-gray-300">
                <span>Total:</span>
                <span className="text-orange-500">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">
            <p>This is a computer generated invoice</p>
            <p>Thank you for dining with us!</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Bill
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;