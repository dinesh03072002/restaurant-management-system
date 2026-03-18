import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MenuList from './components/Menu/MenuList';
import CreateOrder from './components/Orders/CreateOrder';
import OrderList from './components/Orders/OrderList';
import Dashboard from './components/Dashboard/Dashboard';
import './services/keepAlive';
import './index.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-100 relative">
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
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 bg-orange-500 text-white p-2 rounded-lg shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        )}
        
        {/* Sidebar - Responsive */}
        <aside className={`
          ${isMobile ? 'fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out z-40' : 'relative'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          w-64 bg-gray-900 text-white flex-shrink-0
        `}>
          <div className="p-6 text-center border-b border-gray-800">
            <h2 className="text-2xl font-bold text-orange-500">Restaurant MS</h2>
          </div>
          
          <nav className="mt-6">
            <NavLink 
              to="/" 
              onClick={() => isMobile && setSidebarOpen(false)}
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
              onClick={() => isMobile && setSidebarOpen(false)}
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
              onClick={() => isMobile && setSidebarOpen(false)}
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
              onClick={() => isMobile && setSidebarOpen(false)}
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

        {/* Overlay for mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content - Responsive padding */}
        <main className={`
          flex-1 overflow-y-auto transition-all duration-300
          ${isMobile ? 'p-4 pt-16' : 'p-8'}
        `}>
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