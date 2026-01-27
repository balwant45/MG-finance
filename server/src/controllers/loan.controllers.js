// Fetch all loans for a specific customer
// In your loan.controllers.js file:
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
//loan status for generating tables
export const getLoanSummary = async (req, res) => {
  const loanId = parseInt(req.params.id);
  if (isNaN(loanId)) return res.status(400).json({ error: "Invalid loan ID" });

  try {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        installments: true,
        transactions: true,
      },
    });

    if (!loan) return res.status(404).json({ error: "Loan not found" });
    // FIX: Ensure calculation handles potential nulls safely, though schema suggests they are Decimal/String.
    // Using optional chaining on installments for safety.
    const totalPaid =
      loan.installments?.reduce(
        (sum, inst) => sum + parseFloat(inst.amount.toString()),
        0
      ) || 0;
    const totalAmount = parseFloat(loan.totalAmount?.toString() || "0") || 0;
    const remainingBalance = totalAmount - totalPaid;

    res.json({
      loanNumber: loan.loanNumber,
      status: loan.status,
      totalAmount: loan.totalAmount,
      emiAmount: loan.emiAmount,
      totalPaid,
      remainingBalance,
      emiPaid: loan.emiPaid,
      totalEmi: loan.totalEmi,
    });
  } catch (error) {
    console.error("Error fetching loan summary:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
//recording payment on customer detail page
export const makeLoanPayment = async (req, res) => {
  const loanId = parseInt(req.params.id);
  // 🎯 FIX 1: Destructure waiver and isForeclosure
  const { amount, waiver, date, isForeclosure } = req.body;

  if (isNaN(loanId)) return res.status(400).json({ error: "Invalid loan ID" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id: loanId } });
      if (!loan) throw new Error("Loan not found");

      const paymentAmount = new Prisma.Decimal(amount || 0);
      const waiverAmount = new Prisma.Decimal(waiver || 0); // 🎯 Handle Waiver
      const currentBalance = new Prisma.Decimal(loan.balance.toString());

      // 🎯 FIX 2: Transaction records both cash and waiver
      const newTransaction = await tx.transaction.create({
        data: {
          loanId,
          code: `PAY-${Date.now()}`,
          date: new Date(date || new Date()),
          amount: paymentAmount,
          waiverAmount: waiverAmount, // 🎯 Recorded in DB
          type: "Credit",
          category: isForeclosure ? "Foreclosure" : "Loan_Repayment",
        },
      });

      // 🎯 FIX 3: Total Impact = Cash + Waiver
      const totalImpact = paymentAmount.add(waiverAmount);
      const updatedBalance = currentBalance.sub(totalImpact);

      await tx.loan.update({
        where: { id: loanId },
        data: {
          balance: updatedBalance,
          // 🎯 Force "Closed" if it's a foreclosure, regardless of math
          status: (isForeclosure || updatedBalance.lte(0)) ? "Closed" : "Active",
          // Update total waiver on the loan
          waiverAmount: { increment: waiverAmount } 
        },
      });

      // 🎯 FIX 4: Handle installments for foreclosure
      if (isForeclosure) {
        await tx.installment.updateMany({
          where: { loanId: loanId, status: { not: "Paid" } },
          data: { status: "Settled", amount: 0 } // Mark as settled early
        });
      } else {
        // Standard payment logic for single EMI
        await tx.installment.updateMany({
          where: { loanId: loanId, status: "Pending" },
          take: 1, // Usually you only want to mark one as paid for a standard payment
          data: { status: "Paid", amount: paymentAmount }
        });
      }

      return newTransaction;
    });

    res.status(201).json({ message: "Success", transaction: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// New function to fetch all recent installment/transaction data for the daily collection view
export const getDailyCollectionData = async (req, res) => {
  try {
    const dateString = req.query.date || new Date().toISOString().split("T")[0];
    const selectedDate = new Date(dateString);

    const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1, 0, 0, 0, -1);

    const collectionEntries = await prisma.installment.findMany({
      where: {
        OR: [
          // A. ITEMS REQUIRING ACTION (Pending/Overdue up to the selected date)
          {
            dueDate: {
              lte: endOfDay, 
            },
            status: {
              not: 'Paid', // 🛠️ FIX: Changed 'note' to 'not'
            },
          },
          // B. ITEMS PAID ON THE SELECTED REPORT DAY
          {
            status: 'Paid',
            updatedAt: { 
              gte: startOfDay, 
              lte: endOfDay, 
            },
          },
        ],
      },
      orderBy: {
        dueDate: "asc",
      },
      include: {
        loan: {
          select: {
            loanType: true,
            loanNumber: true,
            customer: {
              select: {
                id: true, 
                name: true,
                fatherName: true,
              },
            },
          },
        },
      },
    });

    const formattedData = collectionEntries.map((i) => {
      const customerName = i.loan.customer.name;
      const fatherName = i.loan.customer.fatherName;

      let collectionStatus = i.status;
      let notes = i.status;
      
      if (i.status === "Pending") {
        if (i.dueDate < startOfDay) {
          collectionStatus = "Overdue";
          notes = "Overdue";
        } else {
             // If pending and due date is today (or future, though future is filtered out by query)
             collectionStatus = "Due Today";
             notes = "Due Today";
        }
      } else if (i.status === "Paid") {
        collectionStatus = "Paid";
        notes = "Collected";
      }

      return {
        installmentId: i.id, 
        customerId: i.loan.customer.id, 
        srNo: i.srNo,
        // Use template literal for clearer concatenation
        particulars: `${customerName} s/o ${fatherName}`,
        dueDate: i.dueDate.toISOString().split("T")[0],
        loanNumber: i.loan.loanNumber,
        installmentAmount: i.emiAmount?.toString() || "0.00",
        status: collectionStatus, 
        debitAmount: i.amount?.toString() || "0.00",
        creditAmount: "0.00",
        notes: notes,
      };
    });

    res.json(formattedData);
  } catch (error) {
    console.error("CRITICAL Error fetching daily collection data:", error.stack);
    res.status(500).json({
      error: "Internal server error while processing loan data: " + error.message,
    });
  }
};
export const updateInstallmentStatus = async (req, res) => {
  const installmentId = parseInt(req.params.id);
  // Assuming frontend sends the expected installment amount in the body
  const { amountReceived } = req.body;

  if (isNaN(installmentId)) {
    return res.status(400).json({ error: "Invalid Installment ID" });
  }

  const paymentAmount = new Prisma.Decimal(amountReceived || 0);
  const paymentDate = new Date(); // Use current date/time for payment record

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch the Installment and its parent Loan
      const installment = await tx.installment.findUnique({
        where: { id: installmentId },
        include: { loan: true },
      });

      if (!installment || !installment.loan) {
        throw new Error("Installment or related Loan not found.");
      }
      if (installment.status === "Paid") {
        throw new Error("Installment already marked as paid.");
      }

      const loan = installment.loan;

      // 2. Update the Installment record (Status and Amount Paid)
      await tx.installment.update({
        where: { id: installmentId },
        data: {
          status: "Paid",
          // Record the actual amount debited/paid
          amount: paymentAmount,
        },
      });

      // 3. Update the parent Loan balance and paid count
      const newLoanBalance = new Prisma.Decimal(loan.balance.toString()).sub(
        paymentAmount
      );

      await tx.loan.update({
        where: { id: loan.id },
        data: {
          balance: newLoanBalance,
          emiPaid: { increment: 1 },
        },
      });

      // 4. Create a general transaction record
      await tx.transaction.create({
        data: {
          loanId: loan.id,
          code: `PAY-${installmentId}-${Date.now()}`,
          date: paymentDate,
          amount: paymentAmount,
          type: "Credit",
        },
      });

      return true;
    });

    res.status(200).json({
      message: `Installment ${installmentId} marked Paid and loan updated.`,
    });
  } catch (error) {
    console.error("Error updating payment status:", error.message);
    res.status(500).json({ error: error.message });
  }
};
