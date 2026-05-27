const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const searchRoutes = require("./routes/searchRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const adminRoutes = require("./routes/adminRoutes");
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin",adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


app.use((error, req, res, next) => {
  const isPayloadTooLarge = error.type === "entity.too.large";
  const isMongoDocumentTooLarge =
    error.message?.includes("offset") ||
    error.message?.includes("BSONObj size");

  const statusCode =
    isPayloadTooLarge || isMongoDocumentTooLarge
      ? 413
      : error.name === "ValidationError"
      ? 400
      : error.statusCode || 500;

  const message = isPayloadTooLarge
    ? "Request media is too large. Please upload a smaller file or use a direct media URL."
    : isMongoDocumentTooLarge
    ? "Media is too large for MongoDB. Please upload a smaller file or use a direct media URL."
    : error.name === "ValidationError"
    ? Object.values(error.errors)
        .map((item) => item.message)
        .join(", ")
    : error.message || "Server error";

  res.status(statusCode).json({
    success: false,
    message,
  });
});

module.exports = app;
