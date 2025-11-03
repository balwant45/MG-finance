/* eslint-disable no-undef */
import React from "react";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
function TableList() {
  const [customerList, setCustomerList] = useState([]);
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("https://mg-finance-7.onrender.com/customers");
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
        {customerList.map((customer, index) => (
  <tr key={customer.id || index}>
    <td>{index + 1}</td>
    <td>{customer.name} s/o {customer.date}</td>
    <td>{customer.emiAmount}</td>
    <td>{customer.status}</td>
    <td>{customer.debit}</td>
    <td>{customer.credit}</td>
    <td>{customer.balance}</td>
  </tr>
))}
        </tbody>
      </table>
    </div>
  );
}

export default TableList;
