import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useState } from 'react';
import { Menu } from 'lucide-react';
import MobileDrawer from './MobileDrawer';
import Sidebar from '../components/Sidebar';
import React from 'react';
import logo from '../assets/mgFinanceLogo.svg';
export default function DashboardLayout() {
const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  return (
    <div className="flex h-screen bg-[#FFFDE7] relative"> {/* Creamy Yellow background */}
      
      {/* 1. Sidebar (Visible only on medium/large screens) */}
      <div className="hidden md:flex"> 
        <Sidebar />
      </div>

      {/* 2. Mobile Drawer (Always rendered, but hidden on medium/large screens) */}
      <MobileDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      
      <div className="flex flex-col flex-1">
        
        {/* 3. Navbar (Modified to include the mobile menu button) */}
        {/* The existing Navbar component should be modified to accept the toggle prop and to be hidden on mobile */}
       
        <div className="sticky top-0 z-30 flex items-center justify-between p-4 md:hidden bg-[#556B2F] shadow-lg">
            <button onClick={toggleMenu} className="p-2 text-white hover:bg-white/10 rounded">
                <Menu className="h-6 w-6" />
            </button>
            <div className="text-xl font-extrabold tracking-widest text-[#FFFDE7]">
               <img src={logo} className='h-15' />
            </div>
            <div className="w-6"></div> {/* Spacer */}
        </div>
        
        {/* Render the full Navbar for larger screens */}
        <div className="hidden md:block">
            <Navbar />
        </div>

        {/* 4. Main Content Area */}
        <div className="p-4 overflow-y-auto flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}