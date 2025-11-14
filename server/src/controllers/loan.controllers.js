// Fetch all loans for a specific customer
// In your loan.controllers.js file:


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
const totalPaid = loan.installments?.reduce((sum, inst) => sum + parseFloat(inst.amount), 0) || 0;
    const totalAmount = parseFloat(loan.totalAmount) || 0;
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
        balance: new Prisma.Decimal(parseFloat(loan.balance || loan.totalAmount) - parseFloat(amount)),
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
        // Fetch all installments (or transactions) that are due/paid recently.
        // I will use Installments as they track the EMI details.
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const collectionEntries = await prisma.installment.findMany({
            where: {
                // You might want to filter by installments due today or recently paid/unpaid
                // Example: Fetch all installments with a due date in the last 7 days
                // dueDate: {
                //     gte: new Date(new Date().setDate(new Date().getDate() - 7)), 
                // }
            },
            orderBy: {
                dueDate: 'asc', // Or by payment date/creation date
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

        // Map the complex data structure to the simple table structure
        const formattedData = collectionEntries.map(i => ({
            srNo: i.srNo,
            particulars: `${i.loan.customer.name} s/o ${i.loan.customer.fatherName}`,
            installmentAmount: i.emiAmount?.toString() || '0.00', // Expected EMI
            status: i.status, // Pending, Paid, Overdue
            debitAmount: i.amount?.toString() || '0.00', // Actual paid amount
            creditAmount: '0.00', // Assuming all incoming payments are debits on the customer's ledger, and this column is not actively used.
            notes: i.status === 'Paid' ? 'Paid' : (i.status === 'Overdue' ? 'Overdue' : 'Pending'),
        }));

        res.json(formattedData);

    } catch (error) {
        console.error('Error fetching daily collection data:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};