
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getDashboardSummary = async (req, res) => {
    try {
        const today = new Date();
        // --- 1. Amount Invested (Capital Injected into Business) ---
        // We sum transactions that are marked as 'Capital_Investment'
        const investedResult = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: { category: 'Capital_Investment' }
        });
        const amountInvested = investedResult._sum.amount ? parseFloat(investedResult._sum.amount) : 0;

        // --- 2. Amount Disbursed (Money given as loans) ---
        // We sum the 'disbursedAmount' from the Loan table directly
        const disbursedResult = await prisma.loan.aggregate({
            _sum: { disbursedAmount: true }
        });
        const amountDisbursed = disbursedResult._sum.disbursedAmount ? parseFloat(disbursedResult._sum.disbursedAmount) : 0;

        // --- 3. Amount Recovered (Money collected from customers) ---
        // We look at the Installment table and sum the 'amount' (which stores actual payment received)
        const recoveredResult = await prisma.installment.aggregate({
            _sum: { amount: true }
        });
        const amountRecovered = recoveredResult._sum.amount ? parseFloat(recoveredResult._sum.amount) : 0;

        // --- 4. Cash In Hand Calculation ---
        // Formula: (Money You Put In + Money You Collected) - (Money You Gave Out)
        const cashInHand = (amountInvested + amountRecovered) - amountDisbursed;

        // --- 5. Loan Status Counts ---
       
        const totalLoans = await prisma.loan.count();
        
        // Active loans: Not closed and either not past end date or has 0 balance
        const currentLoans = await prisma.loan.count({ 
            where: { 
                status: 'Active',
                endDate: { gte: today } // Due date is in future or today
            } 
        });

        const closedLoans = await prisma.loan.count({ 
            where: { 
                OR: [
                    { status: 'Closed' },
                    { balance: 0 }
                ]
            } 
        });

        // 🎯 THE CORE CHANGE: Calculated Defaulted Loans
        const defaultedLoans = await prisma.loan.count({ 
            where: { 
                endDate: { lt: today }, // Closing date has passed
                balance: { gt: 0 },     // Customer still owes money
                status: { not: 'Closed' } // Ensure it's not a loan you manually closed
            } 
        });

        res.json({
            financial: {
                amountInvested,
                amountDisbursed,
                amountRecovered,
                cashInHand,
            },
            loanStats: {
                totalLoans,
                currentLoans,
                closedLoans,
                defaultedLoans, // Now dynamically calculated
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ error: "Server Error" });
    }
};