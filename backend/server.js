import path from "node:path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";

import connectMongoDB from "./db/connectMongoDB.js";


dotenv.config();
const app = express();

// Images arrive as base64 inside the request body, so only the routes that take them
// accept more than the default 100 KB. Keep this above the budgets in frontend/src/lib/image.js.
const IMAGE_BODY_LIMIT = "5mb";

app.use(
  ["/api/posts/create", "/api/users/update"],
  express.json({ limit: IMAGE_BODY_LIMIT }),
  express.urlencoded({ extended: true, limit: IMAGE_BODY_LIMIT })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// Keeps unknown API routes as JSON errors, instead of falling through to the web page below.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// In development Vite serves the frontend. In production Express serves the built files,
// and any other path gets index.html so React Router can handle it, including on a reload.
if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(import.meta.dirname, "../frontend/dist");

  app.use(express.static(frontendDist));
  app.get("/*splat", (req, res) => {
    res.sendFile("index.html", { root: frontendDist });
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
});