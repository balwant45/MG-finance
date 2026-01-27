import { useEffect, useState } from "react"; // ✅ Import useEffect & useState
import { Route, Routes, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // ✅ Import useDispatch
import axios from "axios";

import "./App.css";
import LogIn from "./pages/home/LogIn";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import TableList from "./pages/DashboardPages/TableList";
import Dashboard from "./pages/DashboardPages/Dashboard";
import CustomerDetail from "./pages/DashboardPages/CustomerDetails";
import CreateCustomer from "./pages/DashboardPages/CreateCustomer";
import ProtectedRoute from "./components/ProtectedRoute";

// ✅ 1. AXIOS SETUP
axios.defaults.baseURL = 'https://mg-finance.onrender.com'; 
axios.defaults.withCredentials = true; // 🚨 CRITICAL: Allows cookies to be sent/received

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // ✅ Loading state

  // ✅ 2. AUTH CHECK ON APP LOAD
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // You need to create this simple endpoint on your backend!
        // It should just return 200 OK if the cookie is valid.
        await axios.get("/auth/verify"); 
        
        // If successful, update Redux manually
        dispatch({ type: "auth/loginSuccess" }); 
      } catch (error) {
        // If 401/403, ensure Redux knows we are logged out
        dispatch({ type: "auth/logout" });
      } finally {
        setIsCheckingAuth(false); // Stop loading
      }
    };

    checkAuth();
  }, [dispatch]);

  // Don't render routes until we know if the user is logged in
  if (isCheckingAuth) return <div>Loading...</div>; 

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      
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
        <Route index element={<Dashboard />} /> 
        <Route path="dailycollection" element={<TableList />} />
        <Route path="createloan" element={<CreateCustomer/>} />
        
        {/* ✅ 3. FIXED ROUTING LOGIC */}
        {/* /dashboard/customers -> Shows the LIST of customers */}
        <Route path="customers" element={<CustomerDetail />} /> 
        
        {/* /dashboard/customers/123 -> Shows the DETAILS of one customer */}
        <Route path="customers/:id" element={<CustomerDetail />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;