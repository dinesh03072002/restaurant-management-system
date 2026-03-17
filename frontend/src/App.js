import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MenuList from './components/Menu/MenuList';
import CreateOrder from './components/Orders/CreateOrder';
import OrderList from './components/Orders/OrderList';
import Dashboard from './components/Dashboard/Dashboard';
import './index.css';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#2ecc71',
                secondary: '#fff',
              },
            },
            error: {
              duration: 3000,
              iconTheme: {
                primary: '#e74c3c',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white">
          <div className="p-6 text-center border-b border-gray-800">
            <h2 className="text-2xl font-bold text-orange-500">Restaurant MS</h2>
          </div>
          
          <nav className="mt-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `block px-6 py-3 hover:bg-orange-500 hover:pl-8 transition-all ${
                  isActive ? 'bg-orange-500 pl-8' : ''
                }`
              }
            >
              📊 Dashboard
            </NavLink>
            <NavLink 
              to="/menu" 
              className={({ isActive }) => 
                `block px-6 py-3 hover:bg-orange-500 hover:pl-8 transition-all ${
                  isActive ? 'bg-orange-500 pl-8' : ''
                }`
              }
            >
              📋 Menu
            </NavLink>
            <NavLink 
              to="/create-order" 
              className={({ isActive }) => 
                `block px-6 py-3 hover:bg-orange-500 hover:pl-8 transition-all ${
                  isActive ? 'bg-orange-500 pl-8' : ''
                }`
              }
            >
              🍽️ Create Order
            </NavLink>
            <NavLink 
              to="/orders" 
              className={({ isActive }) => 
                `block px-6 py-3 hover:bg-orange-500 hover:pl-8 transition-all ${
                  isActive ? 'bg-orange-500 pl-8' : ''
                }`
              }
            >
              📝 Orders
            </NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/menu" element={<MenuList />} />
            <Route path="/create-order" element={<CreateOrder />} />
            <Route path="/orders" element={<OrderList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;