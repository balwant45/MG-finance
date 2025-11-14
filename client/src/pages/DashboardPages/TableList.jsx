import React, { useState, useEffect } from "react";
import axios from "axios";

// Helper function to render the status badge with correct colors
const StatusBadge = ({ status }) => {
    const statusClass = 
        status === "Paid" ? "badge-success text-white" : 
        status === "Unpaid" || status === "Overdue" ? "badge-error text-white" : 
        "badge-neutral";
    
    return (
        <div className={`badge ${statusClass} badge-sm`}>
            {status}
        </div>
    );
};

function TableList() {
    // Renamed state variable to better reflect the data content
    const [collectionEntries, setCollectionEntries] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCollectionData = async () => {
            try {
                // 🎯 Hitting the new dedicated backend endpoint
                const response = await axios.get("https://mg-finance-7.onrender.com/loans/daily-collection");
                setCollectionEntries(response.data);
                
            } catch (error) {
                console.error("Error fetching daily collection data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCollectionData();
    }, []);

    if (isLoading) {
        return <div className="p-4 text-center">Loading Daily Collection Ledger...</div>;
    }

    return (
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 shadow-lg">
            <table className="table table-lg">
                <thead>
                    <tr className="bg-base-200">
                        <th>Sr. No.</th>
                        <th>Particulars</th>
                        <th>Installment Amount</th>
                        <th>Status</th>
                        <th>Debit Amount</th>
                        <th>Credit Amount</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {collectionEntries.map((item, index) => (
                        <tr key={item.srNo + item.particulars + index} className="hover">
                            {/* Sr. No. from the backend data */}
                            <td>{item.srNo}</td> 
                            
                            {/* Particulars: Name s/o Father's Name */}
                            <td>{item.particulars}</td> 
                            
                            {/* Real data from the backend */}
                            <td>{item.installmentAmount}</td>
                            <td><StatusBadge status={item.status} /></td>
                            <td>{item.debitAmount}</td>
                            <td>{item.creditAmount}</td>
                            <td>{item.notes}</td> 
                        </tr>
                    ))}
                    
                    {collectionEntries.length === 0 && (
                        <tr>
                            <td colSpan="7" className="text-center p-4">No collection data found for this view.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TableList;