const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log("MONGODB_URI is not set. Skipping MongoDB connection.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
