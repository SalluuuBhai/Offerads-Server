const mongoose = require("mongoose");
const { UserModel } = require("./userSchema");

const OffersPostSchema = new mongoose.Schema(
  {
    offerID: {
      type: String,
      required: true,
    },
    
    offerTitle: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },

    offerContent: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500,
    },

    offerValidity: {
      type: Date,
      required: true,
    },

    image: {
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

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },

  {
    collection: "offersPosts",
    versionKey: false,
  },

  { timestamps: true }
);

let OffersPostModel = mongoose.model("offersPost", OffersPostSchema);
module.exports = { OffersPostModel };
