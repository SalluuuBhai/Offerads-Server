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
    //   console.log("Received request to create a new customer:", req.body);
  
      const { userName, mobileNumber, userID } = req.body;
  
      // Check if the mobile number already exists
      const existingCustomer = await CustomerModel.findOne({ mobileNumber });
      if (existingCustomer) {
        return res.status(400).json({
          message: "Mobile number already in use. Please choose a different one.",
        });
      }
  
      // Create a new customer
      const newCustomer = await CustomerModel.create({
        userName,
        mobileNumber,
        userID,
      });
  
    //   console.log("Customer created successfully:", newCustomer);
  
      res.status(201).json({
        message: "Subscribed successfully.",
        customer: newCustomer,
      });
    } catch (error) {
    //   console.error("Error creating customer:", error);
  
      res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  });
  


module.exports = router;