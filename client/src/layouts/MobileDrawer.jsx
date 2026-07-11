// src/components/MobileDrawer.jsx
import React from 'react';
import { X, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/mgFinanceLogo.svg';

// Define the colors based on the screenshot
const PRIMARY_DARK = 'bg-[#556B2F]'; // Dark Olive Green
const PRIMARY_LIGHT = 'text-[#FFFDE7]'; // Creamy Yellow Text

const navItems = [
  { name: "Dashboard", path: "dashboard" },
  { name: "Customer Detail", path: "customers" },
  { name: "Daily Collection", path: "dailycollection" },
  { name: "New Customer", path: "createloan" },
  { name: "Expense Tracker", path: "expenseTracker" }
];

export default function MobileDrawer({ isOpen, onClose }) {
  return (
    <>
      {/* Overlay (Black translucent background when menu is open) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" // Hide on large screens
          onClick={onClose}
        ></div>
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[70vw] transition-transform duration-300 ease-in-out z-50 lg:hidden ${PRIMARY_DARK}`}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        
        {/* Header Section (Logo, User Icon, Close Button) */}
        <div className="flex justify-between items-center p-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
                {/* <User className={`h-6 w-6 ${PRIMARY_LIGHT}`} /> */}
                <div className={`text-xl font-extrabold tracking-widest ${PRIMARY_LIGHT}`}>
                    <img src={logo}/>
                </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-full hover:bg-white/10 ${PRIMARY_LIGHT}`}>
                <X className="h-6 w-6" />
            </button>
        </div>

        {/* Navigation Links */}
        <nav className="mt-8 space-y-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `block px-4 py-3 text-lg font-medium transition-colors ${PRIMARY_LIGHT}
                ${isActive ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
}