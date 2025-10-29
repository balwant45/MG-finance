import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // ✅ Import CORS

// Import all route modules
import customerRoutes from "./routes/Customer.route.js";
import loanRoutes from "./routes/Loans.route.js";
// import installmentRoutes from "./routes/Installment.route.js"; // optional

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for your frontend origin
app.use(cors({
  origin: "http://localhost:5173", // or use "*" to allow all origins
  credentials: true
}));

app.use(express.json());

// Mount routes
app.use("/customers", customerRoutes);
app.use("/loans", loanRoutes);
// app.use("/installments", installmentRoutes); // optional

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