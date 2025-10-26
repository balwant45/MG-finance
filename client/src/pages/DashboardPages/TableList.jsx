/* eslint-disable no-undef */
import React from "react";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
function TableList() {
  // const [customerList, setCustomerList] = useState([]);
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/customers");
        setCustomerList(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchCustomers();
  }, []);

  return (
    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Sr. no.</th>
            <th>Particulars</th>
            <th>Date</th>
            <th>EMI amount</th>
            <th>Status</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {/* row 1 */}
          <tr >
              <th>id</th>
              <td>name</td>
              <td>Quality Control Specialist</td>
              <td>Blue</td>
              <td>Active</td>
              <td>₹1000</td>
              <td>₹0</td>
              <td>₹5000</td>
            </tr>
          
        </tbody>
      </table>
    </div>
  );
}

export default TableList;
