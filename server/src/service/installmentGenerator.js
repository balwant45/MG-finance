export const generateInstallmentsForLoan = async (loanId) => {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) throw new Error("Loan not found");

  const existing = await prisma.installment.count({ where: { loanId } });
  if (existing > 0) throw new Error("Installments already exist");

  const installments = [];
  let balance = parseFloat(loan.totalAmount);

  for (let i = 1; i <= loan.totalEmi; i++) {
    const emiAmount = parseFloat(loan.emiAmount);
    const dueDate = new Date(loan.loanDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    installments.push({
      srNo: i,
      dueDate,
      emiAmount: new Prisma.Decimal(emiAmount),
      amount: new Prisma.Decimal(0),
      balance: new Prisma.Decimal(balance),
      status: "Pending",
      loanId
    });

    balance -= emiAmount;
  }

  await prisma.installment.createMany({ data: installments });
};
