import React, { useState, useEffect } from "react";
import PieChart from "../../components/PieChart";
import AddExpenseForm from "./AddExpenseForm";

function ExpenseTracker() {
  const ACCENT_COLOR = "#AD4040";

  // 1. Set up state for our data
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState({ totalExpensesSum: 0 });
  const [loading, setLoading] = useState(true);
  // search state
  // Add this near your other state variables
const [searchTerm, setSearchTerm] = useState("");
// modal toggle state
const [isModalOpen, setIsModalOpen] = useState(false);

const fetchExpenses = async () => {
  try {
    // Check if there is a search term and build the URL accordingly
    const url = searchTerm 
      ? `https://mg-finance-a0tt.onrender.com:/expenses?search=${encodeURIComponent(searchTerm)}`
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
  // Set a timer to delay the fetch
  const delayDebounceFn = setTimeout(() => {
    fetchExpenses();
  }, 500); // Waits 500ms after the user stops typing

  // Cleanup the timer if the user types again before 500ms is up
  return () => clearTimeout(delayDebounceFn);
}, [searchTerm]); //
  // 2. Fetch data when the component mounts
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        // Using your live backend URL mapping to the new /expenses route
        // const response = await fetch("https://mg-finance-a0tt.onrender.com/expenses");
        const response = await fetch("http://localhost:3000/expenses");
        
        if (response.ok) {
          const data = await response.json();
          // The backend returns { expenses: [...], meta: { ... } }
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

    fetchExpenses();
  }, []);

  return (
    <div className="p-8">
      <header
        className="mb-8 border-b pb-4"
        style={{ borderColor: ACCENT_COLOR }}
      >
        <h2 className="text-3xl font-light" style={{ color: ACCENT_COLOR }}>
          Manage Expenses
        </h2>
      </header>

      {/* Top Cards */}
      <section className="flex flex-col md:flex-row gap-4 mb-10">
       <div className="shadow-lg rounded-lg p-4 bg-white flex-1 flex flex-col">
          {/* Header Area: Title & Total */}
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h4 className="text-gray-500 font-medium">
              Latest Transactions
            </h4>
            <span className="text-sm font-bold text-gray-800">
              Total: ₹{meta.totalExpensesSum.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Mini-List of 5 Latest Expenses */}
          <div className="flex flex-col gap-3 overflow-y-auto">
            {expenses.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No recent transactions.</p>
            ) : (
              expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="flex justify-between items-center border-b border-gray-50 last:border-0 pb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700 truncate w-32 md:w-48">
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
        
        <div className="shadow-lg rounded-lg p-4 bg-white flex-1">
          <h4 className="text-gray-500 font-medium mb-2">Expense Breakdown</h4>
          <PieChart expenses={expenses} />
        </div>
      </section>

      {/* Search Bar and Add New Exp Button */}
     <section className="flex justify-between items-center mb-6">
        <div className="w-1/3">
         <input 
  type="text" 
  placeholder="Search Vendor, Category, or Description..." 
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)} // Updates state as you type
  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:border-[#a38047]"
/>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="text-white px-5 py-2 rounded-md font-medium hover:opacity-90 transition flex items-center gap-2 shadow-sm"
          style={{ backgroundColor: "#a68241" }}
        >
          Add New Expense <span>+</span>
        </button>
      </section>

      {/* Transaction List Table */}
      <section className="p-4 mb-2 bg-white center rounded-none md:rounded-xl shadow-md md:shadow-lg overflow-hidden border-b md:border border-gray-100">
        <h3 className="text-xl font-semibold mb-4">Transaction List</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
              {/* Conditional rendering based on loading state and data */}
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
                    <td className="p-3">{expense.paymentMethod}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      {/* NEW: The Modal Component Mounted Here */}
      <AddExpenseForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onExpenseAdded={fetchExpenses} // Passes the fetch function to refresh table
      />
    </div>
  );
}

export default ExpenseTracker;