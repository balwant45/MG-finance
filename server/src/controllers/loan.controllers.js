// Fetch all loans for a specific customer
// In your loan.controllers.js file:

// Fetch all loan data for a specific customer, consolidated for the frontend
export const getCustomerLoans = async (req, res) => {
  const customerId = parseInt(req.params.id);
  if (isNaN(customerId)) return res.status(400).json({ error: 'Invalid customer ID' });

  try {
    // 1. Find the latest loan for the customer
    const loan = await prisma.loan.findFirst({
      where: { customerId },
      orderBy: { startDate: 'desc' }, // Assuming you have a startDate field
      include: {
        installments: true,
        transactions: {
          orderBy: { date: 'desc' }, // Get recent transactions
          take: 5 // Limit to 5 recent transactions
        }
      }
    });

    if (!loan) {
      // Return empty data structure if no loan is found, preventing a frontend crash
      return res.json({
        loanSummary: {},
        transactions: [],
        emiLedger: [] 
      });
    }

    // 2. Perform Loan Calculations (similar to your getLoanSummary)
    const totalPaid = loan.installments?.reduce((sum, inst) => sum + parseFloat(inst.amount), 0) || 0;
    const totalAmount = parseFloat(loan.totalAmount) || 0;
    const remainingBalance = totalAmount - totalPaid;

    // 3. Format the Consolidated Response (as the frontend expects)
    res.json({
      loanSummary: {
        id: loan.id,
        startDate: loan.startDate ? loan.startDate.toISOString().split('T')[0] : 'N/A',
        closingDate: loan.endDate ? loan.endDate.toISOString().split('T')[0] : 'N/A', // Assuming you have an endDate
        amount: loan.totalAmount, // or loan.principalAmount, depending on your schema
        balance: remainingBalance.toFixed(2), // Use calculated balance
        type: loan.loanType,
        status: loan.status,
        tenure: `${loan.totalEmi} months`,
      },
      transactions: loan.transactions.map(t => ({
          date: t.date.toISOString().split('T')[0], 
          amount: t.amount.toString() 
      })) || [],
      emiLedger: loan.installments.map(i => ({
          slNo: i.id, 
          date: i.date.toISOString().split('T')[0], 
          emiAmount: i.amount.toString(),
          debit: i.paymentAmount.toString(), // Assuming this is how you track payments
          balance: i.remainingBalance.toString() // Assuming this is tracked
      })) || [] // installments are being used as the ledger
    });

  } catch (error) {
    console.error('Error fetching consolidated customer loans:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
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
