/* CoreInventory/backend/src/utils/email.js */
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter using your email service 
  // For Gmail, enable 2-step verification and use an "App Password"
  const host = process.env.SMTP_HOST ? process.env.SMTP_HOST.replace(/^["']|["']$/g, '') : undefined;
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.replace(/^["']|["']$/g, '') : undefined;
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/^["']|["']$/g, '') : undefined;
  
  const transporter = nodemailer.createTransport({
    host: host,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: user,
      pass: pass,
    },
  });

  const sender = process.env.EMAIL_FROM ? process.env.EMAIL_FROM.replace(/^["']|["']$/g, '') : undefined;
  
  // Define email options
  const mailOptions = {
    // Check if EMAIL_FROM is set, otherwise use SMTP_USER
    from: sender || `"Inventory App" <${user}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // You can also send HTML
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;