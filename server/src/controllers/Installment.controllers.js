
//create installments from loan data
export const generateInstallmentsForLoan = async (loanId) => {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new Error("Loan not found");

  const installments = [];
  let balance = parseFloat(loan.totalAmount);

  for (let i = 1; i <= loan.totalEmi; i++) {
    const emiAmount = parseFloat(loan.emiAmount);
    const dueDate = new Date(loan.loanDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    installments.push({
      srNo: i,
      dueDate,
      emiAmount,
      amount: 0,
      balance: balance - emiAmount,
      status: "Pending",
      loanId: loanId
    });

    balance -= emiAmount;
  }

  await prisma.installment.createMany({ data: installments });
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
