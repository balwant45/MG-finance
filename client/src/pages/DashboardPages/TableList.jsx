import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🛠️ CONFIG: Set API URL to the correct localhost endpoint
const API_URL = "http://localhost:3000/loans/daily-collection";
const API_UPDATE_URL = "http://localhost:3000/loans/installments";

// Helper: Format date to YYYY-MM-DD for input default value
const formatDateToInput = (date) => {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

// --- Status Action Button Component (Requirement 1 - Button) ---
const StatusButton = ({ status, item, fetchCollectionData }) => {
  const isPaid = status === "Paid";
  const statusClass = isPaid? "green-300": status === "Unpaid" || status === "Overdue"? "btn-error": "btn-warning";
  const statusLabel = isPaid ? "Paid" : "Mark Paid";

  const handleStatusUpdate = async (e) => {
    e.stopPropagation();

    if (isPaid) {
      alert(`Installment ${item.srNo} is already paid.`);
      return;
    }

    const confirmPay = window.confirm(
      `Confirm marking Installment #${item.srNo} for ${item.particulars} as PAID?`
    );

    if (confirmPay) {
      try {
        // 🛑 FIX: Use the unique ID from the item object for the URL
        await axios.post(
          `${API_UPDATE_URL}/${item.installmentId}/update-status`,
          {
            newStatus: "Paid",
            amountReceived: item.installmentAmount, // Amount to debit
          }
        );

        alert("Status updated successfully! Refreshing data...");
        fetchCollectionData();
      } catch (error) {
        alert(
          `Failed to update status: ${
            error.response?.data?.error || "Server error"
          }`
        );
        console.error("Status Update Failed:", error);
      }
    }
  };

  return (
    <button
      className={`btn btn-xs rounded-lg p-2 text-white ${statusClass}`}
      onClick={handleStatusUpdate}
      disabled={isPaid}
    >
      {statusLabel}
    </button>
  );
};
// -------------------------------------------------------------------

function TableList() {
  const [collectionEntries, setCollectionEntries] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(true);

  // 🛠️ FIX: State for Date Selector (Requirement 4)
  const [selectedDate, setSelectedDate] = useState(
    formatDateToInput(new Date())
  );

  const navigate = useNavigate(); // 🛠️ FIX: Initialize navigate hook

  // --- Data Fetcher (Optimized with useCallback) ---
  const fetchCollectionData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 🛠️ FIX: Pass the selected date as a query parameter to the backend
      const response = await axios.get(API_URL, {
        params: { date: selectedDate }, // Backend must read req.query.date
      });
      setCollectionEntries(response.data);
    } catch (error) {
      console.error("Error fetching daily collection data:", error);
      setCollectionEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]); // 🛠️ FIX: Refetch when the selectedDate changes

  // Initial load and whenever selectedDate changes
  useEffect(() => {
    fetchCollectionData();
  }, [fetchCollectionData]);

  // --- Calculation Hook (Requirements 2 & 3: Total Due, Recovered, Pending) ---
  const { totalDue, totalRecovered, pendingAmount } = useMemo(() => {
    if (!collectionEntries || collectionEntries.length === 0) {
      return { totalDue: 0, totalRecovered: 0, pendingAmount: 0 };
    }

    // Ensure all string currency values are converted to numbers for calculation
    const due = collectionEntries.reduce(
      (sum, item) => sum + (parseFloat(item.installmentAmount) || 0),
      0
    );

    // 🛠️ FIX: Recovered amount is the sum of debit amounts for PAID items
    const recovered = collectionEntries
      .filter((item) => item.status === "Paid")
      .reduce((sum, item) => sum + (parseFloat(item.debitAmount) || 0), 0);

    // Calculate pending amount
    const pending = due - recovered;

    return {
      totalDue: due.toFixed(2),
      totalRecovered: recovered.toFixed(2),
      pendingAmount: pending.toFixed(2),
    };
  }, [collectionEntries]);

  // --- Row Click Handler for Navigation (Requirement 1 - Part 2) ---
  const handleParticularsClick = (customerId) => {
    // 🛠️ FIX: Navigate to the CustomerDetail page using the customer ID
    if (customerId) {
      navigate(`/dashboard/customers/${customerId}`);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold text-red-700 mb-6">
        Daily Collection
      </h2>

      {/* --- TOP SUMMARY ROW (Requirements 2, 3 & 4) --- */}
      <div className="p-4 mb-6">
        <div className="flex flex-row justify-between items-center gap-4">
          {/* Date Selector (Requirement 4) */}
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

          {/* Total Due Amount (Requirement 2 & 3) */}
          <div className="stat flex p-2">
            <div className="stat-title text-xs">Total Amount</div>
            <div className="stat-value text-lg text-blue-600">₹{totalDue}</div>
          </div>

          {/* Recovered Amount (Requirement 3) */}
          <div className="stat flex p-2">
            <div className="stat-title text-xs">Received Amount</div>
            <div className="stat-value text-lg text-green-600">
              ₹{totalRecovered}
            </div>
          </div>

          {/* Pending Amount (Requirement 3) */}
          <div className="stat flex p-2 ">
            <div className="stat-title text-s">Due Amount</div>
            <div className="text-lg text-red-600">
              ₹{pendingAmount}
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN LEDGER TABLE --- */}
      <div className="overflow-x-auto rounded-lg border border-base-content/5 bg-white  ">
        <table className="table table-lg w-full">
          <thead>
            <tr className=" text-gray-400 uppercase text-sm">
              <th>Due Date</th>
              <th>Particulars (Customer)</th>
              <th>Inst. Amount</th>
              <th>Status</th>
              <th>Debit Amount</th>
              <th>Credit Amount</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {collectionEntries.map((item, index) => (
              <tr
                key={item.srNo + item.particulars + index}
                className="hover border-gray-100"
              >
                <td className="font-medium text-gray-700">
                  {item.dueDate ? item.dueDate : item.srNo}
                </td>

                {/* 🛠️ FIX: Make Particulars clickable for navigation */}
                <td
                  className="font-medium text-blue-600 cursor-pointer hover:underline"
                  onClick={() => handleParticularsClick(item.customerId)}
                >
                  {item.particulars}
                </td>

                <td>₹{item.installmentAmount}</td>

                {/* 🛠️ FIX: Render as clickable status button (Requirement 1) */}
                <td key={`status-${index}`}>
                  <StatusButton
                    status={item.status}
                    item={{
                      ...item,
                      // 🎯 PASS THE UNIQUE ID HERE (This is the unique ID needed for the API URL)
                      installmentId: item.installmentId || item.srNo,
                    }}
                    // 🎯 CRITICAL FIX: Pass the function reference explicitly
                    fetchCollectionData={fetchCollectionData}
                  />
                </td>

                <td>₹{item.debitAmount}</td>
                <td>₹{item.creditAmount}</td>

                <td className="text-gray-500 text-xs">{item.notes}</td>
              </tr>
            ))}

            {collectionEntries.length === 0 && (
              <tr>
                <td colSpan="7" className="flex p-4 text-gray-500">
                  No installments due or collected on{" "}
                  {formatDateToInput(selectedDate)}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TableList;
