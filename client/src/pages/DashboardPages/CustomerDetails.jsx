import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./customerdetail.css";

// 🎯 FIX: Define the absolute base URL for your Render backend
const API_BASE_URL = "https://mg-finance-7.onrender.com";

// Helper component for uniform detail rows
const DetailRow = ({ label, value, className = "" }) => (
  <div className={`flex justify-between ${className}`}>
    <span className="text-gray-600 font-medium">{label}</span>
    <span className="text-gray-800">{value}</span>
  </div>
);

export default function CustomerDetail() {
  // --- STATE FOR SEARCH FUNCTIONALITY ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // --- STATE FOR MAIN DISPLAY ---
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // --- STATE FOR "GET ALL" TABLE ---
  const [allCustomers, setAllCustomers] = useState([]);
  const [showAllTable, setShowAllTable] = useState(false);

  const navigate = useNavigate();

  // --- 1. SEARCH FUNCTIONALITY (Now calls a single summary endpoint) ---
  const handleSearch = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      const term = searchTerm.trim();
      if (!term) return;

      setIsLoading(true);
      setSearchError(null);
      setCurrentCustomer(null);
      setShowAllTable(false);

      try {
        // Step 1: Initial search to get customer ID
        const searchResponse = await axios.get(
          `${API_BASE_URL}/customers/search`,
          {
            params: { name: term },
          }
        );

        const results = Array.isArray(searchResponse.data)
          ? searchResponse.data
          : [];

        if (results.length === 0) {
          setSearchError(`No customer found matching "${term}".`);
          return;
        }

        const customerId = results[0].id;

        // 🎯 Calling the existing getCustomerProfile route, which is now
        // modified on the backend to return the full summary structure.
        const summaryResponse = await axios.get(
          `${API_BASE_URL}/customers/${customerId}/profile`
        );

        // The backend provides ALL data in a single, flat object,
        // so we can directly set it to currentCustomer
        setCurrentCustomer(summaryResponse.data);
      } catch (err) {
        console.error("Search or Detail fetch failed:", err);
        const errorMessage =
          err.response?.data?.error ||
          "Failed to fetch customer details. Check your network or server status.";
        setSearchError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm]
  );

  // --- 2. GET ALL CUSTOMERS FUNCTIONALITY (Unchanged) ---
  const handleGetAllCustomers = async () => {
    setIsLoading(true);
    setSearchError(null);
    setCurrentCustomer(null);
    setAllCustomers([]);

    try {
      const response = await axios.get(`${API_BASE_URL}/customers`); // Use API_BASE_URL

      if (Array.isArray(response.data)) {
        setAllCustomers(response.data);
        setShowAllTable(true);
      } else {
        setSearchError(
          "Failed to load all customers. Invalid server response."
        );
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

  // --- 3. ADD NEW LOAN FUNCTIONALITY (Unchanged) ---
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

  // --- 4. Cleanup for dynamic error message (Unchanged) ---
  useEffect(() => {
    if (searchError) {
      const timer = setTimeout(() => setSearchError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchError]);

  const renderAllCustomerRow = (customer) => (
    <tr
      key={customer.id}
      className="border-b hover:bg-gray-50 cursor-pointer"
      onClick={() => {
        setSearchTerm(customer.name);
        handleSearch(null);
      }}
    >
      <td className="px-4 py-2">{customer.id}</td>
      <td className="px-4 py-2 font-medium">{customer.name}</td>
      <td className="px-4 py-2">{customer.contactNo}</td>
      <td className="px-4 py-2">{customer.city || "N/A"}</td>
    </tr>
  );

  return (
    <div className="p-6 bg-white min-h-full">
      {/* --- Top Header and Search Bar --- */}
      <div className="flex justify-end items-center mb-8">
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            className="px-4 py-2 border border-gray-300 rounded-l-full focus:ring-2 focus:ring-green-600 w-64 text-gray-800"
            type="text"
            placeholder="Search by name or number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !searchTerm.trim()}
            className="bg-green-700 text-white rounded-r-full px-5 py-2 hover:bg-green-800 disabled:opacity-50 transition"
          >
            Search
          </button>
        </form>
        {/* 🎯 "View All" Button added here for completeness, if required */}
        <button
          onClick={handleGetAllCustomers}
          disabled={isLoading}
          className="ml-4 bg-gray-500 text-white rounded px-5 py-2 hover:bg-gray-600 disabled:opacity-50 transition"
        >
          View All
        </button>
      </div>

      <h1 className="text-3xl font-normal mb-8 text-gray-800 border-b pb-4">
        Customer Details
      </h1>

      {/* --- DYNAMIC FEEDBACK (Error/Loading) --- */}
      {isLoading && (
        <p className="text-center text-green-500">Loading data...</p>
      )}
      {searchError && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded shadow-sm mb-4">
          <p>
            <strong>Error:</strong> {searchError}
          </p>
        </div>
      )}

      {/* --- ALL CUSTOMERS TABLE (If "View All" is pressed) --- */}
      {showAllTable && allCustomers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mt-6">
          <h3 className="font-semibold text-xl mb-4">All Customers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact No.
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allCustomers.map(renderAllCustomerRow)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- CUSTOMER DETAILS SECTION (Matching Image Structure) --- */}
      {currentCustomer && !showAllTable && (
        <div className="space-y-6">
          {/* 1. Customer Name and Loan Button Box */}
          <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {currentCustomer.name || "N/A"}{" "}
                  <span className="font-normal text-gray-500 text-sm">
                    s/o {currentCustomer.fatherName || "Father Name N/A"}
                  </span>
                </h2>
                <p className="text-sm text-gray-600">
                  {currentCustomer.contactNo || "N/A"}
                </p>
              </div>
              <button
                onClick={handleAddLoan}
                className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition"
              >
                Add New Loan
              </button>
            </div>

            {/* Loan Summary Table - Mimicking the image structure using a flex/grid layout */}
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
                  {currentCustomer.loanSummary?.closingDate || "N/A"}
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
          <div className="grid grid-cols-2 gap-6">
            {/* Personal Details Box */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
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
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-4 border-b pb-2">
                Recent Transactions
              </h3>
              {currentCustomer.recentTransactions &&
              currentCustomer.recentTransactions.length > 0 ? (
                <div className="text-sm space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-600 pb-1 border-b">
                    <span>Date</span>
                    <span>Amount</span>
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
            </div>
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
