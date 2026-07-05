import React from 'react'
import "../../styles/Modal.css"; // Import the CSS for modal styling

function AddExpenseForm() {

  return (
  <>
  <form className='flex h-full w-full centre bg-red-300 shadow-lg border'>
   <div>
     <input type="date" name="date" placeholder="Date" />
    <select name="category" placeholder="Category">
      <option value="">Rent</option>
      <option value="food">Food</option>
      <option value="transportation">Transportation</option>
      <option value="utilities">Utilities</option>
      <option value="utilities">Software</option>
      <option value="utilities">Office</option>
      <option value="utilities">ٍSalary</option>
    </select>
    <input type="text" name="vendor" placeholder="Vendor" />
    <input type="textbox" name="description" placeholder="Description" maxLength="500" />
  </div>
  <div>
    <input type="number" name="amount" placeholder="₹" />
    <select name="paymentMethod" placeholder="Payment Method">
      <option value="">Credit Card</option>
      <option value="debit_card">Debit Card</option>
        <option value="cash">Cash</option>  
        <option value="cash">Cash</option>  
        <option value="bank_transfer">UPI</option>
    </select>
    <input type="text" name="refrence" placeholder="Refrence/invoice#" />

    </div>
    <button type="submit" className='bg-blue-500 text-white p-2 rounded'>Add Expense</button>
  </form>
  </>
  );
}
// 
//   return (
//     <div claassName=''>
//       <h2>Add New Expense</h2>
//       <form className='flex flex-col gap-4'>
//         <input type="text" placeholder="Description" className='border p-2 rounded' />
//         <input type="text" placeholder="Category" className='border p-2 rounded' />
//         <input type="text" placeholder="Vendor" className='border p-2 rounded' />   
//         <input type="number" placeholder="Amount" className='border p-2 rounded' />
//         <select className='border p-2 rounded'>
//           <option value="">Select Payment Method</option>
//           <option value="credit_card">Credit Card</option>
//           <option value="debit_card">Debit Card</option>
//           <option value="cash">Cash</option>
//           <option value="bank_transfer">Bank Transfer</option>
//         </select>
//         <button type="submit" className='bg-blue-500 text-white p-2 rounded'>Add Expense</button>
//       </form>
//     </div>
//   )
// }       


export default AddExpenseForm
