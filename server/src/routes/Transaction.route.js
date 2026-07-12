import express from 'express';
import { injectCapital } from '../controllers/Transaction.controller.js';
// Make sure to import your authorization middleware if you are using it to protect routes!
import authorization from '../middlewares/authorization.js'; 

const router = express.Router();

// Route: POST /transactions/capital
router.post('/capital', authorization, injectCapital);

export default router;