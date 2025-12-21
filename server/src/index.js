import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser"; 

// Import all route modules
import authRoutes from "./routes/auth.js"; 
import customerRoutes from "./routes/Customer.route.js";
import loanRoutes from "./routes/Loans.route.js";
import { getDashboardSummary } from "./controllers/Dashboard.controller.js";
// import installmentRoutes from "./routes/Installment.route.js"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser()); 

// ✅ CORS: Correct setup for Cookies
app.use(cors({
  origin: "https://www.mgfinances.com", // MUST match your React frontend URL exactly
  credentials: true                // Required for cookies to work
}));

// ✅ Mount Routes
app.use("/auth", authRoutes);
 app.get("/summary", getDashboardSummary);
app.use("/customers", customerRoutes);
app.use("/loans", loanRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("You are at home");
});

// Static file serving
app.use("/uploads", express.static("uploads"));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});