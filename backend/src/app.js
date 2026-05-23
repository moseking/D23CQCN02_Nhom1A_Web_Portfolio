const express = require("express");
const cors = require("cors");
const postRoutes = require("./routes/postRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Backend running" });
});

app.use("/api/posts", postRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message =
    error.name === "ValidationError"
      ? Object.values(error.errors).map((item) => item.message).join(", ")
      : error.message || "Server error";

  res.status(statusCode).json({ success: false, message });
});

module.exports = app;
