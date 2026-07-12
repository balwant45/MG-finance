// server/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db/pisma.js"; 
import { jwtGenerator } from "../utils/jwtGenerator.js";
import authorization from "../middlewares/authorization.js"; 

const router = express.Router();

// LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json("Password or Email is incorrect");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json("Password or Email is incorrect");
    }

    const token = jwtGenerator(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //for local development, you can use "lax" or "strict"
      maxAge: 3600000 
    });

    return res.json({isAuthenticated: true, user:{
      id:user.id,
      name:user.name,
      email:user.email
    } });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// ✅ FIXED: VERIFY ROUTE (Using the imported middleware)
// ✅ UPGRADED: VERIFY / ME ROUTE
router.get("/verify", authorization, async (req, res) => {
  try {
    // req.user contains the ID parsed from the JWT by your authorization middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user }, 
      select: { 
        id: true, 
        name: true, 
        email: true 
      }
    });

    if (!user) {
      return res.status(404).json("User not found");
    }

    // Return the user details instead of just 'true'
    res.json({ isAuthenticated: true, user: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// LOGOUT ROUTE
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logged out successfully" });
});

export default router;
