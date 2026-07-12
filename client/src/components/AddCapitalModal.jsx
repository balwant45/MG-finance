import React, { useState } from "react";
import axios from "axios"; // ✅ Upgraded to use your global Axios setup
import { toast } from "react-hot-toast"; // ✅ For user-friendly notifications
const AddCapitalModal = ({ isOpen, onClose, onCapitalAdded }) => {
    // 1. Streamlined State (Only fields the database actually accepts)
    const initialFormState = {
        amount: "",
        date: new Date().toISOString().split("T")[0],
    };

    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // ✅ Clean Axios call! No need for http://localhost or withCredentials 
            // because your global axios configuration handles it automatically.
            const response = await axios.post("/transactions/capital", {
                amount: parseFloat(formData.amount),
                date: new Date(formData.date),
                category: "Capital_Investment" 
            });
            toast.success(`Successfully injected ₹${response.data.amount.toLocaleString('en-IN')}`, {
                style: {
                    border: '1px solid #4e6739',
                    padding: '16px',
                    color: '#4e6739',
                },
                iconTheme: {
                    primary: '#4e6739',
                    secondary: '#FFFAEE',
                },
            });

            // Axios automatically throws an error for non-2xx status codes, 
            // so if we reach this line, it was a success!
            onCapitalAdded(); 
            setFormData(initialFormState); 
            onClose(); 
            
        } catch (err) {
            console.error("Error submitting capital:", err);
            // Grab the specific error message from the backend if it exists
            setError(err.response?.data?.error || "Failed to inject capital. Check connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="text-center pt-6 pb-2 border-b border-gray-100">
                    <h2 className="text-2xl font-semibold" style={{ color: "#4e6739" }}>
                        Inject Capital
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Add initial funds to the business</p>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

                    <div>
                        <label className="block text-sm text-gray-700 mb-1 font-medium">Amount (₹)</label>
                        <input
                            type="number"
                            name="amount"
                            placeholder="e.g., 500000"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            min="1"
                            className="w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:border-[#4e6739] focus:ring-1 focus:ring-[#4e6739]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-1 font-medium">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2.5 focus:outline-none focus:border-[#4e6739]"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="w-full py-3 rounded-md text-gray-700 font-medium transition bg-gray-100 hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-md text-white font-medium transition flex justify-center items-center"
                            style={{ backgroundColor: "#4e6739" }}
                        >
                            {loading ? "Adding..." : "Add Capital"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddCapitalModal;