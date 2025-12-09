// server/utils/jwtGenerator.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function jwtGenerator(user_id) {
  const payload = {
    user: user_id,
  };

  // Make sure you have JWT_SECRET in your .env file!
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}