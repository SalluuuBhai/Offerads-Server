var express = require("express");
var router = express.Router();
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");
const fs = require("fs").promises;
const { SendVerificationEmail } = require("../common/verficationEmail.js");
const {
  hashPassword,
  hashCompare,
  createToken,
  validateToken,
  createForgetToken,
  secretKey,
} = require("../common/auth");
const { SendResetEmail } = require("../common/passwordReset.js");
const { UserModel } = require("../schemas/userSchema");
const mongoose = require("mongoose");
const { dbUrl } = require("../common/dbConfig");
mongoose.connect(dbUrl);

const API = "http://localhost:3000";

/* GET users listing. */
router.get("/", validateToken, async function (req, res) {
  try {
    let users = await UserModel.find();
    res.status(200).send({
      users,
      message: "Users Data Fetch Successful!",
    });
  } catch (error) {
    // console.error(error); // Log the error for debugging purposes

    res.status(500).send({
      message: "Internal Server Error",
      error: error.message, // Send only the error message to the client for security reasons
    });
  }
});

// router.get("/:id", async (req, res) => {
//   try {
//     let user = await UserModel.find({ _id: req.params.id });
//     res.status(201).send({
//       user,
//       message: "User Data Successfull",
//     });
//   } catch (error) {
//     res.status(500).send({
//       message: "Internal Server Error !!!",
//     });
//   }
// });

// router.get('/:token', async (req, res) => {
//   try {
//     const token = req.headers.authorization.split(' ')[1];

//     // Decode the token
//     const decodedToken = jwt.verify(token, secretKey);
//     console.log('Decoded Token:', decodedToken);
//     // Modify this part based on your actual data fetching logic
//     const user = await UserModel.findOne({ _id: decodedToken.userId  });

//     if (user) {
//       res.json({ user, message: 'User Data Successful' });
//     } else {
//       res.status(404).json({ error: 'User not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: 'Internal Server Error !@!' });
//   }
// });

router.get("/getuser", validateToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log("Token :", token);
    const decodedToken = jwt.verify(token, secretKey);
    console.log("Decoded Token:", decodedToken);
    const user = await UserModel.findOne({ _id: decodedToken.id });
    console.log(user);

    if (user) {
      res.status(200).send({
        user,
        message: "User Data Successful",
      });
    } else {
      res.status(404).send({
        message: "User Data Failure",
      });
    }

    // let data = await jwt.decode(req.body.token);
    // req.body.token = data.email;
    // let user = await UserModel.findOne({ email: req.body.token });

    // res.status(201).send({
    //   user,
    //   message: "User Fetch Data Successfull",
    // });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).send({ message: "Token Expired!" });
    } else if (error.name === "JsonWebTokenError") {
      res.status(401).send({ message: "Invalid Token!" });
    } else {
      res.status(500).send({ message: "Internal Server Error !!!", error });
    }
  }
});

router.get("/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    const user = await UserModel.findOne({ _id: userID });
    console.log(user);

    if (user) {
      res.status(200).send({
        user,
        message: "User Data Successful",
      });
    } else {
      res.status(404).send({
        message: "User Data Failure",
      });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error !!!", error });
  }
});

router.get("/user-details", validateToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    const decodedToken = jwt.verify(token, secretKey);
    const user = await UserModel.findOne({ _id: decodedToken.id });

    if (user) {
      res.status(200).send({
        user,
        message: "User Details Fetched Successfully",
      });
    } else {
      res.status(404).send({
        message: "User Details Not Found",
      });
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).send({ message: "Token Expired!" });
    } else if (error.name === "JsonWebTokenError") {
      res.status(401).send({ message: "Invalid Token!" });
    } else {
      res.status(500).send({ message: "Internal Server Error", error });
    }
  }
});

// User Register Router
//  1

router.post("/register", async (req, res) => {
  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });

    if (!existingUser) {
      const hashedPassword = await hashPassword(req.body.password);
      req.body.password = hashedPassword;
      const newUser = await UserModel.create(req.body);
      // console.log(newUser)
      let verificationToken = await createToken({
        email: newUser.email,
        shopName: newUser.shopName,
        id: newUser._id,
      });

      // Send verification email
      const verificationUrl = `${API}/verify/${verificationToken}`;
      await SendVerificationEmail(
        newUser.email,
        verificationUrl,
        "Verify Your Account",
        newUser.shopName
      );

      res
        .status(201)
        .send({
          message: "User registered successfully. Verification email sent.",
        });
    } else {
      res.status(400).send({
        message: "User Already Exists!",
      });
    }
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// Resend email Verfication
router.post("/resend-verification-email", async (req, res) => {
  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });

    if (existingUser && !existingUser.verified) {
      let verificationToken = await createToken({
        email: existingUser.email,
        shopName: existingUser.shopName,
        id: existingUser._id,
      });

      // Resend verification email
      const verificationUrl = `${API}/verify/${verificationToken}`;
      await SendVerificationEmail(
        existingUser.email,
        verificationUrl,
        "Verify Your Account",
        existingUser.shopName
      );

      res
        .status(200)
        .send({ message: "Verification email resent successfully." });
    } else if (existingUser && existingUser.verified) {
      res.status(400).send({
        message: "User is already verified.",
      });
    } else {
      res.status(404).send({
        message: "User not found.",
      });
    }
  } catch (error) {
    console.error(error);

    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
//Email Verfication
// router.post("/send-verification-email", async (req, res) => {
//   try {
//     // console.log(req.body.id)
//     if (req.headers.authorization) {
//       let token = req.headers.authorization.split(" ")[1];
//       let data = await jwt.decode(token);
//       console.log(token, data);
//       let updatedData = await UserModel.findOneAndUpdate(
//         { _id: data.id },
//         { verified: true }
//       );

//          // Generate a unique QR code for the user's QR page
//       const qrCodeData = `http://localhost:3000/user/${data.id}`;
//       const qrCodeFileName = `qrcodes/${data.id}.png`;

//       // Generate and save the QR code image
//       QRCode.toFile(qrCodeFileName, qrCodeData, (err) => {
//         if (err) {
//           console.error('Error generating QR code:', err);
//           return res.status(500).send('Internal Server Error');
//         }

//         console.log('QR code generated successfully');
//         // Update the user's QR code data in the database
//         updatedData.userQRCode = qrCodeFileName;
//         updatedData.save();

//         return res.status(200).send('Verification successful');
//       });

//       updatedData.save();

//     } else {
//       res.status(401).send({ message: "Token Not Found" });
//     }
//   } catch (error) {
//     console.error("Error sending verification email:", error);
//     res.status(500).send({ message: "Internal Server Error", error });
//   }
// });
router.post("/send-verification-email", async (req, res) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      let data = await jwt.decode(token);

      // const qrCodeData = `${API}/user/${data.id}.png`;
      // const qrData = data.id; // Unique identifier
      //   const qrCodeImage = await QRCode.toDataURL(qrData);
      //   console.log(qrCodeImage);

      // updatedData.userQRCode =  qrCodeImage;

      let updatedData = await UserModel.findOneAndUpdate(
        { _id: data.id },
        { verified: true }
        // { userQRCode: qrCodeImage}
      );

      // Generate a unique QR code for the user's QR page

      // Send qrCodeImage to the user (e.g., via email)
      // res.send({ qrCodeImage });
      // const qrCodeFileName = `qrcodes/${data.id}.png`;

      // // Create the 'qrcodes' directory if it doesn't exist
      // await fs.mkdir('qrcodes', { recursive: true });

      // // Generate and save the QR code image
      // await QRCode.toFile(qrCodeFileName, qrCodeData);

      // console.log('QR code generated successfully');
      // Update the user's QR code data in the database

      await updatedData.save();

      return res.status(200).send("Verification successful");
    } else {
      res.status(401).send({ message: "Token Not Found" });
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

// QR Code send after user verify email
// router.get('/userQRCode', async ( req, res ) =>{
//   try {
//     let token = req.headers.authorization.split(' ')[1];
//     let data = await jwt.decode(token);
//     const url = `${API}/user/${data.id}`;

//     QRCode.toDataURL(url, (err, qrCodeUrl) => {
//       if (err) {
//         console.error('Error generating QR code:', err);
//         res.status(500).send('Internal Server Error');
//       } else {
//         res.status(200).send(qrCodeUrl);
//       }
//     });
//   } catch (error) {
//     console.error('Error generating QR code:', error);
//     res.status(500).send('Internal Server Error');
//   }
// })

router.put("/update-profile", async (req, res) => {
  try {
    const userData = req.body.updatedUserData;
    const userId = req.body.id;
    const existingUser = await UserModel.findById(userId);
    console.log("EX:", existingUser);
    console.log(" QR : ", req.body.userQRCode);

    if (existingUser) {
      if (req.body.userQRCode) {
        existingUser.userQRCode =
          req.body.userQRCode || existingUser.userQRCode;
      } else if (userData) {
        existingUser.shopName = userData.shopName || existingUser.shopName;
        existingUser.shopAddress =
          userData.shopAddress || existingUser.shopAddress;
        existingUser.shopLocation =
          userData.shopLocation || existingUser.shopLocation;
        existingUser.mobileNumber =
          userData.mobileNumber || existingUser.mobileNumber;

        existingUser.profilePicture =
          userData.profilePicture || existingUser.profilePicture;
      }

      // Add other fields that you want to update

      // Save the updated user back to the database
      const updatedUser = await existingUser.save();

      // Respond with a success message and the updated user data
      res
        .status(200)
        .send({
          message: "User profile updated successfully.",
          user: updatedUser,
        });
    } else {
      // If the user is not found, respond with a 404 status
      res.status(404).send({ message: "User not found." });
    }
  } catch (error) {
    // Handle errors and respond with a 500 status
    console.error(error);
    res
      .status(500)
      .send({ message: "Internal Server Error", error: error.message });
  }
});

// router.put('/update-profile', async (req, res) => {
//   try {
//     // Assume you have some form of authentication to identify the user (e.g., JWT)
//     const userId = req.body.id;

//     // Find the user by ID
//     const existingUser = await UserModel.findById(userId);

//     if (existingUser) {
//       // Update user details
//       existingUser.shopName = req.body.shopName || existingUser.shopName;
//       existingUser.shopAddress = req.body.shopAddress || existingUser.shopAddress;
//       existingUser.shopLocation = req.body.shopLocation || existingUser.shopLocation;
//       existingUser.mobileNumber = req.body.mobileNumber || existingUser.mobileNumber;
//       existingUser.userQRCode = req.body.userQRCode || existingUser.userQRCode;
//       existingUser.profilePicture = req.body.profilePicture || existingUser.profilePicture
//       // Add other fields that you want to update

//       // Save the updated user
//       const updatedUser = await existingUser.save();

//       res.status(200).send({ message: 'User profile updated successfully.', user: updatedUser });
//     } else {
//       res.status(404).send({ message: 'User not found.' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ message: 'Internal Server Error', error: error.message });
//   }
// });

//User Login Router
router.post("/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (user) {
      //verify the password is correct
      const isPasswordValid = await hashCompare(
        req.body.password,
        user.password
      );

      if (isPasswordValid) {
        //create a new token
        let token = await createToken({
          email: user.email,
          shopName: user.shopName,
          id: user._id,
          verified: user.verified,
        });
        res.status(200).send({
          message: "Login Successful!",
          user: {
            email: user.email,
            shopName: user.shopName,
            id: user._id,
            verified: user.verified,
          },
          token,
        });
      } else {
        res.status(401).send({
          message: "Incorrect Password!",
        });
      }
    } else {
      res.status(400).send({
        message: "User does not exist! Please Register",
      });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging purposes

    res.status(500).send({
      message: "Internal Server Error",
      error: error.message, // Send only the error message to the client for security reasons
    });
  }
});

//Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    let user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      //create token
      let token = await createForgetToken({ id: user._id });

      //send mail
      const url = `${API}/reset-password/${token}`;
      const name = user.shopName;
      const email = user.email;
      SendResetEmail(email, url, "Reset Your Password", name);

      //success
      res
        .status(200)
        .send({ message: "Link Has Been Sent To Your Email Id", token });
    } else {
      res.status(400).send({ message: "Invalid User" });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

router.post("/reset-password", async (req, res) => {
  console.log(req.headers.authorization);
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization.split(" ")[1];
      let data = await jwt.decode(token);
      console.log(token, data);
      let currentTime = Math.floor(+new Date() / 1000);
      console.log(currentTime);
      if (currentTime) {
        let hashedPassword = await hashPassword(req.body.password);
        let user = data;

        let updatedData = await UserModel.findOneAndUpdate(
          { _id: user.id },
          { password: hashedPassword }
        );
        updatedData.save();
        res.status(200).send({ message: "Password Changed Successfully !!!" });
      } else {
        res.status(401).send({ message: "Token Expired Try Again" });
      }
    } else {
      res.status(401).send({ message: "Token Not Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error", error });
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the email is already registered
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new UserModel({ email, password: hashedPassword });
    await newUser.save();

    // Send verification email
    const verificationToken = jwt.sign({ email }, secretKey, {
      expiresIn: "1h",
    });
    const verificationLink = `${API}/verify?token=${verificationToken}`;

    await transporter.sendMail({
      to: email,
      subject: "Email Verification",
      text: `Please click on the following link to verify your email: ${verificationLink}`,
    });

    res
      .status(201)
      .json({ message: "User created. Check your email for verification." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Verification route
router.get("/verify", async (req, res) => {
  try {
    const { token } = req.query;
    const { email } = jwt.verify(token, secretKey);

    // Update user's verification status
    await User.updateOne({ email }, { $set: { isVerified: true } });

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid token or expired" });
  }
});

module.exports = router;
