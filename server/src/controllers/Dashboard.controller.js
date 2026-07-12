import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getDashboardSummary = async (req, res) => {
    try {
        // 🚀 OPTIMIZATION: Fire all independent database queries simultaneously
        const [
            investedResult,
            disbursedResult,
            recoveredResult,
            waiverResult,
            expenseResult,
            totalLoans,
            currentLoans,
            closedLoans,
            defaultedLoans
        ] = await Promise.all([
            // --- 1. Amount Invested (Capital Injected into Business) ---
            // We sum transactions that are marked as 'Capital_Investment'
            prisma.transaction.aggregate({ _sum: { amount: true }, where: { category: 'Capital_Investment' } }),

            // --- 2. Amount Disbursed (Money given as loans) ---
            // We sum the 'disbursedAmount' from the Loan table directly
            prisma.loan.aggregate({ _sum: { disbursedAmount: true } }),

            // --- 3. Amount Recovered (Money collected from customers) ---
            // We look at the Installment table and sum the 'amount' (which stores actual payment received)
            prisma.installment.aggregate({ _sum: { amount: true } }),

            // --- 3.5 Total Waivers (Money forgiven during foreclosures) ---
            // Summing the waiverAmount from the Transaction table
            prisma.transaction.aggregate({ _sum: { waiverAmount: true } }),

            // NEW: Sum of all tracked expenses (Needed for Cash in Hand)
            prisma.expense.aggregate({ _sum: { amount: true } }), 

            // --- 5. Loan Status Counts ---
            prisma.loan.count(),
            prisma.loan.count({ where: { status: 'Active' } }),
            prisma.loan.count({ where: { status: 'Closed' } }),
            prisma.loan.count({ where: { status: 'Defaulted' } })
        ]);

        // Safely extract amounts, defaulting to 0 if null
        const amountInvested = investedResult._sum.amount ? parseFloat(investedResult._sum.amount) : 0;
        const amountDisbursed = disbursedResult._sum.disbursedAmount ? parseFloat(disbursedResult._sum.disbursedAmount) : 0;
        const amountRecovered = recoveredResult._sum.amount ? parseFloat(recoveredResult._sum.amount) : 0;
        const totalWaivers = waiverResult._sum.waiverAmount ? parseFloat(waiverResult._sum.waiverAmount) : 0;
        const totalExpenses = expenseResult._sum.amount ? parseFloat(expenseResult._sum.amount) : 0;

        // --- 4. Cash In Hand Calculation ---
        // Formula: (Money You Put In + Money You Collected) - (Money You Gave Out)
        // (Updated to also deduct total expenses)
        const cashInHand = (amountInvested + amountRecovered) - (amountDisbursed + totalExpenses);

        res.json({
            financial: {
                amountInvested,
                amountDisbursed,
                amountRecovered,
                cashInHand,
                totalWaivers,
                totalExpenses // Sending this to frontend to display the metric
            },
            loanStats: {
                totalLoans,
                currentLoans,
                closedLoans,
                defaultedLoans,
            }
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({ error: "Server Error" });
    }
};