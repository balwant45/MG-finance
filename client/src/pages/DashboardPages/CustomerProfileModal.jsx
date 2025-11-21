// CustomerProfileModal.js
import React from 'react'

function CustomerProfileModal({ customer, onClose }){
 return (
 <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"> 
<div className='modal-content bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg relative'>
        {/* Close Button */}
        <button 
            onClick={onClose} // Calls handleModalClose in CustomerDetail.js
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-3xl leading-none"
        >
            &times;
        </button>

 {/* Customer Name */}
 <div className='border-b pb-2 mb-4'>
            <h1 className='text-blue-700 text-2xl font-bold'>Profile for: {customer.name || 'Unknown Customer'}</h1>
 </div>
 
 {/* Details */}
        <h2 className='text-lg font-semibold mt-4 mb-2'>Key Details</h2>
        <div className="space-y-2 text-gray-700">
            <p><strong>ID:</strong> {customer.id}</p>
            <p><strong>Contact Number:</strong> {customer.contactNo || 'N/A'}</p>
            <p><strong>Address:</strong> {customer.address || 'N/A'}</p>
            {/* Add more fields here */}
        </div>
        
        <button 
            onClick={onClose} // Calls handleModalClose in CustomerDetail.js
            className="mt-6 bg-green-600 text-white p-2 rounded hover:bg-green-700 float-right"
        >
            Continue & Close
        </button>
</div>
 </div>
 )
}

export default CustomerProfileModal