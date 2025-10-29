import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
export default function DashboardLayout() {

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <div className="p-4 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}