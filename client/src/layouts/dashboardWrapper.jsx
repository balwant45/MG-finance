import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Navbar from "../components/Navbar";

function dashboardWrapper() {
  return (
    <>
      <div className="flex h-screen bg-base-200 md:pl-64">
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
// <div className='flex min-h-screen w-full bg-gray-50 text-gray-900 '>
{
  /* sidebar */
}
{
  /* <main className='flex w-full flex-col bg-gray-50 dark:bg-black md:pl-64'>  */
}
{
  /* navbar and content */
}

//  </main>
// </div>
