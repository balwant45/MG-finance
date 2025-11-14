import express from "express";
import {
  getDailyCollectionData,
  
  getLoanSummary,
  makeLoanPayment
} from "../controllers/loan.controllers.js";

const router = express.Router();

// router.get("/:id/loans", getCustomerLoans);
router.get("/loans/:id/summary", getLoanSummary);
router.post("/loans/:id/payments", makeLoanPayment);
router.get("/daily-collection", getDailyCollectionData);

export default router;
