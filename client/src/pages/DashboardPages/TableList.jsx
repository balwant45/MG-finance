/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🛠️ CONFIGURATION: Backend API Endpoints
const API_URL = "https://mg-finance-a0tt.onrender.com/loans/daily-collection";
const API_UPDATE_URL = "https://mg-finance-a0tt.onrender.com/loans/installments";

/**
 * HELPER: Format date objects to YYYY-MM-DD
 * Essential for setting default values in HTML5 date inputs.
 */
const formatDateToInput = (date) => {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

/**
 * COMPONENT: StatusButton
 * Handles individual installment payments (Standard, Manual, or Foreclosure).
 */
const StatusButton = ({ status, item, fetchCollectionData }) => {
  // Local state to manage the amount shown in the manual input field
  const [receivedAmount, setReceivedAmount] = useState(item.installmentAmount);

  const isPaid = status === "Paid";
  
  // Dynamic styling based on current payment status
  const statusClass = isPaid ? "green-300" : status === "Unpaid" || status === "Overdue" ? "btn-error" : "btn-warning";
  const statusLabel = isPaid ? "Paid" : "Pay";

  /**
   * ACTION: processPayment
   * Triggers the API call to update installment status and loan balance.
   */
  const handleStatusUpdate = async (amountToProcess) => {
    if (isPaid) return;

    // --- LOGIC: Sanitization (Fix for Error 500) ---
    // Backend Decimal parser crashes on symbols. We strip ₹ and commas before sending.
    const cleanAmount = String(amountToProcess).replace(/[₹,\s]/g, "");

    // Validation to prevent sending empty/invalid data to the database
    if (!cleanAmount || isNaN(cleanAmount)) {
      alert(`Invalid Amount: "${amountToProcess}". Please enter a valid number.`);
      return;
    }

    const confirmPay = window.confirm(
      `Confirm payment of ₹${cleanAmount} for ${item.particulars}?`
    );

    if (confirmPay) {
      try {
        await axios.post(
          `${API_UPDATE_URL}/${item.installmentId}/update-status`,
          {
            newStatus: "Paid",
            amountReceived: cleanAmount, // Sends the specific amount (Manual or Full)
          }
        );

        alert("Payment recorded successfully!");
        fetchCollectionData(); // Refresh the main table to reflect new balance/status
      } catch (error) {
        // --- LOGIC: Error Transparency ---
        // Helpful for testing on Render; shows exactly why the server rejected the request.
        const serverError = error.response?.data?.details || error.response?.data?.error || error.message;
        alert(`BACKEND ERROR (500): ${serverError}`);
        console.error("Status Update Failed:", error);
      }
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* UI: Manual entry and Full Payment options (Hidden if already Paid) */}
      {!isPaid && (
        <>
          {/* Manual Input: Pre-filled with EMI but editable for part-payments */}
          <input
            type="number"
            className="input input-bordered input-xs w-20 text-black font-bold bg-white"
            value={receivedAmount}
            onChange={(e) => setReceivedAmount(e.target.value)}
          />
          
          {/* Foreclose Button: Pulls the remaining balance from item.notes */}
       
        </>
      )}
      
      {/* Standard Submit Button */}
      <button
        className={`btn btn-xs rounded-lg p-2 text-white ${statusClass}`}
        onClick={(e) => {
            e.stopPropagation();
            handleStatusUpdate(receivedAmount);
        }}
        disabled={isPaid}
      >
        {statusLabel}
      </button>
    </div>
  );
};

/**
 * MAIN COMPONENT: TableList
 * Manages Daily Collection ledger, filters by date, and displays total stats.
 */
function TableList() {
  const [collectionEntries, setCollectionEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter State: Defaults to current system date
  const [selectedDate, setSelectedDate] = useState(
    formatDateToInput(new Date())
  );

  const navigate = useNavigate();

  /**
   * DATA FETCH: Get Collection Entries
   * Hits the endpoint with the selectedDate as a query parameter.
   */
  const fetchCollectionData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_URL, {
        params: { date: selectedDate },
      });
      setCollectionEntries(response.data);
    } catch (error) {
      console.error("Error fetching daily collection data:", error);
      setCollectionEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Refetch data automatically whenever the date selector changes
  useEffect(() => {
    fetchCollectionData();
  }, [fetchCollectionData]);

  /**
   * LOGIC: Summary Calculations
   * Computes Total Due, Received, and Pending amounts for the top dashboard cards.
   */
  const { totalDue, totalRecovered, pendingAmount } = useMemo(() => {
    if (!collectionEntries || collectionEntries.length === 0) {
      return { totalDue: 0, totalRecovered: 0, pendingAmount: 0 };
    }

    const due = collectionEntries.reduce(
      (sum, item) => sum + (parseFloat(item.installmentAmount) || 0),
      0
    );

    const recovered = collectionEntries
      .filter((item) => item.status === "Paid")
      .reduce((sum, item) => sum + (parseFloat(item.debitAmount) || 0), 0);

    const pending = due - recovered;

    return {
      totalDue: due.toFixed(2),
      totalRecovered: recovered.toFixed(2),
      pendingAmount: pending.toFixed(2),
    };
  }, [collectionEntries]);

  /**
   * NAVIGATION: Go to Customer Profile
   */
  const handleParticularsClick = (customerId) => {
    if (customerId) {
      navigate(`/dashboard/customers/${customerId}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-red-700 mb-6">
        Daily Collection
      </h2>

      {/* --- DASHBOARD: Top Summary Row --- */}
      <div className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4">
          {/* Date Selector */}
          <div className="form-control flex">
            <label className="label text-sm font-medium text-gray-700 m-2">
              Collection Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input input-bordered input-sm w-44"
              required
            />
          </div>

          {/* Stat Cards */}
          <div className="stat flex p-2">
            <div className="stat-title text-xs">Total Amount</div>
            <div className="stat-value text-lg text-blue-600">₹{totalDue}</div>
          </div>

          <div className="stat flex p-2">
            <div className="stat-title text-xs">Received Amount</div>
            <div className="stat-value text-lg text-green-600">
              ₹{totalRecovered}
            </div>
          </div>

          <div className="stat flex p-2 ">
            <div className="stat-title text-s">Due Amount</div>
            <div className="text-lg text-red-600">
              ₹{pendingAmount}
            </div>
          </div>
        </div>
      </div>

  {/* --- LEDGER: Main Data Table Container --- */}
<div className="bg-white rounded-none md:rounded-xl shadow-md md:shadow-lg overflow-hidden border-b md:border border-gray-100">
  
  {/* --- 1. MOBILE VIEW: Visible only on small screens (Stacked Cards) --- */}
  <div className="md:hidden divide-y divide-gray-100">
    {collectionEntries.map((item, index) => (
      <div key={`mobile-${index}`} className="p-4 active:bg-gray-50 transition-colors">
        {/* Top Row: Meta Info & Status */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            {/* Displaying Sr No and Due Date as secondary info */}
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              #{item.srNo} — {item.dueDate}
            </span>
            {/* Clickable Customer Particulars */}
            <span 
              className="text-sm font-semibold text-blue-600 truncate max-w-[180px]"
              onClick={() => handleParticularsClick(item.customerId)}
            >
              {item.particulars}
            </span>
          </div>
          
          {/* Payment Action Button */}
          <div className="flex flex-col items-end">
            <StatusButton 
              status={item.status} 
              item={{
                ...item,
                installmentId: item.installmentId || item.srNo,
              }} 
              fetchCollectionData={fetchCollectionData} 
            />
          </div>
        </div>

        {/* Shaded Box for Financial Values (Amount & Balance) */}
        <div className="flex justify-between items-end mt-3 bg-gray-50 p-2 rounded-lg">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Inst. Amt</span>
            <span className="text-sm font-mono font-bold text-gray-800">₹{item.installmentAmount}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">Balance</span>
            <span className="text-sm font-mono font-bold text-red-600">₹{item.notes}</span>
          </div>
        </div>
      </div>
    ))}

    {/* Mobile Empty State */}
    {collectionEntries.length === 0 && (
       <div className="p-8 text-center text-gray-400 text-sm">
         No installments due or collected.
       </div>
    )}
  </div>

  {/* --- 2. DESKTOP VIEW: Visible only on md screens and up (Original Table) --- */}
  <div className="hidden md:block overflow-x-auto">
    <table className="table table-lg w-full">
      <thead>
        <tr className="text-gray-400 uppercase text-sm">
          <th>Due Date</th>
          <th>Particulars (Customer)</th>
          <th>Inst. Amount</th>
          <th>Status</th>
          <th>Debit Amount</th>
          <th>Credit Amount</th>
          <th>Notes (Balance)</th>
        </tr>
      </thead>
      <tbody>
        {collectionEntries.map((item, index) => (
          <tr key={`desktop-${index}`} className="hover border-gray-100">
            <td className="font-medium text-gray-700">
              {item.dueDate ? item.dueDate : item.srNo}
            </td>
            <td
              className="font-medium text-blue-600 cursor-pointer hover:underline"
              onClick={() => handleParticularsClick(item.customerId)}
            >
              {item.particulars}
            </td>
            <td>₹{item.installmentAmount}</td>
            <td>
              <StatusButton
                status={item.status}
                item={{
                  ...item,
                  installmentId: item.installmentId || item.srNo,
                }}
                fetchCollectionData={fetchCollectionData}
              />
            </td>
            <td>₹{item.debitAmount}</td>
            <td>₹{item.creditAmount}</td>
            <td className="text-gray-500 text-xs">{item.notes}</td>
          </tr>
        ))}

        {/* Desktop Empty State */}
        {collectionEntries.length === 0 && (
          <tr>
            <td colSpan="7" className="text-center p-4 text-gray-500">
              No installments due or collected on {formatDateToInput(selectedDate)}.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
}

export default TableList;