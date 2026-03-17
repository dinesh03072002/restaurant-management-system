import React, { useState, useEffect } from 'react';
import { menuAPI, orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CreateOrder = ({ onOrderCreated }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.data.filter(item => item.isAvailable));
    } catch (error) {
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (menuItem) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.menuId === menuItem.id);
      if (existing) {
        return prev.map(item =>
          item.menuId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        menuId: menuItem.id,
        name: menuItem.name,
        price: parseFloat(menuItem.price),
        quantity: 1
      }];
    });
  };

  const updateQuantity = (menuId, newQuantity) => {
    if (newQuantity < 1) {
      setSelectedItems(prev => prev.filter(item => item.menuId !== menuId));
    } else {
      setSelectedItems(prev =>
        prev.map(item =>
          item.menuId === menuId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please add items to order');
      return;
    }

    try {
      const orderData = {
        items: selectedItems.map(({ menuId, quantity }) => ({ menuId, quantity }))
      };
      const response = await orderAPI.create(orderData);
      toast.success('Order created successfully');
      setSelectedItems([]);
      if (onOrderCreated) {
        onOrderCreated(response.data);
      }
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  const categories = [...new Set(menuItems.map(item => item.category))];

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Create New Order</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Selection - Takes 2/3 of the space */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Items</h3>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Loading menu...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {categories.map(category => {
                const categoryItems = menuItems.filter(item => item.category === category);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={category}>
                    <h4 className="font-medium text-gray-700 mb-3 pb-1 border-b-2 border-orange-500">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categoryItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => addToOrder(item)}
                          className="bg-gray-50 p-3 rounded-lg text-center hover:bg-orange-500 hover:text-white transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm opacity-75">₹{item.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Order - Takes 1/3 of the space */}
        <div className="bg-gray-50 rounded-lg shadow-md p-6 sticky top-5 h-fit">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Current Order</h3>
          
          {selectedItems.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-6xl mb-4">🍽️</p>
              <p>No items selected</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {selectedItems.map(item => (
                  <div key={item.menuId} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-800">{item.name}</span>
                      <span className="text-gray-600">₹{item.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-orange-500">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t-2 border-gray-300 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-orange-500">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={handleSubmitOrder}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                Place Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;