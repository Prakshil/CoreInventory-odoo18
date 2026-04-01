const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const sendEmail = require('../utils/email'); // Import the email utility

// Generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.signup = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'User already exists.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: 'VIEWER' },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });

    // Create a welcome notification for the newly created account.
    // Note: This should not block signup if notifications fail for any reason.
    try {
      const hasUnreadWelcome = await prisma.notification.findFirst({
        where: { userId: user.id, type: 'WELCOME', isRead: false },
        select: { id: true },
      });

      if (!hasUnreadWelcome) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            message: 'Welcome to CoreInventory',
            type: 'WELCOME',
          },
        });
      }
    } catch (notificationErr) {
      console.error('Failed to create welcome notification (signup):', notificationErr);
    }

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials.' });
    if (user.isActive === false) return res.status(403).json({ error: 'Account is deactivated.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Create a welcome notification for any user login.
    // Again, don't break login if notification creation fails.
    try {
      const hasUnreadWelcome = await prisma.notification.findFirst({
        where: { userId: user.id, type: 'WELCOME', isRead: false },
        select: { id: true },
      });

      if (!hasUnreadWelcome) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            message: 'Welcome to CoreInventory',
            type: 'WELCOME',
          },
        });
      }
    } catch (notificationErr) {
      console.error('Failed to create welcome notification (login):', notificationErr);
    }

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true }
    });
    if (!user || user.isActive === false) return res.status(401).json({ error: 'Invalid or expired token.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP to database
    await prisma.user.update({
      where: { email },
      data: { resetOtp: otp, otpExpiry }
    });

    // Send the email
    const message = `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset OTP',
        message,
      });

      // In production, NEVER send the OTP in the response for security
      res.json({ 
        message: 'OTP sent to email.',
        // Only include OTP in response for development to make testing easier
        devOtp: process.env.NODE_ENV === 'development' ? otp : undefined 
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // If email fails, clear the OTP fields so the user can try again
      await prisma.user.update({
        where: { email },
        data: { resetOtp: null, otpExpiry: null }
      });
      return res.status(500).json({ error: 'There was an error sending the email. Try again later.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.resetOtp !== otp || new Date() > user.otpExpiry) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashed, resetOtp: null, otpExpiry: null }
    });
    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
