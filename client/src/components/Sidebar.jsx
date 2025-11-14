import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/mgFinanceLogo.svg'
function Sidebar() {
  return (
   
     <aside className="w-64 bg-[#3B4F2A] text-base-100 p-4 h-screen ">
    <img src={logo}/>
    <ul className="menu text-20">
    <li><Link to="dashboard" className='has-checked:bg-indigo-300'>🏠 Dashboard</Link></li>
    <li><Link to="customers" className='has-checked:bg-indigo-300'>🏠 Customer Details</Link></li>
    <li><Link to="dailycollection" className='has-checked:bg-indigo-300'>🏠 Daily Collection</Link></li>
    <li><Link to="createloan" className='has-checked:bg-indigo-300'>🏠 New Loan</Link></li>
  </ul>
</aside>

  )
}

export default Sidebar
