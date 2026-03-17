import React, { useState } from 'react';
import { menuAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AddEditMenu = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'Starters',
    price: item?.price || '',
    description: item?.description || '',
    isAvailable: item?.isAvailable ?? true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (item) {
        await menuAPI.update(item.id, formData);
        toast.success('Item updated successfully');
      } else {
        await menuAPI.create(formData);
        toast.success('Item added successfully');
      }
      onSave();
    } catch (error) {
      toast.error(item ? 'Failed to update item' : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Starters', 'Main Course', 'Beverages', 'Desserts'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          {item ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter item name"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter price"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter description (optional)"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                checked={formData.isAvailable}
                onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 text-gray-700">
                Available
              </label>
            </div>
          </div>
          
          <div className="flex gap-3 justify-end mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (item ? 'Update' : 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditMenu;