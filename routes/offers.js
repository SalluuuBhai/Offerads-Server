var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { UserModel } = require('../schemas/userSchema');
const { OffersPostModel } = require('../schemas/offerPostSchema');
const { SendOfferEmail } = require("../common/offerSendEmail");
const mongoose = require("mongoose");
const { dbUrl } = require("../common/dbConfig");
mongoose.connect(dbUrl);

const API = 'http://localhost:3000'


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

// module.exports = router;

//get all offers 
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

    // // Send offer to subscribed customers via email
    // const subscribedCustomers = await getSubscribedCustomers();
    // if (subscribedCustomers.length > 0) {
    //   const offerURL = `https://offerads.netlify.app/offerview/${newOffer._id}`; // Replace with your offer URL structure
    //   const offerText = "View Offer";
    //   await SendOfferEmail(
    //     subscribedCustomers.map((customer) => customer.email),
    //     offerURL,
    //     offerText,
    //     newOffer.offerTitle
    //   );
    // }

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

router.get("/getoffer/:offerID", async (req, res) => {
  try {
      const { offerID } = req.params;
      console.log(offerID);
      const offer = await OffersPostModel.findOne({ offerID: offerID }); // Assuming your model is named OfferModel
      console.log("offer:" , offer);
      if (offer) {
          res.status(200).send({
              offer,
              message: "Offer Data Successful",
          });
      } else {
          res.status(404).send({
              message: "Offer Data Not Found",
          });
      }
  } catch (error) {
      res.status(500).send({ message: "Internal Server Error !!!", error });
  }
});

// Backend (Express) - Update offer post route
router.put("/offer-post-update/:offerID", async (req, res) => {
  try {
    const offerID = req.params.offerID;
    const offerData = req.body.offerPostData;
    console.log("Check" , offerID, offerData);
    const existingOffer = await OffersPostModel.findOne({ offerID: offerID });
    console.log("Check1", existingOffer);

    if (existingOffer) {
      existingOffer.offerTitle = offerData.offerTitle || existingOffer.offerTitle;
      existingOffer.offerContent = offerData.offerContent || existingOffer.offerContent;
      existingOffer.offerValidity = offerData.offerValidity || existingOffer.offerValidity;
      existingOffer.image = offerData.image || existingOffer.image;

      const updatedOffer = await existingOffer.save();
      console.log("updatedOffer", updatedOffer);
      res.status(200).send({
        message: "Offer post updated successfully.",
        offer: updatedOffer,
      });
    } else {
      res.status(404).send({ message: "Offer not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});


// Backend (Express) - Update offer post route
router.put("/offer-post-update-expo/:offerID", async (req, res) => {
  try {
    const offerID = req.params.offerID;
    const offerData = req.body.offerPostData;
    console.log("Check" , offerID, offerData);
    const existingOffer = await OffersPostModel.findById({ _id: offerID });
    console.log("Check1", existingOffer);

    if (existingOffer) {
      existingOffer.offerTitle = offerData.offerTitle || existingOffer.offerTitle;
      existingOffer.offerContent = offerData.offerContent || existingOffer.offerContent;
      existingOffer.offerValidity = offerData.offerValidity || existingOffer.offerValidity;
      existingOffer.image = offerData.image || existingOffer.image;

      const updatedOffer = await existingOffer.save();
      console.log("updatedOffer", updatedOffer);
      res.status(200).send({
        message: "Offer post updated successfully.",
        offer: updatedOffer,
      });
    } else {
      res.status(404).send({ message: "Offer not found." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
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