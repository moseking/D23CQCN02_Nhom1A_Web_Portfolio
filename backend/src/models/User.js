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
        minlength: 8,
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

      isVerified: {
        type: Boolean,
        default: false,
      },

      verifyOTP: {
        type: String,
        default: "",
      },

      verifyOTPExpire: {
        type: Date,
        default: null,
      },

      resetPasswordOtp: {
        type: String,
        default: "",
      },

      resetPasswordOtpExpires: {
        type: Date,
        default: null,
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
