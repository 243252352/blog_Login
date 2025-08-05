const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function sendMail(to, subject, htmlBody) {
  const mailOptions = {
    from: `"Blog App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlBody,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendMail };
