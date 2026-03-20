/* CoreInventory/backend/src/utils/email.js */
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using your email service 
  // For Gmail, enable 2-step verification and use an "App Password"
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    // Check if EMAIL_FROM is set, otherwise use SMTP_USER
    from: process.env.EMAIL_FROM || `"Inventory App" <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // You can also send HTML
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;