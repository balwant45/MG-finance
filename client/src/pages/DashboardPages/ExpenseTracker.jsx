import React, { useState, useEffect } from "react";
import PieChart from "../../components/PieChart";
import AddExpenseForm from "./AddExpenseForm";

function ExpenseTracker() {
  const ACCENT_COLOR = "#AD4040";

  // 1. Set up state for our data
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState({ totalExpensesSum: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExpenses = async () => {
    try {
      // Fixed the stray colon in the URL here
      const url = searchTerm 
        ? `https://mg-finance-a0tt.onrender.com/expenses?search=${encodeURIComponent(searchTerm)}`
        : `https://mg-finance-a0tt.onrender.com/expenses`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses); 
        setMeta(data.meta);
      } else {
        console.error("Failed to fetch expenses");
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchExpenses();
    }, 500); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]); 

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    // Reduced padding on mobile (p-4) and restored it for desktop (md:p-8)
    <div className="p-4 md:p-8">
      <header
        className="mb-6 md:mb-8 border-b pb-4"
        style={{ borderColor: ACCENT_COLOR }}
      >
        <h2 className="text-2xl md:text-3xl font-light" style={{ color: ACCENT_COLOR }}>
          Manage Expenses
        </h2>
      </header>

      {/* Top Cards - Stacks on mobile, side-by-side on md screens */}
      <section className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-8 md:mb-10">
        <div className="shadow-md md:shadow-lg rounded-lg p-4 bg-white flex-1 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 border-b pb-2">
            <h4 className="text-gray-500 font-medium">
              Latest Transactions
            </h4>
            <span className="text-sm font-bold text-gray-800">
              Total: ₹{meta.totalExpensesSum.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No recent transactions.</p>
            ) : (
              expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 truncate w-32 sm:w-48">
                      {expense.vendor}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(expense.date).toLocaleDateString()} • {expense.category}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-black">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="shadow-md md:shadow-lg rounded-lg p-4 bg-white flex-1">
          <h4 className="text-gray-500 font-medium mb-2">Expense Breakdown</h4>
          {/* Ensure PieChart component handles 100% width internally */}
          <PieChart expenses={expenses} />
        </div>
      </section>

      {/* Search Bar and Add New Exp Button - Stacked on mobile */}
      <section className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <input 
            type="text" 
            placeholder="Search Vendor, Category, or Description..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full border border-gray-300 rounded-md p-3 md:p-2 text-sm focus:outline-none focus:border-[#a38047]"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-white px-5 py-3 md:py-2 rounded-md font-medium hover:opacity-90 transition flex justify-center items-center gap-2 shadow-sm w-full md:w-auto"
          style={{ backgroundColor: "#a68241" }}
        >
          Add New Expense <span>+</span>
        </button>
      </section>

      {/* Transaction List Table */}
      <section className="p-0 md:p-4 mb-2 bg-white rounded-none md:rounded-xl shadow-none md:shadow-lg overflow-hidden border-t md:border border-gray-200">
        <h3 className="text-xl font-semibold mb-4 px-4 md:px-0 pt-4 md:pt-0">Transaction List</h3>
        
        {/* overflow-x-auto allows the table to scroll horizontally on small screens rather than squishing */}
        <div className="overflow-x-auto px-4 md:px-0 pb-4 md:pb-0">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-3">Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">Description</th>
                <th className="p-3">Vendor</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-4">Loading expenses...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4">No expenses found.</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-3 whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="p-3">{expense.category}</td>
                    <td className="p-3">{expense.description}</td>
                    <td className="p-3">{expense.vendor}</td>
                    <td className="p-3 font-medium">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 whitespace-nowrap">{expense.paymentMethod}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <AddExpenseForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onExpenseAdded={fetchExpenses} 
      />
    </div>
  );
}

export default ExpenseTracker;