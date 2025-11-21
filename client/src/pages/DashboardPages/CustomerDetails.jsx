import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./customerdetail.css";

// 🎯 FIX: Define the absolute base URL for your Render backend
const API_BASE_URL = "https://mg-finance-7.onrender.com";

// Helper component for uniform detail rows
const DetailRow = ({ label, value, className = "" }) => (
  <div className={`flex justify-between ${className}`}>
    <span className="text-gray-600 font-medium">{label}</span>{" "}
    <span className="text-gray-800">{value}</span>{" "}
  </div>
);

export default function CustomerDetail() {
  // --- STATE FOR SEARCH FUNCTIONALITY ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState(null); // 🎯 NEW STATE: To hold multiple search results for selection
  const [searchResults, setSearchResults] = useState([]); // --- STATE FOR MAIN DISPLAY ---

  const [currentCustomer, setCurrentCustomer] = useState(null); // --- STATE FOR "GET ALL" TABLE (Re-used for multiple results) ---

  const [allCustomers, setAllCustomers] = useState([]);
  const [showAllTable, setShowAllTable] = useState(false);

  const navigate = useNavigate(); // --- 1. FUNCTION TO FETCH AND DISPLAY A SINGLE CUSTOMER PROFILE --- // This function is now called AFTER a selection is made.

  const handleSelectCustomer = useCallback(async (customerId, customerName) => {
    setIsLoading(true);
    setSearchError(null);
    setSearchResults([]); // Clear the list of results
    setShowAllTable(false);

    try {
      // 🎯 Step 2: Call the consolidated profile route with the selected ID
      const summaryResponse = await axios.get(
        `${API_BASE_URL}/customers/${customerId}/profile`
      ); // Update search term to the selected name for clarity

      setSearchTerm(customerName);
      setCurrentCustomer(summaryResponse.data);
    } catch (err) {
      console.error("Detail fetch failed:", err);
      setSearchError(
        err.response?.data?.error || "Failed to fetch customer details."
      );
    } finally {
      setIsLoading(false);
    }
  }, []); // --- 2. MAIN SEARCH HANDLER (Now handles multiple results) ---

  const handleSearch = useCallback(
    async (e) => {
      if (e) e.preventDefault();

      const term = searchTerm.trim();
      if (!term) return;

      setIsLoading(true);
      setSearchError(null);
      setCurrentCustomer(null);
      setSearchResults([]); // Clear previous results
      setShowAllTable(false);

      try {
        // Step 1: Initial search to get matching customers
        const searchResponse = await axios.get(
          `${API_BASE_URL}/customers/search`,
          {
            // Assuming your backend uses 'name' for both name and number search
            params: { name: term },
          }
        );

        const results = Array.isArray(searchResponse.data)
          ? searchResponse.data
          : [];

        if (results.length === 0) {
          setSearchError(`No customer found matching "${term}".`);
        } else if (results.length === 1) {
          // Only one result: go straight to profile view
          handleSelectCustomer(results[0].id, results[0].name);
        } else {
          // Multiple results: show the selection table
          setSearchResults(results);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setSearchError(
          err.response?.data?.error ||
            "Failed to fetch customer details. Check your network or server status."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [searchTerm, handleSelectCustomer] // Depend on handleSelectCustomer
  ); // --- 3. GET ALL CUSTOMERS FUNCTIONALITY ---

  const handleGetAllCustomers = async () => {
    setIsLoading(true);
    setSearchError(null);
    setCurrentCustomer(null);
    setSearchResults([]); // Clear search results before showing all
    setAllCustomers([]);

    try {
      const response = await axios.get(`${API_BASE_URL}/customers`);

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
  }; // --- 4. ADD NEW LOAN FUNCTIONALITY (Unchanged) ---

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
  }; // --- 5. Cleanup for dynamic error message (Unchanged) ---

  useEffect(() => {
    if (searchError) {
      const timer = setTimeout(() => setSearchError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchError]); // --- 6. Helper to render a row in the "All Customers" or "Search Results" table ---

  const renderCustomerRow = (customer) => (
    <tr
      key={customer.id}
      className="border-b hover:bg-gray-100 cursor-pointer transition duration-150"
      onClick={() => {
        // When clicked, fetch the full profile
        handleSelectCustomer(customer.id, customer.name);
      }}
    >
      <td className="px-4 py-3">{customer.id}</td>{" "}
      <td className="px-4 py-3 font-medium text-gray-800">{customer.name}</td>
      <td className="px-4 py-3">{customer.contactNo}</td>{" "}
      <td className="px-4 py-3">{customer.city || "N/A"}</td>{" "}
    </tr>
  ); // --- RENDER LOGIC ---

  return (
    <div className="p-6 bg-white min-h-full">
      {/* --- Top Header and Search Bar --- */}{" "}
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        {" "}
        <h1 className="text-3xl font-normal text-gray-800">
          Customer Details{" "}
        </h1>{" "}
        <div className="flex items-center">
          {" "}
          <form onSubmit={handleSearch} className="flex items-center">
            {" "}
            <input
              className="px-4 py-2 border border-gray-300 rounded-l-full focus:ring-2 focus:ring-green-600 w-64 text-gray-800"
              type="text"
              placeholder="Search by name or number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />{" "}
            <button
              type="submit"
              disabled={isLoading || !searchTerm.trim()}
              className="bg-green-700 text-white rounded-r-full px-5 py-2 hover:bg-green-800 disabled:opacity-50 transition"
            >
              Search{" "}
            </button>{" "}
          </form>{" "}
          <button
            onClick={handleGetAllCustomers}
            disabled={isLoading}
            className="ml-4 bg-gray-500 text-white rounded-full px-5 py-2 hover:bg-gray-600 disabled:opacity-50 transition"
          >
            View All{" "}
          </button>{" "}
        </div>{" "}
      </div>
      {/* --- DYNAMIC FEEDBACK (Error/Loading) --- */}{" "}
      {isLoading && (
        <p className="text-center text-green-500 font-medium mb-4">
          Loading data...{" "}
        </p>
      )}{" "}
      {searchError && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded shadow-sm mb-4">
          {" "}
          <p>
            <strong>Error:</strong> {searchError}{" "}
          </p>{" "}
        </div>
      )}{" "}
      {/* --- 🎯 NEW: MULTIPLE SEARCH RESULTS / ALL CUSTOMERS TABLE --- */}{" "}
      {(searchResults.length > 0 || showAllTable) && (
        <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-200 mt-6">
          {" "}
          <h3 className="font-semibold text-xl mb-4 text-gray-800">
            {" "}
            {searchResults.length > 0
              ? `Found ${searchResults.length} Matches for "${searchTerm}" - Please Select:`
              : "All Customers (Click to View Profile):"}{" "}
          </h3>{" "}
          <div className="overflow-x-auto max-h-96">
            {" "}
            <table className="min-w-full divide-y divide-gray-200">
              {" "}
              <thead className="bg-gray-50 sticky top-0">
                {" "}
                <tr>
                  {" "}
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    ID{" "}
                  </th>{" "}
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Name{" "}
                  </th>{" "}
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Contact No.{" "}
                  </th>{" "}
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    City{" "}
                  </th>{" "}
                </tr>{" "}
              </thead>{" "}
              <tbody className="bg-white divide-y divide-gray-100">
                {" "}
                {(searchResults.length > 0 ? searchResults : allCustomers).map(
                  renderCustomerRow
                )}{" "}
              </tbody>{" "}
            </table>{" "}
          </div>{" "}
        </div>
      )}
      {/* --- CUSTOMER DETAILS SECTION (Matching Image Structure) --- */}{" "}
      {currentCustomer && (
        <div className="space-y-6 mt-8">
          {/* 1. Customer Name and Loan Button Box */}{" "}
          <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
            {" "}
            <div className="flex justify-between items-start">
              {" "}
              <div>
                {" "}
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentCustomer.name || "N/A"}{" "}
                  <span className="font-normal text-gray-600 text-base">
                    s/o {currentCustomer.fatherName || "Father Name N/A"}{" "}
                  </span>{" "}
                </h2>{" "}
                <p className="text-sm text-gray-600">
                  {currentCustomer.contactNo || "N/A"}{" "}
                </p>{" "}
              </div>{" "}
              <button
                onClick={handleAddLoan}
                className="bg-green-600 text-white px-4 py-2 rounded font-medium hover:bg-green-700 transition"
              >
                Add New Loan{" "}
              </button>{" "}
            </div>{" "}
            {/* Loan Summary Table - Mimicking the image structure using a flex/grid layout */}{" "}
            <div className="mt-4 pt-4 border-t border-gray-300">
              {" "}
              <div className="flex justify-between text-xs font-semibold uppercase text-gray-600 mb-2">
                <span>Loan Start Date</span> <span>Loan Closing Date</span>{" "}
                <span>Loan Amount</span> <span>Closing Balance</span>{" "}
                <span>Loan Type</span> <span>Status</span>
                <span>Tenure</span>{" "}
                <span className="text-right">Instalment Amount</span>{" "}
              </div>{" "}
              <div className="flex justify-between text-sm text-gray-800">
                {" "}
                <span className="font-medium">
                  {" "}
                  {currentCustomer.loanSummary?.startDate || "N/A"}{" "}
                </span>{" "}
                <span className="font-medium">
                  {" "}
                  {currentCustomer.loanSummary?.closingDate || "N/A"}{" "}
                </span>{" "}
                <span className="font-medium">
                  ₹{currentCustomer.loanSummary?.amount || "N/A"}{" "}
                </span>{" "}
                <span className="font-medium">
                  ₹{currentCustomer.loanSummary?.closingBalance || "N/A"}{" "}
                </span>{" "}
                <span className="font-medium">
                  {currentCustomer.loanSummary?.type || "N/A"}{" "}
                </span>{" "}
                <span
                  className={`font-medium ${
                    currentCustomer.loanSummary?.status === "Active"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {" "}
                  {currentCustomer.loanSummary?.status || "N/A"}{" "}
                </span>{" "}
                <span className="font-medium">
                  {" "}
                  {currentCustomer.loanSummary?.tenure || "N/A"}{" "}
                </span>{" "}
                <span className="font-medium text-right">
                  ₹{currentCustomer.loanSummary?.installmentAmount || "N/A"}{" "}
                </span>{" "}
              </div>{" "}
            </div>{" "}
          </div>
          {/* 2. Detail and Transaction Boxes */}{" "}
          <div className="grid grid-cols-2 gap-6">
            {/* Personal Details Box */}{" "}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              {" "}
              <h3 className="font-semibold text-lg mb-4 border-b pb-2">
                Personal Details{" "}
              </h3>{" "}
              <div className="text-sm space-y-3">
                {" "}
                <DetailRow
                  label="Aadhaar No."
                  value={currentCustomer.aadharNo || "N/A"}
                />{" "}
                <DetailRow
                  label="Alternate No."
                  value={currentCustomer.alternateNo || "N/A"}
                />{" "}
                <DetailRow
                  label="Contact No."
                  value={currentCustomer.contactNo || "N/A"}
                />{" "}
                <DetailRow
                  label="Occupation"
                  value={currentCustomer.occupation || "N/A"}
                />{" "}
                <DetailRow
                  label="Address"
                  value={currentCustomer.address || "N/A"}
                />{" "}
                <DetailRow
                  label="Guarantor"
                  value={currentCustomer.guarantor || "N/A"}
                />{" "}
              </div>{" "}
            </div>
            {/* Recent Transactions Box */}{" "}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              {" "}
              <h3 className="font-semibold text-lg mb-4 border-b pb-2">
                Recent Transactions{" "}
              </h3>{" "}
              {currentCustomer.recentTransactions &&
              currentCustomer.recentTransactions.length > 0 ? (
                <div className="text-sm space-y-1">
                  {" "}
                  <div className="flex justify-between text-xs font-semibold text-gray-600 pb-1 border-b">
                    <span>Date</span> <span>Amount</span>{" "}
                  </div>{" "}
                  {currentCustomer.recentTransactions.map((tx, index) => (
                    <div key={index} className="flex justify-between py-1">
                      <span>{tx.date}</span>{" "}
                      <span className="font-medium text-green-700">
                        ₹{tx.amount}{" "}
                      </span>{" "}
                    </div>
                  ))}{" "}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No recent transactions found.{" "}
                </p>
              )}{" "}
            </div>{" "}
          </div>
          {/* 3. EMI/Ledger Table */}{" "}
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
            {" "}
            <h3 className="font-semibold text-lg mb-4 border-b pb-2">
              EMI Ledger / Installments{" "}
            </h3>{" "}
            {currentCustomer.emiLedger &&
            currentCustomer.emiLedger.length > 0 ? (
              <div className="overflow-x-auto">
                {" "}
                <table className="min-w-full divide-y divide-gray-200">
                  {" "}
                  <thead className="bg-gray-50">
                    {" "}
                    <tr>
                      {" "}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sl No.{" "}
                      </th>{" "}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date{" "}
                      </th>{" "}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EMI Amount{" "}
                      </th>{" "}
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debit/Paid{" "}
                      </th>{" "}
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance{" "}
                      </th>{" "}
                    </tr>{" "}
                  </thead>{" "}
                  <tbody className="bg-white divide-y divide-gray-200 text-sm">
                    {" "}
                    {currentCustomer.emiLedger.map((emi, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {" "}
                        <td className="px-4 py-2">
                          {emi.slNo || index + 1}
                        </td>{" "}
                        <td className="px-4 py-2">{emi.date}</td>
                        <td className="px-4 py-2">₹{emi.emiAmount}</td>{" "}
                        <td className="px-4 py-2 text-green-700 font-medium">
                          ₹{emi.debit}{" "}
                        </td>{" "}
                        <td className="px-4 py-2 text-right">₹{emi.balance}</td>{" "}
                      </tr>
                    ))}{" "}
                  </tbody>{" "}
                </table>{" "}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No installment ledger data available for this customer.{" "}
              </p>
            )}{" "}
          </div>{" "}
        </div>
      )}{" "}
    </div>
  );
}
