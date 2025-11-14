import express from "express";
// Import controller functions for customer operations

import {
   getCustomerById, // Fetch a single customer by ID
  createCustomer, // Create a new customer with loan and optional guarantor
  searchCustomers, // Search customers by name or contact number
  getCustomerProfile, //GET complete customer data
  addLoanToCustomer, //add new loan to existing customer
  
} from "../controllers/Customer.controller.js";
 import localUpload from "../middlewares/localUpload.middleware.js";
// Middleware for validating customer and loan data before creation

 import { validateCustomerLoan } from "../middlewares/loanValidation.middleware.js";

 //import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();
const prisma = new PrismaClient();

// router.get("/", getCustomerById);
router.get("/search", searchCustomers);

// Middleware for handling profile image upload via Cloudinary
router.post("/", localUpload.single("profileImage"), validateCustomerLoan, createCustomer);

router.get("/:id/profile", getCustomerProfile);

router.post("/:id/loans", addLoanToCustomer);
/**
 * @route   GET /customers
 * @desc    Fetch all customers from the database
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error.message);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

/**
 * @route   GET /customers/search
 * @desc    Search customers by name or contact number
 * @access  Public
 */
router.get("/search", searchCustomers);


/**
 * @route   POST /customers
 * @desc    Create a new customer with loan and optional guarantor
 *          - Accepts profile image upload
 *          - Validates customer and loan data
 * @access  Public
 */
router.post(
  "/",
  localUpload.single("profileImage"), // Handles image upload to Cloudinary
  validateCustomerLoan, // Validates customer, loan, and guarantor fields
  createCustomer // Creates customer with nested loan and guarantor
);
/**
 * @route   GET /customers/:id/profile
 * @desc    Fetch full customer profile with loans and guarantors
 * @access  Public
 */
router.get("/:id/profile", getCustomerProfile);
/**
 * @route   GET /customers/:id/loans
 * @desc    Fetch all loans for a specific customer
 * @access  Public
 */
// router.get("/:id/loans", getCustomerLoans);

/**
 * @route   POST /customers/:id/loans
 * @desc    Add a new loan to an existing customer
 * @access  Public
 */
router.post("/:id/loans", addLoanToCustomer);

/**
 * @route   GET /customers/loans/:id/summary
 * @desc    Get loan summary including balance and EMI info
 * @access  Public
 */
// router.get("/loans/:id/summary", getLoanSummary);


router.get("/:id", getCustomerById);

// 🔧 Future enhancements (to be implemented later)
// router.put('/:id', updateCustomer);     // Update customer details
// router.delete('/:id', deleteCustomer);  // Delete or archive customer

export default router;
