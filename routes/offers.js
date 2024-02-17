var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { UserModel } = require('../schemas/userSchema');
const { OffersPostModel } = require('../schemas/offerPostSchema');
const mongoose = require("mongoose");
const { dbUrl } = require("../common/dbConfig");
mongoose.connect(dbUrl);

const API = 'http://localhost:3000'


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;
router.get("/showoffer/:userId", async function (req, res) {
  try {
    const userId = req.params.userId;
    let offersPosts = await OffersPostModel.find({ userID: userId });

    res.status(200).send({
      offersPosts,
      message: "Offers Data Fetch Successful!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});


router.post("/offerpost", async (req, res) => {
  try {
    console.log("Received request to create a new offer:", req.body);

    const { offerTitle, offerContent, offerValidity, image, userID } = req.body;

    const offerID = Math.floor(1000 + Math.random() * 9000);
    // Create a new offer post
    const newOffer = await OffersPostModel.create({
      offerID,
      offerTitle,
      offerContent,
      offerValidity,
      image,
      userID,
    });

    console.log("Offer created successfully:", newOffer);

    res.status(201).json({
      message: "Offer created successfully.",
      offer: newOffer,
    });
  } catch (error) {
    console.error("Error creating offer:", error);

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Delete an offer post by ID
router.delete("/deleteoffer/:offerId", async (req, res) => {
  try {
    const { offerId } = req.params;

    // Find and delete the offer by ID
    const deletedOffer = await OffersPostModel.findOneAndDelete({
      offerID: offerId,
    });

    if (!deletedOffer) {
      return res.status(404).json({
        message: "Offer not found",
      });
    }

    console.log("Offer deleted successfully:", deletedOffer);

    res.status(200).json({
      message: "Offer deleted successfully.",
      offer: deletedOffer,
    });
  } catch (error) {
    console.error("Error deleting offer:", error);

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});


module.exports = router;