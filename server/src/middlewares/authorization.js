import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default async function authorization(req, res, next) {
  try {
    // 1. Get the token from the cookie
    const token = req.cookies.token;

    // 2. Check if token exists
    if (!token) {
      return res.status(403).json("Not Authorized");
    }

    // 3. Verify the token using your secret key
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the user ID to the request object (so we can use it in routes)
    req.user = payload.user;
    
    // 5. Continue to the next step (the actual route)
    next();
    
  } catch (err) {
    console.error(err.message);
    return res.status(403).json("Not Authorized");
  }
}