import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./customerdetail.css";

// Assuming you have set the global base URL in index.js, 
// using this local definition for clarity and fallback.
// const API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = "https://mg-finance.onrender.com";

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
 const [selectedLoanIndex, setSelectedLoanIndex] = useState(0);
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
        const response = await axios.get(`${API_BASE_URL}/customers/${customerId}/profile`);
        const data = response.data;

        // 🎯 IMPORTANT: Map through the NEW 'allLoans' array to format dates for EACH loan
        if (data.allLoans) {
            data.allLoans = data.allLoans.map(loan => ({
                ...loan,
                loanSummary: {
                    ...loan.loanSummary,
                    startDate: formatDate(loan.loanSummary.startDate),
                    closingDate: formatDate(loan.loanSummary.closingDate),
                },
                emiLedger: loan.emiLedger.map(emi => ({
                    ...emi,
                    date: formatDate(emi.date)
                }))
            }));
        }

        setCurrentCustomer(data);
        setSearchTerm(customerName === "Loading..." ? data.name : customerName);
        setSelectedLoanIndex(0); // Reset to first loan on new search
    } catch (err) {
        setSearchError("Failed to fetch profile.", err);
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

 {/* ---  MULTIPLE SEARCH RESULTS / ALL CUSTOMERS TABLE --- */}
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
    {/* --- 1. MINIMALIST LOAN SWITCHER --- */}
    {currentCustomer.allLoans.length > 1 && (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {currentCustomer.allLoans.map((loan, idx) => (
          <button
            key={loan.loanSummary.id}
            onClick={() => setSelectedLoanIndex(idx)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
              selectedLoanIndex === idx 
              ? "bg-[#3B4F2A] text-white border-black shadow-md" 
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Loan ID: {loan.loanSummary.id} • {loan.loanSummary.status}
          </button>
        ))}
      </div>
    )}

    {/* --- 2. SELECTED LOAN DATA WRAPPER --- */}
    {(() => {
      const activeLoan = currentCustomer.allLoans[selectedLoanIndex] || currentCustomer.allLoans[0];
      if (!activeLoan) return null;

      return (
        <>
          {/* Main Loan Summary Card */}
          <div className="bg-[#3B4F2A] md:bg-gray-100 p-4 sm:p-6 border border-black/10 md:border-black rounded-[2rem] md:rounded-lg shadow-xl text-white md:text-gray-800 transition-all duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex flex-row items-center gap-4">
                <img 
                  src={currentCustomer.profileImageUrl || "https://via.placeholder.com/150"} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white" 
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {currentCustomer.name} <span className="text-sm font-normal opacity-80 md:text-gray-600">s/o {currentCustomer.fatherName}</span>
                  </h2>
                  <p className="text-xs opacity-70 md:text-gray-500">{currentCustomer.contactNo}</p>
                </div>
              </div>
              <button 
                onClick={handleAddLoan} 
                className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-green-700 shadow-lg"
              >
                Add New Loan
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20 md:border-gray-300">
              <div className="grid grid-cols-2 md:flex md:justify-between gap-y-6 gap-x-4">
                {[
                  { label: "Start Date", value: activeLoan.loanSummary.startDate },
                  { label: "End Date", value: activeLoan.loanSummary.closingDate },
                  { label: "Amount", value: `₹${activeLoan.loanSummary.amount}` },
                  { label: "Balance", value: `₹${activeLoan.loanSummary.closingBalance}` },
                  { label: "Type", value: activeLoan.loanSummary.type },
                  { label: "Status", value: activeLoan.loanSummary.status, isStatus: true },
                  { label: "Tenure", value: activeLoan.loanSummary.tenure },
                  { label: "Inst. Amt", value: `₹${activeLoan.loanSummary.installmentAmount}` }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="text-[10px] sm:text-xs font-semibold uppercase opacity-60 md:text-gray-500">{item.label}</span>
                    <span className={`text-sm sm:text-base font-medium truncate ${
                      item.isStatus && item.value === "Active" ? "text-green-400 md:text-green-600" : ""
                    }`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="grid grid-cols-1 p-4 bg-white md:p-6 rounded-lg shadow-lg border border-black">
            <h3 className="font-semibold text-lg mb-4 border-b pb-2 text-gray-800">Personal Details</h3>
            <div className="text-sm space-y-3">
              <DetailRow label="Aadhaar No." value={currentCustomer.aadharNo} />
              <DetailRow label="Alternate No." value={currentCustomer.alternateNo} />
              <DetailRow label="Occupation" value={currentCustomer.occupation} />
              <DetailRow label="Guarantor" value={activeLoan.guarantor} />
              <DetailRow label="Address" value={currentCustomer.address} />
            </div>
          </div>

          {/* EMI Ledger Table */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg border border-gray-200">
            <h3 className="font-semibold text-lg mb-4 border-b pb-2 text-gray-800">EMI Ledger (Loan #{activeLoan.loanSummary.id})</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Sl No.</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">EMI Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Debit/Paid</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-gray-500 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {activeLoan.emiLedger.map((emi, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2">{emi.slNo}</td>
                      <td className="px-4 py-2">{formatDate(emi.date)}</td>
                      <td className="px-4 py-2 font-medium">₹{emi.emiAmount}</td>
                      <td className="px-4 py-2 text-green-700 font-bold">₹{emi.debit}</td>
                      <td className="px-4 py-2 text-right font-medium">₹{emi.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    })()}
  </div>
)}
  </div>
 );
}