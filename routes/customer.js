var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { UserModel } = require('../schemas/userSchema');
const { CustomerModel } = require('../schemas/customerSchema');
const mongoose = require("mongoose");
const { dbUrl } = require("../common/dbConfig");
mongoose.connect(dbUrl);

const API = 'http://localhost:3000'


router.post("/customerdetails", async (req, res) => {
  try {
    const { userName, mobileNumber, email, shopName, userID } = req.body;

    const existingEmailCustomer = await CustomerModel.findOne({ email, userID });

    if (existingEmailCustomer) {
      return res.status(400).json({
        message: "This Email Already has been Subscribed!",
        customer: existingEmailCustomer,
      });
    }

    // If email is unique, check mobile number
    const existingMobileCustomer = await CustomerModel.findOne({ mobileNumber, userID });

    if (existingMobileCustomer) {
      return res.status(400).json({
        message: "This Mobile Number Already has been Subscribed!",
        customer: existingMobileCustomer,
      });
    }

    // Create a new customer
    const newCustomer = await CustomerModel.create({
      userName,
      mobileNumber,
      email,
      shopName,
      userID,
    });

    res.status(201).json({
      message: "Subscribed successfully.",
      customer: newCustomer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});



  
router.get('/getIpAddress', async (req, res) => {
  const ip = req.ip || req.connection.remoteAddress;
  res.status(201).json({ ip });
});

module.exports = router;