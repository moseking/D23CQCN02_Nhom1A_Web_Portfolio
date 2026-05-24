const mongoose =
  require("mongoose");

const userSchema =
  new mongoose.Schema(
    {
      username: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      password: {
        type: String,
        required: true,
        minlength: 6,
      },

      avatar: {
        type: String,
        default: "",
      },

      bio: {
        type: String,
        default: "",
      },

      role: {
        type: String,
        enum: [
          "user",
          "moderator",
          "admin",
        ],
        default: "user",
      },

      status: {
        type: String,
        enum: [
          "active",
          "banned",
        ],
        default: "active",
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "User",
    userSchema
  );
