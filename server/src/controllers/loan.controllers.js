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
        const collectionEntries = await prisma.installment.findMany({
            // Note: Keeping the 'where' clause empty fetches everything.
            // If you have a large database, you MUST add a 'where' clause (e.g., date filter) 
            // to limit the results, otherwise the query could time out.
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

        // ✅ MODIFICATION: Use optional chaining to safely access nested data
        const formattedData = collectionEntries.map(i => {
            const customerName = i.loan?.customer?.name || 'Customer Name N/A';
            const fatherName = i.loan?.customer?.fatherName || 'Father Name N/A';
            const status = i.status || 'Pending';
            
            return {
                // Using nullish coalescing (??) for safer defaults
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
        // Log the exact error message to your Render logs for debugging
        console.error('CRITICAL Error fetching daily collection data:', error.message);
        res.status(500).json({ error: 'Internal server error while processing loan data.' });
    }
};