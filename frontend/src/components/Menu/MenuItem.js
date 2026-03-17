import React from 'react';

const MenuItem = ({ item, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-dark">{item.name}</h4>
          {item.description && (
            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
          )}
          <p className="text-primary font-bold text-lg mt-2">₹{item.price}</p>
          <span className={`
            inline-block px-2 py-1 rounded text-xs font-bold mt-2
            ${item.isAvailable 
              ? 'bg-success text-white' 
              : 'bg-danger text-white'
            }
          `}>
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(item)}
            className="px-3 py-1 bg-warning text-white rounded text-sm hover:opacity-80 transition-opacity"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="px-3 py-1 bg-danger text-white rounded text-sm hover:opacity-80 transition-opacity"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;