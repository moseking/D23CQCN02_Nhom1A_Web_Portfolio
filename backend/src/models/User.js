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

      portfolio: {
        title: {
          type: String,
          default: "",
        },

        location: {
          type: String,
          default: "",
        },

        website: {
          type: String,
          default: "",
        },

        layout: {
          type: String,
          enum: [
            "showcase",
            "grid",
            "studio",
          ],
          default: "showcase",
        },

        theme: {
          type: String,
          enum: [
            "",
            "aurora",
            "gallery",
            "noir",
            "mint",
          ],
          default: "",
        },
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

      followers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],

      following: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
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
