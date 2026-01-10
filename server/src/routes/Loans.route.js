import express from "express";
import {
  getDailyCollectionData,
  
  getLoanSummary,
  makeLoanPayment,
  updateInstallmentStatus
} from "../controllers/loan.controllers.js";

const router = express.Router();

// router.get("/:id/loans", getCustomerLoans);
router.get("/:id/summary", getLoanSummary);
router.post("/:id/payments", makeLoanPayment);
router.get("/daily-collection", getDailyCollectionData);
router.post("/installments/:id/update-status", updateInstallmentStatus);
export default router;
