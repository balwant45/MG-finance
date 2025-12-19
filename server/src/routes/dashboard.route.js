import express from "express";
import { getDashboardSummary } from "../controllers/Dashboard.controller";

const router = express.Router();

router.get("/summary", getDashboardSummary);

export default router;