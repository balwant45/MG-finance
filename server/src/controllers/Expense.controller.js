import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createExpense = async (req, res) => {
  try {
    const { date, amount, category, paymentMethod, vendor, reference, description, status } = req.body;

    if (!date || !amount || !category || !paymentMethod || !vendor) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newExpense = await prisma.expense.create({
      data: {
        date: new Date(date),
        amount: parseFloat(amount),
        category,
        paymentMethod,
        vendor,
        reference: reference || null,
        description: description || null,
        status: status || "Paid"
      }
    });

    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { search, fromDate, toDate, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    let whereClause = {};

    if (fromDate || toDate) {
      whereClause.date = {};
      if (fromDate) whereClause.date.gte = new Date(fromDate);
      if (toDate) whereClause.date.lte = new Date(toDate);
    }

    if (search) {
      whereClause.OR = [
        { vendor: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [expenses, totalCount] = await prisma.$transaction([
      prisma.expense.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { date: 'desc' }
      }),
      prisma.expense.count({ where: whereClause })
    ]);

    const totalExpensesSum = await prisma.expense.aggregate({
      where: whereClause,
      _sum: { amount: true }
    });

    res.status(200).json({
      expenses,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / take),
        currentPage: parseInt(page),
        totalExpensesSum: totalExpensesSum._sum.amount || 0
      }
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount, category, paymentMethod, vendor, reference, description, status } = req.body;

    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(id) },
      data: {
        date: date ? new Date(date) : undefined,
        amount: amount ? parseFloat(amount) : undefined,
        category,
        paymentMethod,
        vendor,
        reference,
        description,
        status
      }
    });

    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.expense.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ message: "Expense deleted successfully." });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};