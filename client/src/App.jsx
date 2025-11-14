import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import LogIn from "./pages/home/LogIn";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import TableList from "./pages/DashboardPages/TableList";
import Dashboard from "./pages/DashboardPages/Dashboard";
import CustomerDetail from "./pages/DashboardPages/CustomerDetails";
import { useSelector } from "react-redux";
import ProtectedRoute from "./components/ProtectedRoute.jsx";  

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LogIn />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dailycollection" />} />
        <Route path="dailycollection" element={<TableList />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customerdetails" element={<CustomerDetail/>} />
        <Route path="createloan" element={<div>customer creation form</div>} />
        <Route path="customers/:id/profile" element={<CustomerDetail />} />
        {/* <Route path="*" element={<Navigate to="dailycollection" />} /> */}
      </Route>

      {/* Catch-all for unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;