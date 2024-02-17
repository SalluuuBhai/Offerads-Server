require("dotenv").config();
const nodemailer = require("nodemailer");

async function SendVerificationEmail(to, url, text, name) {
  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.email",
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.NODE_MAILER_USER, // generated ethereal user
        pass: process.env.NODE_MAILER_PASSWORD, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Offerads" <md.salmanfaris03@gmail.com>', // sender address
      to: to, // list of receivers
      subject: "VERIFY YOUR ACCOUNT", // Subject line
      html: `
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap"
        rel="stylesheet"
      />
      <title>Passioncorners | Account Activation</title>
      <style>
        body {
          background-color: #333333;
          height: 100vh;
          font-family: "Roboto", sans-serif;
          color: #fff;
          position: relative;
          text-align: center;
        }
        .container {
          max-width: 700px;
          width: 100%;
          height: 100%;
          margin: 0 auto;
        }
        .wrapper {
          padding: 0 15px;
        }
        .card {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
        }
        span {
          color: #ffc107;
        }
        button {
          padding: 1em 6em;
          border-radius: 5px;
          border: 0;
          background-color: hsl(45, 100%, 51%);
          transition: all 0.3s ease-in;
          cursor: pointer;
        }
        button:hover {
          background-color: hsl(45, 70%, 51%);
          transition: all 0.3s ease-in;
        }
        .spacing {
          margin-top: 5rem;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="wrapper">
          <div class="card">
            <h1><span>Welcome to Offerads</span> ${name}</h1>
            <p>Please click the button below to verify your account. 🙂</p>
            <a href=${url}><button>${text}</button></a>
            <p class="spacing">
              If the button above does not work, please navigate to the link
              provided below 👇🏻
            </p>
            <div>${url}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
}

module.exports = { SendVerificationEmail };
