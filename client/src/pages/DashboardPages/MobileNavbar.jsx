// MobileSidebar.jsx
import React from "react";
import { User, Menu } from "lucide-react"; // Using lucide icons for modern look

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Customer Detail", href: "/dashboard/customerdetail" },
  { name: "Daily Collection", href: "/dashboard/dailycollection" },
  { name: "New Customer", href: "/dashboard/newcustomer" },
];

// This is the full sidebar shown in the image, fixed for mobile view
const MobileSidebar = () => {
  // In a real app, you would use a state for `isOpen` and a drawer animation.
  // For simplicity and matching the fixed look:
  return (
    // Fixed sidebar: 35% width for the dark panel
    <div className="mg-sidebar fixed top-0 left-0 h-full w-[35vw] md:w-[250px] z-50 shadow-2xl">
      
      {/* --- Top Header (Logo and User Icon) --- */}
      <div className="flex justify-between items-center p-4">
        <User className="h-6 w-6 text-white" />
        <div className="text-xl font-extrabold text-white tracking-widest">MG</div>
        <div className="text-xl font-extrabold text-white tracking-widest">FINANCE</div>
      </div>

      {/* --- Navigation Items --- */}
      <nav className="mt-8 space-y-4">
        {navItems.map((item) => (
          <div
            key={item.name}
            // Apply text-shadow to make it pop like the image
            className={`px-4 py-3 text-lg font-medium cursor-pointer transition-colors ${
              item.name === "Customer Detail"
                ? "bg-white/10 text-white font-bold" // Active item style
                : "hover:bg-white/5 text-gray-200"
            }`}
          >
            {item.name}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default MobileSidebar;