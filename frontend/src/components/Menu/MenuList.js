import React, { useState, useEffect } from 'react';
import { menuAPI } from '../../services/api';
import toast from 'react-hot-toast';
import AddEditMenu from './AddEditMenu';

const MenuList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await menuAPI.getAll();
      setMenuItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await menuAPI.delete(id);
        toast.success('Item deleted successfully');
        fetchMenuItems();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const categories = ['Starters', 'Main Course', 'Beverages', 'Desserts'];

  // Group items by category
  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = menuItems.filter(item => item.category === category);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Menu Management</h2>
        <button 
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading menu...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => {
            const categoryItems = groupedItems[category];
            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-orange-500">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map(item => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      onEdit={() => setEditingItem(item)}
                      onDelete={() => handleDelete(item.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(showAddForm || editingItem) && (
        <AddEditMenu
          item={editingItem}
          onClose={() => {
            setShowAddForm(false);
            setEditingItem(null);
          }}
          onSave={() => {
            fetchMenuItems();
            setShowAddForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Menu Item Card Component
const MenuItemCard = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800">{item.name}</h4>
          {item.description && (
            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
          )}
          <p className="text-orange-500 font-bold text-xl mt-2">₹{item.price}</p>
          <span className={`
            inline-block px-2 py-1 rounded text-xs font-bold mt-2
            ${item.isAvailable 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
            }
          `}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuList;