const mongoose = require("mongoose");
const validator = require("validator");
const { UserModel } = require("./userSchema");
const { type } = require("os");

const CustomerSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      
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

    shopName: {
      type: String,
    },

    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
      required: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    collection: "customer",
    versionKey: false,
  },

  { timestamps: true }
);

let CustomerModel = mongoose.model("customer", CustomerSchema);
module.exports = { CustomerModel };
