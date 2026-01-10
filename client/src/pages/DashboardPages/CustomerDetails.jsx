/* eslint-disable no-unused-vars */
import React, { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./customerdetail.css";

// --- CONFIGURATION ---
const API_BASE_URL = "https://mg-finance.onrender.com";

// --- HELPER COMPONENTS ---
// Uniform detail rows for Personal/Account sections
const DetailRow = ({ label, value, className = "" }) => (
 <div className={`flex justify-between ${className}`}>
 <span className="text-gray-600 font-medium">{label}</span>{" "}
 <span className="text-gray-800">{value}</span>{" "}
 </div>
);

// Date formatter for Indian Standard display
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString.substring(0, 10);
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
 const [selectedLoanIndex, setSelectedLoanIndex] = useState(0); // Tracks which loan is currently viewed
 const [isExpanded, setIsExpanded] = useState(false); // Controls the "See More" chevron for loan switcher
 const {id} = useParams();
 const navigate = useNavigate();
 const toggleDetail = useRef('block');
 const [showDetails, setShowDetails] = useState(false); // Toggles Personal Details visibility on mobile

 // --- UI HANDLERS ---
 const handleToggle = () => {
    setShowDetails((prev) => !prev);
  };

 // --- 1. FUNCTION TO FETCH AND DISPLAY A SINGLE CUSTOMER PROFILE ---
 const handleSelectCustomer = useCallback(async (customerId, customerName) => {
  setIsLoading(true);
  setSearchError(null);
  setSearchResults([]); 
  setShowAllTable(false);

 try {
        const response = await axios.get(`${API_BASE_URL}/customers/${customerId}/profile`);
        const data = response.data;

        // Process all loans associated with the customer
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
        setSelectedLoanIndex(0); 
    } catch (err) {
        setSearchError("Failed to fetch profile: " + (err.response?.data?.error || err.message));
    } finally {
        setIsLoading(false);
    }
}, []);

 // --- 2. URL PARAMETER WATCHER ---
 // Automatically fetches profile if ID is present in the URL
useEffect(() => {
    if (id) {
      handleSelectCustomer(id, "Loading..."); 
    }
  }, [id, handleSelectCustomer]);

 // --- 3. MAIN SEARCH HANDLER ---
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
    const searchResponse = await axios.get(`${API_BASE_URL}/customers/search`, { params: { name: term } });
    const results = Array.isArray(searchResponse.data) ? searchResponse.data : [];
    
    if (results.length === 0) {
        setSearchError(`No customer found matching "${term}".`);
    } else if (results.length === 1) {
        navigate(`/dashboard/customers/${results[0].id}`);
    } else {
        setSearchResults(results); // Display table for multiple matches
    }
   } catch (err) {
    setSearchError(err.response?.data?.error || "Search failed.");
   } finally {
    setIsLoading(false);
   }
  }, [searchTerm, navigate]
 ); 

 // --- 4. GET ALL CUSTOMERS FUNCTIONALITY ---
 const handleGetAllCustomers = async () => {
 setIsLoading(true);
 setSearchError(null);
 setCurrentCustomer(null);
 setSearchResults([]); 
 try {
    const response = await axios.get(`${API_BASE_URL}/customers`); 
    if (Array.isArray(response.data)) {
        setAllCustomers(response.data);
        setShowAllTable(true);
    } else {
        setSearchError("Invalid server response.");
    }
 } catch (err) {
    setSearchError("Failed to load customers.");
 } finally {
    setIsLoading(false);
 }
 }; 

 // --- 5. NAVIGATION TO NEW LOAN PAGE ---
const handleAddLoan = () => {
 if (currentCustomer && currentCustomer.id) {
    navigate("/dashboard/createloan", { state: { customerId: currentCustomer.id, customerName: currentCustomer.name } });
 } else {
    setSearchError("Please select a customer first.");
 }
 }; 

 // --- 6. AUTO-HIDE ERROR MESSAGE ---
 useEffect(() => {
 if (searchError) {
    const timer = setTimeout(() => setSearchError(null), 5000);
    return () => clearTimeout(timer);
 }
}, [searchError]); 

 // --- 7. TABLE ROW RENDERER ---
 const renderCustomerRow = (customer) => (
 <tr key={customer.id} className="border-b hover:bg-gray-100 cursor-pointer" onClick={() => navigate(`/dashboard/customers/${customer.id}`)}>
 <td className="px-4 py-3">{customer.id}</td> 
 <td className="px-4 py-3 font-medium text-gray-800">{customer.name}</td>
 <td className="px-4 py-3">{customer.contactNo}</td> 
 <td className="px-4 py-3">{customer.city || "N/A"}</td> 
 </tr>
 ); 

 // --- MAIN RENDER LOGIC ---
 return (
 <div className="p-4 sm:p-6 bg-[#FFFDE7] min-h-full">
 
 {/* Section: Top Header and Search Bar */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b pb-4">
 <h1 className="text-xl sm:text-3xl font-normal text-gray-800 mb-4 sm:mb-0">Customer Details</h1>
 <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center">
 <form onSubmit={handleSearch} className="flex items-center w-full max-w-xs sm:w-64">
 <input className="px-4 py-2 border border-gray-300 rounded-l-full w-full text-gray-800" type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} disabled={isLoading} />
 <button type="submit" disabled={isLoading || !searchTerm.trim()} className="bg-green-700 text-white rounded-r-full px-5 py-2 hover:bg-green-800 disabled:opacity-50">Search</button>
 </form>
 <button onClick={handleGetAllCustomers} disabled={isLoading} className="hidden sm:block ml-4 bg-gray-500 text-white rounded-full px-5 py-2 hover:bg-gray-600">View All</button>
 </div>
 </div>

 {/* Section: Status Feedback (Loading/Errors) */}
 {isLoading && <p className="text-center text-green-500 font-medium mb-4">Loading data...</p>}
 {searchError && <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded shadow-sm mb-4"><p><strong>Error:</strong> {searchError}</p></div>}

 {/* Section: Search Selection Table (Shows when multiple results found) */}
 {(searchResults.length > 0 || showAllTable) && (
 <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 mt-6">
 <h3 className="font-semibold text-xl mb-4 text-gray-800">{searchResults.length > 0 ? `Found ${searchResults.length} Matches` : "All Customers"}</h3>
 <div className="overflow-x-auto max-h-96">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50 sticky top-0">
 <tr><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">ID</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Name</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Contact No.</th><th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">City</th></tr>
 </thead>
 <tbody className="bg-white divide-y divide-black">{(searchResults.length > 0 ? searchResults : allCustomers).map(renderCustomerRow)}</tbody>
 </table>
 </div>
 </div>
 )}

 {/* Section: Main Profile Display */}
{currentCustomer && (
 <div className="space-y-6 mt-8">
  
  {/* --- 1. LOAN SWITCHER PART (Horizontal row with expander) --- */}
  {currentCustomer.allLoans.length > 1 && (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Select Active Loan</span>
      <div className="flex flex-wrap items-center gap-2">
        {currentCustomer.allLoans.map((loan, idx) => {
          // Responsive Threshold: Show 2 on mobile, 4 on desktop by default
          const threshold = window.innerWidth < 768 ? 2 : 4;
          if (!isExpanded && idx >= threshold) return null;

          return (
            <button
              key={loan.loanSummary.id}
              onClick={() => setSelectedLoanIndex(idx)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border whitespace-nowrap ${
                selectedLoanIndex === idx ? "bg-[#3B4F2A] text-white shadow-md" : "bg-white text-gray-500 border-gray-200"
              }`}
            >
              Loan {loan.loanSummary.id}
            </button>
          );
        })}

        {/* Expander Button: Chevron icon for hiding/showing extra loans */}
        {currentCustomer.allLoans.length > (window.innerWidth < 768 ? 2 : 4) && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-full bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 flex items-center justify-center transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )}

    {/* Section: Dynamic Loan Content Generation */}
    {(() => {
      try {
        const activeLoan = currentCustomer.allLoans[selectedLoanIndex] || currentCustomer.allLoans[0];
        if (!activeLoan) return null;

        return (
            <>
                {/* Header Card: Profile Image and Summary */}
                <div className="bg-[#3B4F2A] w-full justify-around md:bg-gray-100 p-5 sm:p-2 border border-black/10 md:border-black rounded-[2.5rem] md:rounded-lg shadow-xl text-white md:text-gray-800 transition-all duration-300">
                    <div className="grid col-2">
                        <div className=" flex flex-row items-center gap-4">
                            <img src={currentCustomer.profileImageUrl || "https://via.placeholder.com/150"} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-white/50 shadow-md" />
                            <div>
                                <p className="md:text-lg font-bold leading-tight tracking-tight">
                                    {currentCustomer.name}
                                    <span className="block text-[10px] font-normal opacity-70 md:text-gray-600 uppercase tracking-widest mt-0.5">{currentCustomer.fatherName}</span>
                                </p>
                            </div>
                            <div className="items-left flex gap-2">
                                <button onClick={handleAddLoan} className="bg-green-600 md:bg-[#3B4F2A] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-green-700 transition shadow-lg active:scale-95 whitespace-nowrap">Add New Loan</button>
                                <button onClick={handleToggle} className="md:hidden text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-white/30 whitespace-nowrap">View</button>
                            </div>
                        </div>
                    </div>

                    {/* Desktop View: Wide Grid of loan stats */}
                    <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-8 gap-4 mt-6 pt-4 border-t border-gray-300">
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
                                <span className="text-[10px] font-semibold uppercase text-gray-500">{item.label}</span>
                                <span className={`text-sm font-medium truncate ${item.isStatus && item.value === "Active" ? "text-green-600" : ""}`}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card: Personal Details (Expandable on Mobile) */}
                <div className={`${showDetails ? "grid" : "hidden"} md:grid grid-cols-1 p-6 bg-white rounded-[2rem] md:rounded-lg shadow-lg border border-black/5 md:border-black mt-6`} ref={toggleDetail}>
                    <h3 className="font-black text-[11px] mb-6 border-b pb-2 text-gray-400 uppercase tracking-[0.2em]">Personal Details</h3>
                    <div className="text-sm space-y-5">
                        <DetailRow label="Contact No." value={currentCustomer.contactNo} className="border-b border-gray-50 pb-2" />
                        <DetailRow label="Aadhaar No." value={currentCustomer.aadharNo} className="border-b border-gray-50 pb-2" />
                        <DetailRow label="Alternate No." value={currentCustomer.alternateNo} className="border-b border-gray-50 pb-2" />
                        <DetailRow label="Occupation" value={currentCustomer.occupation} className="border-b border-gray-50 pb-2" />
                        <DetailRow label="Guarantor" value={activeLoan.guarantor} className="border-b border-gray-50 pb-2" />
                        <DetailRow label="Address" value={currentCustomer.address} />
                    </div>
                </div>

                {/* Card: Account Summary (Mobile-only version) */}
                <div className="grid grid-cols-1 p-6 bg-white md:hidden rounded-[2rem] md:rounded-lg shadow-lg border border-black/5 md:border-black mt-6" >
                    <h3 className="font-black text-[11px] mb-6 border-b pb-2 text-gray-400 uppercase tracking-[0.2em]">Account Details</h3>
                    <div className="text-sm space-y-5">
                        <DetailRow label="Loan Amount" value={`₹${activeLoan.loanSummary.amount}`} className="border-b border-gray-50 pb-2" />
                        <DetailRow label="Current Balance" value={`₹${activeLoan.loanSummary.closingBalance}`} className="border-b border-gray-50 pb-2" />
                        <DetailRow label="Loan Start Date" value={activeLoan.loanSummary.startDate} className="border-b border-gray-50 pb-2" />
                        <DetailRow label="Loan End Date" value={ activeLoan.loanSummary.closingDate } className="border-b border-gray-50 pb-2" />
                        <DetailRow label="Active loans" value={currentCustomer.allLoans.length} />
                        <DetailRow label="Installment Amount" value={`₹${activeLoan.loanSummary.installmentAmount}`} />
                    </div>
                </div>

                {/* Section: EMI Ledger Table */}
                <div className="bg-white p-4 md:p-6 rounded-[2rem] md:rounded-lg shadow-lg border border-gray-100 mt-6">
                    <h3 className="font-black text-[11px] mb-6 border-b pb-2 text-gray-400 uppercase tracking-[0.2em]">EMI Ledger (Loan #{activeLoan.loanSummary.id})</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead>
                                <tr className="bg-gray-50 md:bg-transparent">
                                    <th className="px-3 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Sr.</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">EMI</th>
                                    <th className="px-3 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid</th>
                                    <th className="px-3 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Bal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {activeLoan.emiLedger.map((emi, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-3 py-5 text-xs font-bold text-gray-300">{emi.slNo}</td>
                                        <td className="px-3 py-5 text-xs font-bold text-gray-700">{emi.date}</td>
                                        <td className="px-3 py-5 text-xs font-bold text-gray-900 font-mono">₹{emi.emiAmount}</td>
                                        <td className="px-3 py-5 text-xs font-bold text-green-600 font-mono">₹{emi.debit}</td>
                                        <td className="px-3 py-5 text-right text-xs font-bold text-gray-900 font-mono">₹{emi.balance}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
        );
      } catch (err) {
        // Handle render-time errors specifically for loan data processing
        return <div className="p-4 bg-orange-100 text-orange-800 rounded">Error rendering loan data: {err.message}</div>;
      }
    })()}
 </div>
)}
 </div>
 );
}