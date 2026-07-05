import express from 'express';
import {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense
} from '../controllers/Expense.controller.js'; 

const router = express.Router();

// Mount routes to controller functions
router.post('/', createExpense);
router.get('/', getExpenses);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;