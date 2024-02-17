const mongoose = require("mongoose");

const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },

    shopAddress: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },

    shopLocation: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },

    mobileNumber: {
      type: Number,
      required: true,
      trim: true,
      maxLength: 10,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: 'Invalid email address',
      },
    },

    password: {
      type: String,
      required: true,
      trim: true,
      maxLength: 250,
    },

    userQRCode: {
      type: String,
    },

    profilePicture: {
      type: String, // Assuming you store the profile picture URL
    },

    verified: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    collection: "user",
    versionKey: false,
  },

  { timestamps: true }
);

let UserModel = mongoose.model("user", userSchema);
module.exports = { UserModel };
