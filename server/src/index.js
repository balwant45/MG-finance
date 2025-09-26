import express from "express";
import dotenv from "dotenv";
import customerRoutes from "./routes/Customer.route.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use("/customers", customerRoutes);

app.use(express.json());
app.get("/", (req, res) => {
  res.send("You are at home");
});

app.use("/uploads", express.static("uploads"));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
