

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getDashboardSummary = async (req, res) => {
    try {
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
// --- 3.5 Total Waivers (Money forgiven during foreclosures) ---
// Summing the waiverAmount from the Transaction table
const waiverResult = await prisma.transaction.aggregate({
    _sum: { waiverAmount: true }
});
const totalWaivers = waiverResult._sum.waiverAmount ? parseFloat(waiverResult._sum.waiverAmount) : 0;
        // --- 5. Loan Status Counts ---
        const totalLoans = await prisma.loan.count();
        const currentLoans = await prisma.loan.count({ where: { status: 'Active' } });
        const closedLoans = await prisma.loan.count({ where: { status: 'Closed' } });
        const defaultedLoans = await prisma.loan.count({ where: { status: 'Defaulted' } });

        res.json({
            financial: {
                amountInvested,
                amountDisbursed,
                amountRecovered,
                cashInHand,
                totalWaivers
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