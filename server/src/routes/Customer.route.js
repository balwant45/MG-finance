import express from 'express';
import { PrismaClient } from '@prisma/client';
import { getCustomerById } from '../controllers/Customer.controller.js';
import { createCustomer } from '../controllers/Customer.controller.js';
import localUpload from '../middlewares/localUpload.middleware.js';
import { searchCustomers } from '../controllers/Customer.controller.js';

const router = express.Router();
const prisma = new PrismaClient();

// GET /customers
router.get('/', async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

router.get('/search',searchCustomers )
// get /customers/:id
router.get('/:id', getCustomerById);

// all routes
// router.post('/', createCustomer);

router.post('/', localUpload.single('profileImage'), createCustomer);

// router.put('/:id', updateCustomer);
// router.delete('/:id', deleteCustomer);

export default router;
