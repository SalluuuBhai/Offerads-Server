require("dotenv").config();
const nodemailer = require("nodemailer");

async function SendEmailToUser(
  senderName,
  senderMail,
  ToEmail,
  subject,
  content
) {
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
      from: `${senderName} <${senderMail}>`, // sender address
      to: ToEmail, // list of receivers
      subject: subject, // Subject line
      html: content,
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  } catch (error) {}
}

module.exports = { SendEmailToUser };