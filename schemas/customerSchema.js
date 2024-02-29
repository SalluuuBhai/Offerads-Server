const mongoose = require("mongoose");
const { UserModel } = require("./userSchema");

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
