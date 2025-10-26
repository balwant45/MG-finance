import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import LogIn from "./pages/home/LogIn";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import { useSelector } from "react-redux";
import TableList from "./pages/DashboardPages/TableList";
import Dashboard from "./pages/DashboardPages/Dashboard";

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dailycollection" element={<TableList />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customerdetails" element={<div>Customer Details Page</div>} />
          <Route path="createloan" element={<div>customer creation form</div>} />

          <Route path="*" element={<Navigate to="dailycollection" />} />
        </Route>
      )}
    </Routes>
  );
}

export default App;
