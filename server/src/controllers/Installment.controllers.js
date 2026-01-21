import { Prisma } from "@prisma/client";
import { prisma } from "../db/pisma.js";
//create installments from loan data


// --- Helper function to advance the date based on frequency ---
// --- Helper function to advance the date based on frequency ---
const getNextDueDate = (currentDate, frequency, i) => {
    let nextDate = new Date(currentDate);

    // This logic ensures if start date is Jan 21, 
    // i=1 with 5-day gap becomes Jan 26.
    switch (frequency) {
        case 'Daily':
            nextDate.setDate(nextDate.getDate() + i);
            break;
        case 'Weekly':
            // 🎯 FIXED: Uses 5-day gap as requested
            nextDate.setDate(nextDate.getDate() + (i * 5)); 
            break;
        case 'Monthly 10':
            // 🎯 FIXED: Uses 10-day gap as requested
            nextDate.setDate(nextDate.getDate() + (i * 10));
            break;
        case 'Monthly':
            nextDate.setMonth(nextDate.setMonth() + i); 
            break;
        default:
            nextDate.setDate(nextDate.getDate() + i);
            break;
    }
    return nextDate;
};

// --- Installment Generation Controller ---
export const generateInstallmentsForLoan = async (loanId) => {
    // 1. Fetch Loan Data
    
    const loan = await prisma.loan.findUnique({ 
        where: { id: loanId },
        // Select required fields for calculation and insertion
        select: {
            loanAmount: true,
            interestRate: true,
            totalEmi: true,
            loanDate: true,
            loanType: true,
            installmentFrequency: true,
            totalAmount: true,
            emiAmount: true, // We trust this has the correct calculated value now
        }
    });

    if (!loan) throw new Error("Loan not found");

    if (!loan.totalAmount || !loan.emiAmount || !loan.totalEmi || loan.totalEmi === 0) {
        console.warn(`Installment generation skipped for loan ID ${loanId}: Missing total amount, EMI amount, or total EMIs.`);
        return; // Exit the function gracefully
    }
    // --- 2. Calculate Required Values ---
    const principal = parseFloat(loan.loanAmount.toString());
    const totalAmountToRepay = parseFloat(loan.totalAmount.toString());
    const emiAmountPerInstallment = parseFloat(loan.emiAmount.toString());
    const totalInstallments = loan.totalEmi;
    const loanDate = loan.loanDate;
    
    // Initial balance is the total amount the customer must repay (Principal + Interest)
    let remainingBalance = totalAmountToRepay;
    const installments = [];
    

    // --- 3. Loop and Generate Installments ---
    for (let i = 1; i <= totalInstallments; i++) {
        
        // Calculate the Due Date dynamically based on frequency
        const dueDate = getNextDueDate(loanDate, loan.installmentFrequency, i);
        
        // The balance for the current installment is the remaining balance from the previous loop iteration.
        // For the *first* installment (i=1), the balance is the total amount to repay.
        const currentBalanceBeforePayment = remainingBalance;
        
        // Calculate the balance *after* this payment is made
        remainingBalance = remainingBalance - emiAmountPerInstallment;
        
        // Handle the last installment's balance to ensure it ends exactly at 0
        let finalBalance = (i === totalInstallments) ? 0 : remainingBalance;
        finalBalance = Math.max(0, finalBalance); // Ensure balance never goes below zero due to rounding
        installments.push({
            srNo: i,
            dueDate: dueDate,
            emiAmount: new Prisma.Decimal(emiAmountPerInstallment.toFixed(2)), // Expected amount
            amount: new Prisma.Decimal(0), // Amount Paid (Initial state is 0)
            balance: new Prisma.Decimal(finalBalance.toFixed(2)), // Closing Balance after this payment
            status: "Pending",
            loanId: loanId
        });
    }

    // --- 4. Database Insertion and Loan Update ---
    
    // Insert all generated installments
    await prisma.installment.createMany({ data: installments });
    
    // 🛑 FIX: Update the loan record with the final calculated end date and total amount
    const endDate = installments[installments.length - 1].dueDate;
    await prisma.loan.update({
        where: { id: loanId },
        data: {
            // Set the calculated end date
            endDate: endDate, 
            // Set the initial balance of the loan to the total amount to be repaid
            balance: new Prisma.Decimal(totalAmountToRepay.toFixed(2)),
        }
    });
};

// Return all EMI payments for a loan.
export const getLoanInstallments = async (req, res) => {
  const loanId = parseInt(req.params.id);
  if (isNaN(loanId)) return res.status(400).json({ error: 'Invalid loan ID' });

  try {
    const installments = await prisma.installment.findMany({
      where: { loanId },
      orderBy: { srNo: 'asc' }
    });

    res.json(installments);
  } catch (error) {
    console.error('Error fetching installments:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
