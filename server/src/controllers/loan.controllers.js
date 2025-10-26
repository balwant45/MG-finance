// Fetch all loans for a specific customer
export const getCustomerLoans = async (req, res) => {
  const customerId = parseInt(req.params.id);
  if (isNaN(customerId)) return res.status(400).json({ error: 'Invalid customer ID' });

  try {

  console.log("Fetching loans for customer ID:", customerId);
    const loans = await prisma.loan.findMany({
      where: { customerId },
      include: {
        guarantors: { include: { guarantor: true } },
        installments: true,
        transactions: true
      }
    });

    res.json(loans);
  } catch (error) {
    console.error('Error fetching customer loans:', error.message);
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
