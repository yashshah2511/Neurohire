// utils/sendEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_ID,
    to: to,          // 🔥 correct recipient
    subject: subject,
    html: html       // 🔥 use html instead of text
  });
};
