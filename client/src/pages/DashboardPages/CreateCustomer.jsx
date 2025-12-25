import React, { useState, useEffect} from "react";
import axios from 'axios';
import {useLocation} from 'react-router-dom';

const API_BASE_URL = "https://mg-finance.onrender.com";
// const API_BASE_URL = "http://localhost:3000";

// Initial state for customer, loan, and guarantor fields
const initialFormData = {
    // Customer Fields (Must match req.body keys)
    name: '', fatherName: '', contactNo: '', aadharNo: '',
    altContactNo: '', occupation: '', address: '', city: '', 
    srNo: '',
    profileImage: null, // File upload

    // Loan Fields (nested, sent as JSON string)
    loan: {
        loanNumber: '', loanAmount: '', disbursedAmount: '', tenure: '',
        loanDate: new Date().toISOString().split('T')[0], 
        loanType: 'Daily',
        status: 'Active',
        interestRate: '', interestAmount: '', totalAmount: '',
        emiAmount: '', totalEmi: '', installmentFrequency: 'Daily'
    },
    
    // Guarantor Fields (nested, sent as JSON string)
    guarantor: {
        name: '', phone: '', address: '', city: '', 
        relationToBorrower: '', occupation: '', idProofType: '', idProofNumber: '', notes: ''
    },
};

function CreateCustomer() {
    const [formData, setFormData] = useState(initialFormData);
    const [isGuarantor, setIsGuarantor] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
const location = useLocation();
    const existingId = location.state?.customerId;

    useEffect(() => {
        const fetchExistingCustomer = async () => {
            if (existingId) {
                setIsLoading(true);
                try {
                    const response = await axios.get(`${API_BASE_URL}/customers/${existingId}`);
                    const data = response.data;

                    setFormData(prev => ({
                        ...prev,
                        name: data.name || '',
                        fatherName: data.fatherName || '',
                        contactNo: data.contactNo || '',
                        aadharNo: data.aadharNo || '',
                        altContactNo: data.altContactNo || '',
                        occupation: data.occupation || '',
                        address: data.address || '',
                        city: data.city || '',
                        srNo: data.srNo || '',
                    }));
                    setMessage(`Add new loan for: ${data.name}`);
                } catch (err) {
                    console.error("Fetch failed", err);
                    setMessage("Failed to load existing customer data.");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchExistingCustomer();
    }, [existingId]);
    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLoanChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            loan: { ...prev.loan, [name]: value }
        }));
    };
    
    const handleGuarantorChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            guarantor: { ...prev.guarantor, [name]: value }
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, profileImage: e.target.files[0] }));
    };

    const handleToggleGuarantor = () => {
        setIsGuarantor(!isGuarantor);
        if (isGuarantor) {
            setFormData(prev => ({ ...prev, guarantor: initialFormData.guarantor }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        // 1. Create FormData object for multipart/form-data submission
        const data = new FormData();

        // 2. Append Customer fields (simple text)
        data.append('name', formData.name);
        data.append('fatherName', formData.fatherName);
        data.append('contactNo', formData.contactNo);
        data.append('aadharNo', formData.aadharNo);
        data.append('altContactNo', formData.altContactNo);
        data.append('occupation', formData.occupation);
        data.append('address', formData.address);
        
        // Include other simple fields required by the backend validation
        data.append('srNo', formData.srNo); 
        data.append('city', formData.city); 

        // 3. Append Image File (matching the Multer field name 'profileImage')
        if (formData.profileImage) {
            data.append('profileImage', formData.profileImage);
        }

        // 4. Append Loan and Guarantor as stringified JSON
        data.append('loan', JSON.stringify(formData.loan));
        
        if (isGuarantor) {
            data.append('guarantor', JSON.stringify(formData.guarantor));
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/customers`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(`Customer and Loan created successfully! ID: ${response.data.id}`);
            setFormData(initialFormData);
            setIsGuarantor(false);
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || 'An unknown error occurred.';
            setMessage(`Error: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 bg-base-100 min-h-screen">
            <header className="flex justify-between items-center mb-8 border-b pb-4 border-gray-300">
                <h2 className="text-3xl font-light text-gray-800">New Loan</h2></header>

            {/* Message Alert */}
            {message && (
                <div 
                    role="alert" 
                    className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'} mb-6`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* === Left Panel: Edit Profile / Customer Details (2/3 width on large screens) === */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-red-700 border-b pb-2">Edit Profile</h3>
                    
                    {/* Grid for Customer Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Full Name */}
                        <div className="form-control">
                            <label className="label font-medium">Full Name*</label>
                            <input type="text" name="name" value={formData.name} onChange={handleCustomerChange} required className="input input-bordered w-full" />
                        </div>

                        {/* Father Name */}
                        <div className="form-control">
                            <label className="label font-medium">Father Name*</label>
                            <input type="text" name="fatherName" value={formData.fatherName} onChange={handleCustomerChange} required className="input input-bordered w-full" />
                        </div>

                        {/* Contact No. */}
                        <div className="form-control">
                            <label className="label font-medium">Contact no.</label>
                            <input type="text" name="contactNo" value={formData.contactNo} onChange={handleCustomerChange} className="input input-bordered w-full" />
                        </div>

                        {/* Aadhaar No. */}
                        <div className="form-control">
                            <label className="label font-medium">Aadhaar no.</label>
                            <input type="text" name="aadharNo" value={formData.aadharNo} onChange={handleCustomerChange} className="input input-bordered w-full" />
                        </div>
                        
                        {/* Alternate No. */}
                        <div className="form-control">
                            <label className="label font-medium">Alternate no.</label>
                            <input type="text" name="altContactNo" value={formData.altContactNo} onChange={handleCustomerChange} className="input input-bordered w-full" />
                        </div>

                        {/* Occupation */}
                        <div className="form-control">
                            <label className="label font-medium">Occupation</label>
                            <input type="text" name="occupation" value={formData.occupation} onChange={handleCustomerChange} className="input input-bordered w-full" />
                        </div>

                        {/* City (Added for completeness) */}
                        <div className="form-control">
                            <label className="label font-medium">City</label>
                            <input type="text" name="city" value={formData.city} onChange={handleCustomerChange} className="input input-bordered w-full" />
                        </div>
                        
                        {/* SR No. (Added for completeness) */}
                        <div className="form-control">
                            <label className="label font-medium">SR No.</label>
                            <input type="text" name="srNo" value={formData.srNo} onChange={handleCustomerChange} className="input input-bordered w-full" />
                        </div>

                        {/* Address (Full width) */}
                        <div className="form-control md:col-span-2">
                            <label className="label font-medium">Address</label>
                            <textarea name="address" value={formData.address} onChange={handleCustomerChange} rows="2" className="textarea textarea-bordered w-full"></textarea>
                        </div>
                    </div>
                    
                    {/* Profile Image Upload (Aligned with the layout) */}
                    <div className="form-control mt-4">
                        <label className="label font-medium">Profile Image</label>
                        <input type="file" onChange={handleFileChange} accept="image/*" className="file-input file-input-bordered w-full max-w-xs" />
                    </div>
                </div>

                {/* === Right Panel: Loan Details (1/3 width on large screens) === */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-xl font-semibold mb-4 text-red-700 border-b pb-2">Loan Details</h3>

                    {/* Loan ID */}
                    <div className="form-control mb-4">
                        <label className="label font-medium">Loan ID (Number)</label>
                        <input type="text" name="loanNumber" value={formData.loan.loanNumber} onChange={handleLoanChange} required className="input input-bordered w-full" />
                    </div>
                    {/* Loan Amount */}
                    <div className="form-control mb-4">
                        <label className="label font-medium">Loan Amount</label>
                        <input type="number" name="loanAmount" value={formData.loan.loanAmount} onChange={handleLoanChange} required className="input input-bordered w-full" />
                    </div> 
                    {/* Loan Type */}
                    <div className="form-control mb-4">
                        <label className="label font-medium">Loan Type</label>
                        <select name="loanType" value={formData.loan.loanType} onChange={handleLoanChange} className="select select-bordered w-full">
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly (30)</option>
                            <option value="Monthly 10">Monthly (10)</option>
                        </select>
                    </div>
                    {/* Rate of Interest */}
                  <div className="form-control mb-4">
        <label className="label font-medium">Rate of Interest (%)</label>
        <select 
            name="interestRate" 
            value={formData.loan.interestRate} 
            onChange={handleLoanChange} 
            required 
            className="select select-bordered w-full"
        >
            {/* The default value should be empty or a prompt */}
            <option value="" disabled>Select Rate</option>
            {/* The two required options */}
            <option value="10">10%</option>
            <option value="15">15%</option>
            <option value="18">18%</option>
            <option value="20">20%</option>
            <option value="25">25%</option>
        </select>
    </div>
                   


                  

                    {/* Disbursed Amount */}
                    <div className="form-control mb-4">
                        <label className="label font-medium">Disbursed Amount</label>
                        <input type="number" name="disbursedAmount" value={formData.loan.disbursedAmount} onChange={handleLoanChange} className="input input-bordered w-full" />
                    </div>
                    
                    {/* Installment Frequency */}
                    <div className="form-control mb-4">
                        <label className="label font-medium">Installation Frequency</label>
                        <select name="installmentFrequency" value={formData.loan.installmentFrequency} onChange={handleLoanChange} className="select select-bordered w-full">
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                            <option value="Monthly 10">Monthly 10</option>
                        </select>
                    </div>

                    {/* Tenure */}
                    <div className="form-control mb-4">
                        <label className="label font-medium">Tenure (e.g., in days/months)</label>
                        <input type="number" name="tenure" value={formData.loan.tenure} onChange={handleLoanChange} className="input input-bordered w-full" />
                    </div>
                    
                    {/* Total EMI Count */}
                    <div className="form-control mb-4">
                        <label className="label font-medium">Total EMIs</label>
                        <input type="number" name="totalEmi" value={formData.loan.totalEmi} onChange={handleLoanChange} className="input input-bordered w-full" />
                    </div>

                    {/* Guarantor Toggle (DaisyUI Toggle) */}
                    <div className="form-control mt-6">
                        <label className="label cursor-pointer">
                            <span className="label-text font-semibold">Guarantor (if any)</span> 
                            <input 
                                type="checkbox" 
                                className="toggle toggle-success" 
                                checked={isGuarantor} 
                                onChange={handleToggleGuarantor}
                            />
                        </label>
                    </div>
                </div>

                {/* === Guarantor Details (Conditional, Full Width) === */}
                {isGuarantor && (
                    <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-4">
                        <h3 className="text-xl font-semibold mb-4 text-red-700 border-b pb-2">Guarantor's Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            <div className="form-control">
                                <label className="label font-medium">Name</label>
                                <input type="text" name="name" value={formData.guarantor.name} onChange={handleGuarantorChange} required={isGuarantor} className="input input-bordered w-full" />
                            </div>
                            <div className="form-control">
                                <label className="label font-medium">Contact No.</label>
                                <input type="text" name="phone" value={formData.guarantor.phone} onChange={handleGuarantorChange} required={isGuarantor} className="input input-bordered w-full" />
                            </div>
                            <div className="form-control">
                                <label className="label font-medium">Address</label>
                                <input type="text" name="address" value={formData.guarantor.address} onChange={handleGuarantorChange} required={isGuarantor} className="input input-bordered w-full" />
                            </div>

                            <div className="form-control">
                                <label className="label font-medium">ID Proof No.</label>
                                <input type="text" name="idProofNumber" value={formData.guarantor.idProofNumber} onChange={handleGuarantorChange} required={isGuarantor} className="input input-bordered w-full" />
                            </div>
                            <div className="form-control">
                                <label className="label font-medium">Relation to Borrower</label>
                                <input type="text" name="relationToBorrower" value={formData.guarantor.relationToBorrower} onChange={handleGuarantorChange} className="input input-bordered w-full" />
                            </div>
                            <div className="form-control">
                                <label className="label font-medium">Occupation</label>
                                <input type="text" name="occupation" value={formData.guarantor.occupation} onChange={handleGuarantorChange} className="input input-bordered w-full" />
                            </div>
                        </div>
                    </div>
                )}

                {/* === Save Changes Button (Full Width) === */}
                <div className="lg:col-span-3 flex justify-end mt-6">
                    <button type="submit" className="btn btn-success text-white px-8 py-3 shadow-lg" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateCustomer;
