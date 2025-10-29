
import express from "express";
import dotenv from "dotenv";

// Import all route modules
import customerRoutes from "./routes/Customer.route.js";
import loanRoutes from "./routes/Loans.route.js";
// import installmentRoutes from "./routes/Installment.route.js"; // if you created this

dotenv.config();
// Configure CORS
const corsOptions = {
  origin: 'http://localhost:5173', // Allow only your frontend's origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow specific HTTP methods
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions)); // Use CORS middleware with your options


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount routes
app.use("/customers", customerRoutes);
app.use("/loans", loanRoutes);
// app.use("/installments", installmentRoutes); // optional, if you created this

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
