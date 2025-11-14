import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import LogIn from "./pages/home/LogIn";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import TableList from "./pages/DashboardPages/TableList";
import Dashboard from "./pages/DashboardPages/Dashboard";
import CustomerDetail from "./pages/DashboardPages/CustomerDetails";
import { useSelector } from "react-redux";

// FIX: Ensure this path is correct, potentially needs the file extension (.jsx)
import ProtectedRoute from "./components/ProtectedRoute"; 
import axios from "axios";
axios.defaults.baseURL = 'https://mg-finance-7.onrender.com';


function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      
      {/* FIX: If the user is logged in, navigating to /login redirects to /dashboard */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LogIn />} 
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* FIX 1: Set Dashboard as the index/root path for /dashboard */}
        <Route index element={<Dashboard />} /> 
        
        {/* Path: /dashboard/dailycollection */}
        <Route path="dailycollection" element={<TableList />} />
        
        <Route path="createloan" element={<div>customer creation form</div>} />
        
        {/* FIX 2: Consolidate customer detail routes into one clear parameterized route */}
        {/* Path: /dashboard/customers/:id */}
        <Route path="customers" element={<CustomerDetail />} />
<Route path="customers/:id" element={<CustomerDetail />} />
        {/* Catch-all for unknown /dashboard sub-routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Catch-all for unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;