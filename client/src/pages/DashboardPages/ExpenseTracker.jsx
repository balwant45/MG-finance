import React, { useState, useEffect } from "react";
import PieChart from "../../components/PieChart";
import AddExpenseForm from "./AddExpenseForm";

function ExpenseTracker() {
  const ACCENT_COLOR = "#AD4040";

  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState({ totalExpensesSum: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExpenses = async () => {
    try {
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
    // 1. FORCED HIDDEN OVERFLOW X on the absolute highest wrapper to guarantee the page itself cannot scroll sideways
    <div className="w-full max-w-full overflow-x-hidden box-border p-4 sm:p-6 lg:p-8">
      
      <header
        className="mb-6 md:mb-8 border-b pb-4 w-full"
        style={{ borderColor: ACCENT_COLOR }}
      >
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-light" style={{ color: ACCENT_COLOR }}>
          Manage Expenses
        </h2>
      </header>

      {/* 2. ADDED min-w-0 and max-w-full to prevent CSS Grid from bursting */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10 w-full max-w-full">
        
        {/* Latest Transactions Card */}
        {/* ADDED min-w-0 to the flex child (crucial for flex/grid shrink) */}
        <div className="shadow-sm md:shadow-md rounded-xl p-4 sm:p-6 bg-white flex flex-col border border-gray-100 w-full min-w-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 border-b pb-3">
            <h4 className="text-gray-500 font-medium text-sm sm:text-base">
              Latest Transactions
            </h4>
            <span className="text-base sm:text-lg font-bold text-gray-800 break-words">
              Total: ₹{meta.totalExpensesSum.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No recent transactions.</p>
            ) : (
              expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-2 gap-2 w-full">
                  
                  {/* min-w-0 ensures the truncate actually works! */}
                  <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <span className="text-sm font-semibold text-gray-700 truncate w-full block">
                      {expense.vendor}
                    </span>
                    <span className="text-xs text-gray-400 truncate w-full block">
                      {new Date(expense.date).toLocaleDateString()} • {expense.category}
                    </span>
                  </div>
                  
                  {/* flex-shrink-0 ensures the price doesn't get squished */}
                  <span className="text-sm sm:text-base font-medium text-black whitespace-nowrap flex-shrink-0">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Expense Breakdown Card */}
        <div className="shadow-sm md:shadow-md rounded-xl p-4 sm:p-6 bg-white border border-gray-100 flex flex-col w-full min-w-0">
          <h4 className="text-gray-500 font-medium text-sm sm:text-base mb-4">Expense Breakdown</h4>
          {/* CRITICAL: overflow-hidden completely traps your PieChart if it's too big */}
          <div className="flex-1 w-full min-h-[250px] flex items-center justify-center overflow-hidden">
            <PieChart expenses={expenses} />
          </div>
        </div>
      </section>

      {/* 3. Search and Add Button */}
      <section className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6 w-full max-w-full">
        <div className="w-full sm:max-w-md lg:max-w-lg min-w-0">
          <input 
            type="text" 
            placeholder="Search Vendor, Category..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:border-[#a38047] focus:ring-[#a38047]"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition flex justify-center items-center gap-2 shadow-sm w-full sm:w-auto flex-shrink-0"
          style={{ backgroundColor: "#a68241" }}
        >
          Add New Expense <span>+</span>
        </button>
      </section>

      {/* 4. The Table (The most common cause of mobile blowouts) */}
      <section className="bg-white rounded-xl shadow-sm md:shadow-md border border-gray-100 overflow-hidden mb-6 w-full max-w-full">
        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">Transaction List</h3>
        </div>
        
        {/* w-full and overflow-x-auto create the scrollable "vault" */}
        <div className="w-full overflow-x-auto">
          {/* min-w-[600px] FORCES the table to scroll rather than breaking the page wrapper */}
          <table className="w-full min-w-[600px] text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs sm:text-sm uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Description</th>
                <th className="p-4 font-medium">Vendor</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-gray-400">Loading expenses...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-gray-400">No expenses found.</td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 text-gray-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 truncate max-w-[150px]">{expense.description}</td>
                    <td className="p-4 font-medium text-gray-800 truncate max-w-[150px]">{expense.vendor}</td>
                    <td className="p-4 font-semibold text-gray-800">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-gray-500">{expense.paymentMethod}</td>
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