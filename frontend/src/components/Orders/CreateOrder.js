import React, { useState, useEffect } from 'react';
import { menuAPI, orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CreateOrder = ({ onOrderCreated }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

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
    // Show success message
    toast.success(`${menuItem.name} added to order`, {
      duration: 1500,
      icon: '✅'
    });
  };

  const updateQuantity = (menuId, newQuantity) => {
    if (newQuantity < 1) {
      const item = selectedItems.find(item => item.menuId === menuId);
      setSelectedItems(prev => prev.filter(item => item.menuId !== menuId));
      toast.success(`${item.name} removed from order`, {
        duration: 1500,
        icon: '🗑️'
      });
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
      toast.success('Order created successfully!', {
        duration: 3000,
        icon: '🎉'
      });
      setSelectedItems([]);
      setSearchTerm('');
      setSelectedCategory('All');
      if (onOrderCreated) {
        onOrderCreated(response.data);
      }
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  const clearOrder = () => {
    if (selectedItems.length > 0) {
      if (window.confirm('Are you sure you want to clear the current order?')) {
        setSelectedItems([]);
        toast.success('Order cleared');
      }
    }
  };

  // Get unique categories
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Filter items based on category and search term
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-8">Create New Order</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Menu Selection */}
        <div className="lg:col-span-2 bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Select Items</h3>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="🔍 Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
              <svg 
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="mb-4 overflow-x-auto pb-2">
            <div className="flex gap-2 min-w-max">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                  {category !== 'All' && (
                    <span className="ml-1 text-xs opacity-75">
                      ({menuItems.filter(item => item.category === category).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Results count */}
          <div className="mb-3 text-xs sm:text-sm text-gray-500">
            Found {filteredItems.length} items
            {searchTerm && <span> matching "{searchTerm}"</span>}
          </div>
          
          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-orange-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600 text-sm">Loading menu...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500">No items found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search term or category</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-3 text-orange-500 text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {filteredItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => addToOrder(item)}
                  className="bg-gray-50 p-2 sm:p-3 rounded-lg text-center hover:bg-orange-500 hover:text-white transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 group relative"
                >
                  <div className="font-medium text-xs sm:text-sm truncate">{item.name}</div>
                  <div className="text-xs sm:text-sm opacity-75">₹{item.price}</div>
                  {item.description && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {item.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Current Order */}
        <div className="bg-gray-50 rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 sticky top-5 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Current Order</h3>
            {selectedItems.length > 0 && (
              <button
                onClick={clearOrder}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          {selectedItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-400">
              <p className="text-4xl sm:text-6xl mb-4">🍽️</p>
              <p className="text-sm">No items selected</p>
              <p className="text-xs mt-2">Search and click items to add</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-64 sm:max-h-96 overflow-y-auto">
                {selectedItems.map(item => (
                  <div key={item.menuId} className="bg-white rounded-lg p-2 sm:p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-800 text-sm sm:text-base truncate">{item.name}</span>
                      <span className="text-gray-600 text-xs sm:text-sm">₹{item.price}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                          className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="w-6 sm:w-8 text-center font-medium text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                          className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center font-bold text-sm"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-orange-500 text-sm sm:text-base">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t-2 border-gray-300 pt-3 sm:pt-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-base sm:text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-orange-500">₹{calculateTotal().toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items
                </p>
              </div>
              
              <button
                onClick={handleSubmitOrder}
                className="w-full bg-orange-500 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-sm sm:text-base"
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