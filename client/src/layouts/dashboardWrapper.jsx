import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function dashboardWrapper() {
  return (
    <>
      <div className="flex h-[100dvh] bg-base-200 md:pl-64">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Navbar />
          <div className="p-4 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default dashboardWrapper;

