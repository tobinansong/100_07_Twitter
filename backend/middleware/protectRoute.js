import jwt from "jsonwebtoken";

const protectRoute = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
};

export default protectRoute;
