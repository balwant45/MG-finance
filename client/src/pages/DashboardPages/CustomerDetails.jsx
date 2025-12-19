import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./customerdetail.css";

// Assuming you have set the global base URL in index.js, 
// using this local definition for clarity and fallback.
const API_BASE_URL = "http://localhost:3000";

// Helper component for uniform detail rows (No change)
const DetailRow = ({ label, value, className = "" }) => (
 <div className={`flex justify-between ${className}`}>
 <span className="text-gray-600 font-medium">{label}</span>{" "}
<span className="text-gray-800">{value}</span>{" "}
</div>
);

// Helper function for date formatting (Recommended for better UX)
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString.substring(0, 10); // Fallback to YYYY-MM-DD
    }
};


export default function CustomerDetail() {
 // --- STATE DECLARATIONS ---
 const [searchTerm, setSearchTerm] = useState("");
 const [isLoading, setIsLoading] = useState(false);
 const [searchError, setSearchError] = useState(null); 
 const [searchResults, setSearchResults] = useState([]); 
 const [currentCustomer, setCurrentCustomer] = useState(null); 
 const [allCustomers, setAllCustomers] = useState([]);
 const [showAllTable, setShowAllTable] = useState(false);
const {id} =useParams()
 const navigate = useNavigate();

 // --- 1. FUNCTION TO FETCH AND DISPLAY A SINGLE CUSTOMER PROFILE ---
 // Called after a selection is made from the table.
 const handleSelectCustomer = useCallback(async (customerId, customerName) => {
  setIsLoading(true);
  setSearchError(null);
  setSearchResults([]); 
  setShowAllTable(false);

  try {
   // Step 2: Call the consolidated profile route with the selected ID
   const summaryResponse = await axios.get(
    `${API_BASE_URL}/customers/${customerId}/profile`
   ); 
        
      // Ensure the dates on the consolidated summary are formatted for display
      const customerData = summaryResponse.data;
      customerData.recentTransactions = customerData.recentTransactions.map(tx => ({
          ...tx,
          date: formatDate(tx.date)
      }));
      customerData.emiLedger = customerData.emiLedger.map(emi => ({
          ...emi,
          date: formatDate(emi.date)
      }));


   setCurrentCustomer(customerData);
if (customerName === "Loading..." || !customerName) {
    setSearchTerm(customerData.name); 
} else {
    setSearchTerm(customerName);
}
      
  } catch (err) {
   console.error("Detail fetch failed:", err);
   setSearchError(
    err.response?.data?.error || "Failed to fetch customer details. Check your network or server status."
   );
  } finally {
   setIsLoading(false);
  }
 }, []);
useEffect(() => {
    if (id) {
      // We pass the ID from the URL. 
      // We pass "Loading..." as the name because we don't know it yet 
      // (it will update once the data is fetched).
      handleSelectCustomer(id, "Loading..."); 
    }
  }, [id, handleSelectCustomer]);


 // --- 2. MAIN SEARCH HANDLER (Handles 0, 1, or Many results) ---
 const handleSearch = useCallback(
  async (e) => {
   if (e) e.preventDefault();

   const term = searchTerm.trim();
   if (!term) return;

   setIsLoading(true);
   setSearchError(null);
   setCurrentCustomer(null);
   setSearchResults([]); 
   setShowAllTable(false);

   try {
    // Step 1: Initial search to get matching customers
    const searchResponse = await axios.get(
     `${API_BASE_URL}/customers/search`,
     {
 params: { name: term },
 }
 );

 const results = Array.isArray(searchResponse.data) ? searchResponse.data : [];

 if (results.length === 0) {
 setSearchError(`No customer found matching "${term}".`);
 } else if (results.length === 1) {
 // Only one result: go straight to profile view
// await handleSelectCustomer(results[0].id, results[0].name); // Await here to maintain loading state
navigate(`/dashboard/customers/${results[0].id}`);
} else {
 // Multiple results: show the selection table
 setSearchResults(results);
 }
 } catch (err) {
 console.error("Search failed:", err);
 setSearchError(
 err.response?.data?.error || "Failed to fetch customer details. Check your network or server status."
);
 } finally {
 setIsLoading(false);
 }
 },
 [searchTerm, handleSelectCustomer] 
 ); 

 // --- 3. GET ALL CUSTOMERS FUNCTIONALITY (Unchanged Logic) ---
 const handleGetAllCustomers = async () => {
 setIsLoading(true);
 setSearchError(null);
 setCurrentCustomer(null);
 setSearchResults([]); 
 setAllCustomers([]);

 try {
const response = await axios.get(`${API_BASE_URL}/customers`); 

 if (Array.isArray(response.data)) {
 setAllCustomers(response.data);
 setShowAllTable(true);
 } else {
 setSearchError( "Failed to load all customers. Invalid server response.");
setShowAllTable(false);
 }
 } catch (err) {
 console.error("Failed to load all customers:", err);
 setSearchError("Failed to connect to server or load all data.");
setShowAllTable(false);
 } finally {
 setIsLoading(false);
}
 }; 

 // --- 4. ADD NEW LOAN FUNCTIONALITY (Unchanged Logic) ---
const handleAddLoan = () => {
 if (currentCustomer && currentCustomer.id) {
 navigate("/dashboard/createloan", {
 state: {
 customerId: currentCustomer.id,
customerName: currentCustomer.name,
 },
 });
 } else {
 setSearchError("Please select a customer before adding a new loan.");
 }
 }; 
 // --- 5. Cleanup for dynamic error message (Unchanged Logic) ---
 useEffect(() => {
 if (searchError) {
const timer = setTimeout(() => setSearchError(null), 5000);
 return () => clearTimeout(timer);
 }
}, [searchError]); 

 // --- 6. Helper to render a row in the "All Customers" or "Search Results" table ---
 const renderCustomerRow = (customer) => (
 <tr
 key={customer.id}
 className="border-b hover:bg-gray-100 cursor-pointer transition duration-150"
 onClick={() => {
 navigate(`/dashboard/customers/${customer.id}`);
 }}
 >
 <td className="px-4 py-3">{customer.id}</td> 
 <td className="px-4 py-3 font-medium text-gray-800">{customer.name}</td>
 <td className="px-4 py-3">{customer.contactNo}</td> 
 <td className="px-4 py-3">{customer.city || "N/A"}</td> 
 </tr>
 ); 

 // --- RENDER LOGIC ---
 return (
 <div className="p-4 sm:p-6 bg-[#FFFDE7] min-h-full">
 {/* --- Top Header and Search Bar --- */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b pb-4">
 <h1 className="text-xl sm:text-3xl font-normal text-gray-800 mb-4 sm:mb-0">
 Customer Details
 </h1>
 <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center">
 <form onSubmit={handleSearch} className="flex items-center w-full max-w-xs sm:w-64">
 <input
 className="px-4 py-2 border border-gray-300 rounded-l-full focus:ring-2 focus:ring-[#556B2F] w-full text-gray-800"
type="text"
 placeholder="Search by name or number"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
isabled={isLoading}
 />
 <button
type="submit"
 disabled={isLoading || !searchTerm.trim()}
 className="bg-green-700 text-white rounded-r-full px-5 py-2 hover:bg-green-800 disabled:opacity-50 transition"
 >
 Search
 </button>
 </form>
<button
 onClick={handleGetAllCustomers}
disabled={isLoading}
 className="hidden sm:block ml-4 bg-gray-500 text-white rounded-full px-5 py-2 hover:bg-gray-600 disabled:opacity-50 transition"
 >
 View All
 </button>
 </div>
 </div>
 {/* --- DYNAMIC FEEDBACK (Error/Loading) --- */}
 {isLoading && (
<p className="text-center text-green-500 font-medium mb-4">
 Loading data...
 </p>

)}
  {searchError && (
 <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded shadow-sm mb-4">
 <p>
 <strong>Error:</strong> {searchError}
</p>
</div>
 )}

 {/* --- 🎯 NEW: MULTIPLE SEARCH RESULTS / ALL CUSTOMERS TABLE --- */}
 {(searchResults.length > 0 || showAllTable) && (
 <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 mt-6">
 <h3 className="font-semibold text-xl mb-4 text-gray-800">
 {searchResults.length > 0
 ? `Found ${searchResults.length} Matches for "${searchTerm}" - Please Select:`
: "All Customers"}
 </h3>
<div className="overflow-x-auto max-h-96">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50 sticky top-0">
 <tr>
 <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
 <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
 <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact No.</th>
 <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">City</th>
 </tr>
 </thead>
<tbody className="bg-white divide-y divide-black">
 {(searchResults.length > 0 ? searchResults : allCustomers).map(
 renderCustomerRow
 )}
 </tbody>
</table>
 </div>
</div>
 )}
 {/* CUSTOMER DETAILS SECTION */}
 {currentCustomer && (
 <div className="space-y-6 mt-8">
 {/* 1. Customer Name and Loan Button Box */}
 <div className="bg-gray-100 p-6 border border-black rounded-lg shadow-inner">
 <div className="flex justify-between items-start">
<div>
<h2 className="text-2xl font-bold text-gray-800">
{currentCustomer.name || "N/A"}{" "}
 <span className="font-normal text-gray-600 text-base">
 s/o {currentCustomer.fatherName || "Father Name N/A"}{" "}
</span>{" "}
</h2>
 <p className="text-sm text-gray-600">
 {currentCustomer.contactNo || "N/A"}{" "}
</p>
 </div>
 <button
 onClick={handleAddLoan}
 className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition"
 >
 Add New Loan
 </button>
</div>

 {/* Loan Summary Table */}
 <div className="mt-4 pt-4 border-t border-gray-300">
 <div className="flex justify-between text-xs font-semibold uppercase text-gray-600 mb-2">
 <span>Loan Start Date</span>
  <span>Loan Closing Date</span>
<span>Loan Amount</span>
 <span>Closing Balance</span>
 <span>Loan Type</span>
<span>Status</span>
 <span>Tenure</span>
 <span className="text-right">Instalment Amount</span>
 </div>
 <div className="flex justify-between text-sm text-gray-800">
 <span className="font-medium">
{currentCustomer.loanSummary?.startDate || "N/A"}
 </span>
 <span className="font-medium">
 {currentCustomer.loanSummary?.endDate || "N/A"}
 </span>
 <span className="font-medium">
 ₹{currentCustomer.loanSummary?.amount || "N/A"}
 </span>
 <span className="font-medium">
₹{currentCustomer.loanSummary?.closingBalance || "N/A"}
</span>
 <span className="font-medium">
{currentCustomer.loanSummary?.type || "N/A"}
 </span>
 <span
 className={`font-medium ${
 currentCustomer.loanSummary?.status === "Active"
 ? "text-green-600"
 : "text-red-600"
 }`}
 >
 {currentCustomer.loanSummary?.status || "N/A"}
 </span>
 <span className="font-medium">
 {currentCustomer.loanSummary?.tenure || "N/A"}
 </span>
 <span className="font-medium text-right">
 ₹{currentCustomer.loanSummary?.installmentAmount || "N/A"}
 </span>
 </div>
 </div>
</div>
 {/* 2. Detail and Transaction Boxes */}
 <div className="">
 {/* Personal Details Box */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-black">
       <h3 className="font-semibold text-lg mb-4 border-b pb-2">
    Personal Details
   </h3>
   <div className="text-sm space-y-3">
    <DetailRow
   label="Aadhaar No."
   value={currentCustomer.aadharNo || "N/A"}
    />
    <DetailRow
   label="Alternate No."
   value={currentCustomer.alternateNo || "N/A"}
    />
    <DetailRow
   label="Contact No."
   value={currentCustomer.contactNo || "N/A"}
    />
    <DetailRow
   label="Occupation"
   value={currentCustomer.occupation || "N/A"}
    />
    <DetailRow
   label="Address"
   value={currentCustomer.address || "N/A"}
    />
    <DetailRow
   label="Guarantor"
   value={currentCustomer.guarantor || "N/A"}
    />
   </div>
  </div>

  {/* Recent Transactions Box */}
{/*   <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
   <h3 className="font-semibold text-lg mb-4 border-b pb-2">
    Recent Transactions
   </h3>
   {currentCustomer.recentTransactions &&
   currentCustomer.recentTransactions.length > 0 ? (
    <div className="text-sm space-y-1">
   <div className="flex justify-between text-xs font-semibold text-gray-600 pb-1 border-b">
    <span>Date</span> <span>Amount</span>
   </div>
   {currentCustomer.recentTransactions.map((tx, index) => (
    <div key={index} className="flex justify-between py-1">
     <span>{tx.date}</span>
     <span className="font-medium text-green-700">
            ₹{tx.amount}
           </span>
          </div>
         ))}
        </div>
       ) : (
        <p className="text-sm text-gray-500">
         No recent transactions found.
        </p>
       )}
      </div> */}
     </div>
     {/* 3. EMI/Ledger Table */}
     <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="font-semibold text-lg mb-4 border-b pb-2">
       EMI Ledger / Installments
      </h3>
      {currentCustomer.emiLedger &&
      currentCustomer.emiLedger.length > 0 ? (
       <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
         <thead className="bg-gray-50">
          <tr>
           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Sl No.
           </th>
           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date
           </th>
           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            EMI Amount
           </th>
           <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Debit/Paid
           </th>
           <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Balance
           </th>
          </tr>
         </thead>
         <tbody className="bg-white divide-y divide-gray-200 text-sm">
          {currentCustomer.emiLedger.map((emi, index) => (
           <tr key={index} className="hover:bg-gray-50">
            <td className="px-4 py-2">{emi.slNo || index + 1}</td>
            <td className="px-4 py-2">{emi.date}</td>
            <td className="px-4 py-2">₹{emi.emiAmount}</td>
            <td className="px-4 py-2 text-green-700 font-medium">
             ₹{emi.debit}
            </td>
            <td className="px-4 py-2 text-right">₹{emi.balance}</td>
           </tr>
          ))}
         </tbody>
        </table>
       </div>
      ) : (
       <p className="text-sm text-gray-500">
        No installment ledger data available for this customer.
       </p>
      )}
     </div>
    </div>
   )}
  </div>
 );
}