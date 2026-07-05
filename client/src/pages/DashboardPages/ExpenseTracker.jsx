import React, { useState, useEffect } from "react";
import PieChart from "../../components/PieChart";
import AddExpenseForm from "./AddExpenseForm";

function ExpenseTracker() {
  const ACCENT_COLOR = "#AD4040";

  // 1. Set up state for our data
  const [expenses, setExpenses] = useState([]);
  const [meta, setMeta] = useState({ totalExpensesSum: 0 });
  const [loading, setLoading] = useState(true);

  // 2. Fetch data when the component mounts
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        // Using your live backend URL mapping to the new /expenses route
        const response = await fetch("https://mg-finance-a0tt.onrender.com/expenses");
        
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
        <div className="shadow-lg rounded-lg p-4 bg-white flex-1">
          <h4 className="text-gray-500 font-medium mb-2">
            Total Expenses ({new Date().toLocaleString('default', { month: 'long', year: 'numeric' })})
          </h4>
          <p className="text-3xl p-4 align-middle font-semibold text-gray-800">
            {/* Dynamically render the total sum and format it with commas */}
            ₹{meta.totalExpensesSum.toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="shadow-lg rounded-lg p-4 bg-white flex-1">
          <h4 className="text-gray-500 font-medium mb-2">Expense Breakdown</h4>
          <PieChart />
        </div>
      </section>

      {/* Search Bar and Add New Exp Button */}
      <section className="flex flex-col md:flex-row gap-4 mb-10">
        <AddExpenseForm />
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
    </div>
  );
}

export default ExpenseTracker;