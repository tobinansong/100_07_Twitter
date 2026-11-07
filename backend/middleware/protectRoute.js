import User from "../models/user.models.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.userId = user._id;
    next();
  } catch (error) {
    console.error(`Error in protectRoute middleware: ${error.message}`);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default protectRoute;