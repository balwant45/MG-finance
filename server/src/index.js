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
import { handleContactForm } from "./controllers/Contact.controller.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser()); 

const allowedOrigins = [
  "https://www.mgfinances.com",
  "http://localhost:5173" 
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
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
app.post("/contact", handleContactForm);
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});