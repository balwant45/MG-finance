
import React, { useEffect, useState } from "react";
// import axios from 'axios'; // Optional: Use axios if you prefer

// --- Reusable Stat Card Component ---
const StatCard = ({ title, value, unit = '', bgColorClass = 'bg-[#3B4F2A]' }) => (
    <div className={`p-4 rounded-3xl text-sm  md:p-6 shadow-lg text-white ${bgColorClass} 
                      flex flex-col items-start justify-center 
                      rounded-none md:rounded-xl`}>
        
        {/* SVG Icon */}
        {/* <div><svg width="54" height="60" viewBox="0 0 54 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.9816 11.25H36.0176L39.9101 7.79C41.2353 6.615 41.7303 4.7075 41.1701 2.9275C40.6098 1.1475 39.1541 0 37.4621 0H16.5371C14.8451 0 13.3893 1.15 12.8291 2.9275C12.2688 4.705 12.7638 6.615 14.0868 7.7875L17.9816 11.25Z" fill="white"/>
            <path d="M36.3262 15H17.6737C11.529 21.7025 6.75 33.4625 6.75 43.125C6.75 51.5225 10.7505 60 19.6875 60H34.875C42.5092 60 47.25 53.5325 47.25 43.125C47.25 33.4625 42.471 21.7025 36.3262 15ZM26.145 35.625H27.855C30.4852 35.625 32.625 38.0025 32.625 40.925C32.625 43.5525 30.9195 45.715 28.6875 46.155V48.1225C28.6875 49.1575 27.9315 49.9975 27 49.9975C26.0685 49.9975 25.3125 49.1575 25.3125 48.1225V46.25H23.0625C22.131 46.25 21.375 45.41 21.375 44.375C21.375 43.34 22.131 42.5 23.0625 42.5H27.855C28.6245 42.5 29.25 41.805 29.25 40.95C29.25 40.07 28.6245 39.375 27.855 39.375H26.145C23.5147 39.375 21.375 36.9975 21.375 34.075C21.375 31.4475 23.0805 29.285 25.3125 28.845V26.875C25.3125 25.84 26.0685 25 27 25C27.9315 25 28.6875 25.84 28.6875 26.875V28.75H30.9375C31.869 28.75 32.625 29.59 32.625 30.625C32.625 31.66 31.869 32.5 30.9375 32.5H26.145C25.3755 32.5 24.75 33.195 24.75 34.05C24.75 34.93 25.3755 35.625 26.145 35.625Z" fill="white"/>
        </svg></div> */}
        
        <h4 className="text-lg font-light mb-1">{title}</h4>
        <p className="text-lg font-semibold md:text-3xl">{unit}{value}</p>
    </div>
);

function Dashboard() {
    // 1. Setup State to hold Backend Data
    const [stats, setStats] = useState({
        financial: {
            amountInvested: 0,
            amountDisbursed: 0,
            amountRecovered: 0,
            cashInHand: 0,
            totalWaivers: 0,
        },
        loanStats: {
            totalLoans: 0,
            currentLoans: 0,
            closedLoans: 0,
            defaultedLoans: 0
        }
    });

    const [loading, setLoading] = useState(true);

    // 2. Fetch Data from API on Component Mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Ensure this URL matches your backend port (default 5000 or 3000)
                const response = await fetch("https://mg-finance.onrender.com/summary");
                
                if (response.ok) {
                    const data = await response.json();
                    setStats(data); // Save data to state
                } else {
                    console.error("Failed to fetch dashboard stats");
                }
            } catch (error) {
                console.error("Error connecting to backend:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // 3. Helper to format currency (e.g. 10,00,000)
    const formatCurrency = (amount) => {
        return amount ? amount.toLocaleString('en-IN') : '0';
    };

    // 4. Map State to your display arrays
    const financialData = [
        { title: 'Amount Invested', value: formatCurrency(stats.financial.amountInvested), unit: '₹' },
        { title: 'Amount Disbursed', value: formatCurrency(stats.financial.amountDisbursed), unit: '₹' },
        { title: 'Amount Recovered', value: formatCurrency(stats.financial.amountRecovered), unit: '₹' },
        { title: 'Total Waivers', value: formatCurrency(stats.financial.totalWaivers), unit: '₹', isWaiver: true },
        { title: 'Cash In Hand', value: formatCurrency(stats.financial.cashInHand), unit: '₹' },
    ];

    const loanData = [
        { title: 'Total Loans', value: stats.loanStats.totalLoans, unit: '' },
        { title: 'Current Loans', value: stats.loanStats.currentLoans, unit: '' },
        { title: 'Closed Loans', value: stats.loanStats.closedLoans, unit: '' },
        { title: 'Defaulted Loans', value: stats.loanStats.defaultedLoans, unit: '' },
    ];
    
    const ACCENT_COLOR = '#AD4040'; 

    if (loading) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="p-8">
            {/* === 1. Main Header: Admin Dashboard === */}
            <header className="mb-8 border-b pb-4" style={{ borderColor: ACCENT_COLOR }}>
                <h2 className="text-3xl font-light" style={{ color: ACCENT_COLOR }}>
                    Admin Dashboard
                </h2>
            </header>

            {/* === 2. Financial Metrics Section === */}
            <section className="mb-10">
                <h3 className="text-xl font-medium mb-6" style={{ color: ACCENT_COLOR }}>
                    Financial Details
                </h3>
                <div className="rounded-4xl grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
                    {financialData.map((item, index) => (
                        <StatCard
                            key={index}
                            title={item.title}
                            value={item.value}
                            unit={item.unit}
                            bgColorClass={item.isWaiver ? 'bg-orange-600' : 'bg-[#3B4F2A]'}
                        />
                    ))}
                </div>
            </section>

            {/* === 3. Loan Details Section === */}
            <section>
                <h3 className="text-xl font-medium mb-6" style={{ color: ACCENT_COLOR }}>
                    Loan Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {loanData.map((item, index) => (
                        <StatCard
                            key={index}
                            title={item.title}
                            value={item.value}
                            unit={item.unit}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Dashboard;