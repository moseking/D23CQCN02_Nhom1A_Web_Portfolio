const express = require("express");
const cors = require("cors");
const postRoutes = require("./routes/postRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.use("/api/posts", postRoutes);

app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((error, req, res, next) => {
  const isPayloadTooLarge = error.type === "entity.too.large";
  const isMongoDocumentTooLarge =
    error.message?.includes("offset") || error.message?.includes("BSONObj size");
  const statusCode = isPayloadTooLarge || isMongoDocumentTooLarge ? 413 : error.statusCode || 500;
  const message = isPayloadTooLarge
    ? "Request media is too large. Please upload a smaller file or use a direct media URL."
    : isMongoDocumentTooLarge
      ? "Media is too large for MongoDB. Please upload a smaller file or use a direct media URL."
      : error.name === "ValidationError"
        ? Object.values(error.errors).map((item) => item.message).join(", ")
        : error.message || "Server error";

  res.status(statusCode).json({ success: false, message });
});

module.exports = app;
