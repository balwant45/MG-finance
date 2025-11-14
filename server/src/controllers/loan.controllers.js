// Fetch all loans for a specific customer
// In your loan.controllers.js file:
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma= new  PrismaClient();
//loan status for generating tables
export const getLoanSummary = async (req, res) => {
  const loanId = parseInt(req.params.id);
  if (isNaN(loanId)) return res.status(400).json({ error: 'Invalid loan ID' });

  try {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        installments: true,
        transactions: true
      }
    });

    if (!loan) return res.status(404).json({ error: 'Loan not found' });
// FIX: Ensure calculation handles potential nulls safely, though schema suggests they are Decimal/String.
// Using optional chaining on installments for safety.
const totalPaid = loan.installments?.reduce((sum, inst) => sum + parseFloat(inst.amount.toString()), 0) || 0;
    const totalAmount = parseFloat(loan.totalAmount?.toString() || '0') || 0;
const remainingBalance = totalAmount - totalPaid;

    res.json({
      loanNumber: loan.loanNumber,
      status: loan.status,
      totalAmount: loan.totalAmount,
      emiAmount: loan.emiAmount,
      totalPaid,
      remainingBalance,
      emiPaid: loan.emiPaid,
      totalEmi: loan.totalEmi
    });
  } catch (error) {
    console.error('Error fetching loan summary:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
//recording payment on customer detail page
export const makeLoanPayment = async (req, res) => {
  const loanId = parseInt(req.params.id);
  if (isNaN(loanId)) return res.status(400).json({ error: 'Invalid loan ID' });

  try {
    const { amount, date } = req.body;

    const loan = await prisma.loan.findUnique({ where: { id: loanId } });
    if (!loan) return res.status(404).json({ error: 'Loan not found' });

    const newTransaction = await prisma.transaction.create({
      data: {
        loanId,
        code: `TXN${Date.now()}`,
        date: new Date(date),
        amount: new Prisma.Decimal(amount),
        type: 'Credit'
      }
    });

    await prisma.loan.update({
      where: { id: loanId },
      data: {
        // FIX: Ensure loan.balance/loan.totalAmount are converted to string before parsing for Decimal
        balance: new Prisma.Decimal(
          parseFloat(loan.balance?.toString() || loan.totalAmount?.toString() || '0') - parseFloat(amount)
        ),
        emiPaid: loan.emiPaid + 1
      }
    });

    res.status(201).json({ message: 'Payment recorded', transaction: newTransaction });
  } catch (error) {
    console.error('Error recording payment:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
// New function to fetch all recent installment/transaction data for the daily collection view
export const getDailyCollectionData = async (req, res) => {
    try {
        const collectionEntries = await prisma.installment.findMany({
            where: {
                // ✅ FIX: REMOVE the 'loan' filter entirely because 'loan' and 'customer' 
                // are REQUIRED (non-nullable) fields in your schema.
                // Filtering on required fields is redundant and often leads to the 'isNot' error.
            },
            orderBy: {
                dueDate: 'asc',
            },
            include: {
                loan: {
                    select: {
                        loanType: true,
                        customer: {
                            select: {
                                name: true,
                                fatherName: true,
                            },
                        },
                    },
                },
            },
        });

        const formattedData = collectionEntries.map(i => {
            // These lookups are now guaranteed to work based on your schema design.
            const customerName = i.loan.customer.name;
            const fatherName = i.loan.customer.fatherName;
            const status = i.status || 'Pending';
            
            return {
                srNo: i.srNo ?? 'N/A',
                particulars: `${customerName} s/o ${fatherName}`,
                installmentAmount: i.emiAmount?.toString() || '0.00', 
                status: status, 
                debitAmount: i.amount?.toString() || '0.00',
                creditAmount: '0.00',
                notes: status === 'Paid' ? 'Paid' : (status === 'Overdue' ? 'Overdue' : 'Pending'),
            };
        });

        res.json(formattedData);

    } catch (error) {
        console.error('CRITICAL Error fetching daily collection data:', error.message);
        // Returning the error message for better debugging
        res.status(500).json({ error: 'Internal server error while processing loan data: ' + error.message });
    }
};