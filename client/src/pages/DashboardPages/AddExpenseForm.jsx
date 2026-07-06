import React, { useState } from 'react';

const AddExpenseForm = ({ isOpen, onClose, onExpenseAdded }) => {
  // Initial state matching your Prisma model and UI
  const initialFormState = {
    date: new Date().toISOString().split("T")[0],
    amount: "",
    category: "Rent",
    paymentMethod: "Bank Transfer",
    vendor: "",
    reference: "",
    description: "",
    status: "Paid",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Do not render anything if the modal is closed
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Ensure the amount is sent as a number, not a string
    const payload = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    try {
      // FIX: Added /expenses to the end of the URL
      const response = await fetch("https://mg-finance-a0tt.onrender.com/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onExpenseAdded(); // Trigger the parent to fetch the latest data
        setFormData(initialFormState); // Reset form
        onClose(); // Close the modal
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add expense.");
      }
    } catch (err) {
      console.error("Error submitting expense:", err);
      setError("Network error. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative">
        
        {/* Close Icon */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center pt-6 pb-2">
          <h2 className="text-2xl font-semibold" style={{ color: "#8E3A3A" }}>
            Add New Expense
          </h2>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 pt-4 flex flex-col gap-4">
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-[#a38047]"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-[#a38047]"
                >
                  <option value="Rent">Rent</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Office Supplies">Office Supplies</option>
                  <option value="Travel">Travel</option>
                  <option value="Software">Software</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Vendor</label>
                <input
                  type="text"
                  name="vendor"
                  placeholder="Type vendor name"
                  value={formData.vendor}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-[#a38047]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-[#a38047] resize-none"
                ></textarea>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  name="amount"
                  placeholder="₹"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-[#a38047]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-[#a38047]"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Reference / Invoice #</label>
                <input
                  type="text"
                  name="reference"
                  placeholder="Optional reference #"
                  value={formData.reference}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-[#a38047]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:border-[#a38047]"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-3 rounded-md text-white font-medium transition"
              style={{ backgroundColor: "#8c5a4c" }} // Brown button
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md text-white font-medium transition flex justify-center items-center"
              style={{ backgroundColor: "#a68241" }} // Gold button
            >
              {loading ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseForm;